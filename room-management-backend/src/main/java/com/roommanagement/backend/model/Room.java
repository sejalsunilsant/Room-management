package com.roommanagement.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long id;

    @Column(name = "room_number", unique = true, nullable = false, length = 10)
    private String roomNumber;

    @Column(nullable = false)
    private Integer floor;

    @Column(nullable = false, length = 20)
    private String status; // e.g. "available", "occupied", "maintenance"

    @Column(name = "current_meter_reading", nullable = false)
    private Integer currentMeterReading;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
}
