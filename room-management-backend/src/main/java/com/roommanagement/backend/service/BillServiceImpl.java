package com.roommanagement.backend.service;

import com.roommanagement.backend.dto.BillDto;
import com.roommanagement.backend.exception.InvalidBookingException;
import com.roommanagement.backend.exception.ResourceNotFoundException;
import com.roommanagement.backend.model.Bill;
import com.roommanagement.backend.model.Booking;
import com.roommanagement.backend.model.ElectricityReading;
import com.roommanagement.backend.repository.BillRepository;
import com.roommanagement.backend.repository.BookingRepository;
import com.roommanagement.backend.repository.ElectricityReadingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillServiceImpl implements BillService {

    private final BillRepository billRepository;
    private final BookingRepository bookingRepository;
    private final ElectricityReadingRepository readingRepository;

    public BillServiceImpl(BillRepository billRepository,
            BookingRepository bookingRepository,
            ElectricityReadingRepository readingRepository) {
        this.billRepository = billRepository;
        this.bookingRepository = bookingRepository;
        this.readingRepository = readingRepository;
    }

    @Override
    public List<BillDto> getAllBills() {
        return billRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public BillDto getBillById(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + id));
        return mapToDto(bill);
    }

    @Override
    @Transactional
    public BillDto generateBill(Long bookingId, String billingMonth, BigDecimal fallbackUnitRate) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        YearMonth yearMonth;
        try {
            yearMonth = YearMonth.parse(billingMonth);
        } catch (Exception e) {
            throw new InvalidBookingException("Invalid month format YYYY-MM");
        }
        LocalDate monthDate = yearMonth.atDay(1);

        if (billRepository.findByBookingIdAndBillingMonth(bookingId, monthDate).isPresent()) {
            throw new InvalidBookingException("Bill has already been generated for this booking and month");
        }

        YearMonth checkInMonth = YearMonth.from(booking.getCheckInDate());
        if (yearMonth.isBefore(checkInMonth)) {
            throw new InvalidBookingException(
                    "Cannot generate bill for a month before check-in (" + checkInMonth + ")");
        }

        if (booking.getCheckOutDate() != null) {
            YearMonth checkOutMonth = YearMonth.from(booking.getCheckOutDate());
            if (yearMonth.isAfter(checkOutMonth)) {
                throw new InvalidBookingException(
                        "Cannot generate bill for a month after check-out (" + checkOutMonth + ")");
            }
        }

        BigDecimal rent = booking.getRoom().getPrice();
        BigDecimal electricityCharge = BigDecimal.ZERO;
        BigDecimal unitRate = fallbackUnitRate != null ? fallbackUnitRate : BigDecimal.valueOf(5.00);

        LocalDate start = monthDate.withDayOfMonth(1);
        LocalDate end = monthDate.withDayOfMonth(monthDate.lengthOfMonth());

        List<ElectricityReading> readings = readingRepository.findByRoomId(booking.getRoom().getId());
        ElectricityReading reading = readings.stream()
                .filter(r -> !r.getReadingDate().isBefore(start) && !r.getReadingDate().isAfter(end))
                .findFirst()
                .orElse(null);

        if (reading != null) {
            unitRate = reading.getUnitRate();
            electricityCharge = reading.getTotalAmount();
        }

        // Query previous bills for the booking and calculate unpaid balance
        // (totalAmount - paidAmount)
        List<Bill> previousBills = billRepository.findByBookingId(bookingId);
        BigDecimal previousBalance = previousBills.stream()
                .filter(b -> b.getBillingMonth().isBefore(monthDate))
                .map(b -> b.getTotalAmount().subtract(b.getPaidAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalAmount = rent.add(electricityCharge).add(previousBalance);

        Bill bill = Bill.builder()
                .booking(booking)
                .billingMonth(monthDate)
                .rentAmount(rent)
                .unitRate(unitRate)
                .electricityCharge(electricityCharge)
                .previousBalance(previousBalance)
                .totalAmount(totalAmount)
                .paidAmount(BigDecimal.ZERO)
                .paymentStatus("pending")
                .build();

        Bill saved = billRepository.save(bill);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public BillDto recordPayment(Long billId, BigDecimal amount) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + billId));

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidBookingException("Payment amount must be greater than zero");
        }

        BigDecimal newPaid = bill.getPaidAmount().add(amount);
        if (newPaid.compareTo(bill.getTotalAmount()) > 0) {
            throw new InvalidBookingException("Paid amount cannot exceed total amount");
        }

        bill.setPaidAmount(newPaid);
        if (newPaid.compareTo(bill.getTotalAmount()) >= 0) {
            bill.setPaymentStatus("paid");
        }

        Bill saved = billRepository.save(bill);
        return mapToDto(saved);
    }

    @Override
    public List<BillDto> getBillsByMonth(String billingMonth) {
        YearMonth yearMonth;
        try {
            yearMonth = YearMonth.parse(billingMonth);
        } catch (Exception e) {
            throw new InvalidBookingException("Invalid month format YYYY-MM");
        }
        LocalDate monthDate = yearMonth.atDay(1);
        return billRepository.findByBillingMonth(monthDate).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BillDto> getBillsByCustomer(Long customerId) {
        return billRepository.findByCustomerId(customerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private BillDto mapToDto(Bill bill) {
        return BillDto.builder()
                .id(bill.getId())
                .bookingId(bill.getBooking().getId())
                .roomNumber(bill.getBooking().getRoom().getRoomNumber())
                .customerName(bill.getBooking().getCustomer().getName())
                .customerPhone(bill.getBooking().getCustomer().getPhoneNo())
                .billingMonth(bill.getBillingMonth())
                .rentAmount(bill.getRentAmount())
                .unitRate(bill.getUnitRate())
                .electricityCharge(bill.getElectricityCharge())
                .totalAmount(bill.getTotalAmount())
                .paidAmount(bill.getPaidAmount())
                .previousBalance(bill.getPreviousBalance())
                .paymentStatus(bill.getPaymentStatus())
                .build();
    }
}
