package com.roommanagement.backend.service;

import com.roommanagement.backend.dto.BillDto;
import java.math.BigDecimal;
import java.util.List;

public interface BillService {
    List<BillDto> getAllBills();
    BillDto getBillById(Long id);
    BillDto generateBill(Long bookingId, String billingMonth, BigDecimal fallbackUnitRate);
    BillDto recordPayment(Long billId, BigDecimal amount);
    List<BillDto> getBillsByMonth(String billingMonth);
    List<BillDto> getBillsByCustomer(Long customerId);
}
