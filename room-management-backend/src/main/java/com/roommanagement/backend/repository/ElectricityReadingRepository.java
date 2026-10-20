package com.roommanagement.backend.repository;

import com.roommanagement.backend.model.ElectricityReading;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ElectricityReadingRepository extends JpaRepository<ElectricityReading, Long> {
    List<ElectricityReading> findByRoomId(Long roomId);
    List<ElectricityReading> findByReadingDate(LocalDate readingDate);
    Optional<ElectricityReading> findByRoomIdAndReadingDate(Long roomId, LocalDate readingDate);
}
