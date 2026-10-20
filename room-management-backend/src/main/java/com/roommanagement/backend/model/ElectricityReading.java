package com.roommanagement.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "electricity_reading")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElectricityReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reading_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "reading_date", nullable = false)
    private LocalDate readingDate;

    @Column(name = "units_consumed", nullable = false)
    private Integer unitsConsumed;

    @Column(name = "unit_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal unitRate;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;
}
