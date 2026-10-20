package com.roommanagement.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ElectricityReadingDto {
    private Long id;

    @NotNull(message = "Room ID is required")
    private Long roomId;

    private String roomNumber;

    @NotNull(message = "Reading date is required")
    private LocalDate readingDate;

    @NotNull(message = "Units consumed is required")
    private Integer unitsConsumed;

    @NotNull(message = "Unit rate is required")
    private BigDecimal unitRate;

    private BigDecimal totalAmount;
}
