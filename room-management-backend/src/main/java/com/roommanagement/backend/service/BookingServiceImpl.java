package com.roommanagement.backend.service;

import com.roommanagement.backend.dto.BookingRequest;
import com.roommanagement.backend.dto.BookingResponse;
import com.roommanagement.backend.exception.InvalidBookingException;
import com.roommanagement.backend.exception.ResourceNotFoundException;
import com.roommanagement.backend.model.Booking;
import com.roommanagement.backend.model.Customer;
import com.roommanagement.backend.model.Room;
import com.roommanagement.backend.repository.BookingRepository;
import com.roommanagement.backend.repository.CustomerRepository;
import com.roommanagement.backend.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final CustomerRepository customerRepository;

    public BookingServiceImpl(BookingRepository bookingRepository,
            RoomRepository roomRepository,
            CustomerRepository customerRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
        return mapToResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest bookingRequest) {
        Customer customer = customerRepository.findById(bookingRequest.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer not found with ID: " + bookingRequest.getCustomerId()));

        Room room = roomRepository.findById(bookingRequest.getRoomId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Room not found with ID: " + bookingRequest.getRoomId()));

        if ("maintenance".equalsIgnoreCase(room.getStatus())) {
            throw new InvalidBookingException("Room is under maintenance");
        }

        LocalDate start = bookingRequest.getCheckInDate();
        LocalDate end = bookingRequest.getCheckOutDate();

        if (start == null) {
            throw new InvalidBookingException("Check-in date is required");
        }

        if (end != null && (end.isBefore(start) || end.isEqual(start))) {
            throw new InvalidBookingException("Check-out date must be after check-in date");
        }

        LocalDate checkEnd = (end != null) ? end : start.plusYears(10);
        List<Booking> overlaps = bookingRepository.findOverlappingBookings(room.getId(), start, checkEnd);
        if (!overlaps.isEmpty()) {
            throw new InvalidBookingException("Room is already booked for this period");
        }

        Booking booking = Booking.builder()
                .customer(customer)
                .room(room)
                .checkInDate(start)
                .checkOutDate(end)
                .status("Booked")
                .build();

        room.setStatus("occupied");
        roomRepository.save(room);

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponse(savedBooking);
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if ("Cancelled".equalsIgnoreCase(booking.getStatus())) {
            throw new InvalidBookingException("Booking is already cancelled");
        }

        booking.setStatus("Cancelled");
        booking.setCheckOutDate(LocalDate.now());

        Room room = booking.getRoom();
        room.setStatus("available");
        roomRepository.save(room);

        Booking updated = bookingRepository.save(booking);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public BookingResponse completeBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (!"Booked".equalsIgnoreCase(booking.getStatus())) {
            throw new InvalidBookingException("Only active bookings can be checked out");
        }

        booking.setStatus("CheckedOut");
        booking.setCheckOutDate(LocalDate.now());

        Room room = booking.getRoom();
        room.setStatus("available");
        roomRepository.save(room);

        Booking updated = bookingRepository.save(booking);
        return mapToResponse(updated);
    }

    @Override
    public List<BookingResponse> getBookingsByCustomerId(Long customerId) {
        return bookingRepository.findByCustomerId(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .customerId(booking.getCustomer().getId())
                .customerName(booking.getCustomer().getName())
                .roomId(booking.getRoom().getId())
                .roomNumber(booking.getRoom().getRoomNumber())
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .status(booking.getStatus())
                .build();
    }
}
