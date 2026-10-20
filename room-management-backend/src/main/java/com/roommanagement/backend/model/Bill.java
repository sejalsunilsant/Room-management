package com.roommanagement.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bill_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @Column(name = "billing_month")
    private LocalDate billingMonth;

    @Column(name = "rent_amount", precision = 10, scale = 2)
    private BigDecimal rentAmount;

    @Column(name = "unit_rate", precision = 5, scale = 2)
    private BigDecimal unitRate;

    @Column(name = "electricity_charge", precision = 10, scale = 2)
    private BigDecimal electricityCharge;

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "paid_amount", precision = 10, scale = 2)
    private BigDecimal paidAmount;

    @Column(name = "previous_balance", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal previousBalance = BigDecimal.ZERO;

    @Column(name = "payment_status", length = 20)
    private String paymentStatus; // e.g. "pending", "paid"
}
