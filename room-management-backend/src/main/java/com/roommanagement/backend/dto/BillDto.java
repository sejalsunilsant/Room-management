package com.roommanagement.backend.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillDto {
    private Long id;
    private Long bookingId;
    private String roomNumber;
    private String customerName;
    private String customerPhone;
    private LocalDate billingMonth;
    private BigDecimal rentAmount;
    private BigDecimal unitRate;
    private BigDecimal electricityCharge;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal previousBalance;
    private String paymentStatus;
}
