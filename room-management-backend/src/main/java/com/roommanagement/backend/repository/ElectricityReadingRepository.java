package com.roommanagement.backend.repository;

import com.roommanagement.backend.model.ElectricityReading;
import com.roommanagement.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ElectricityReadingRepository extends JpaRepository<ElectricityReading, Long> {
    List<ElectricityReading> findByUser(User user);
    Optional<ElectricityReading> findByIdAndUser(Long id, User user);
    List<ElectricityReading> findByRoomIdAndUser(Long roomId, User user);
    List<ElectricityReading> findByReadingDateAndUser(LocalDate readingDate, User user);
    Optional<ElectricityReading> findByRoomIdAndReadingDateAndUser(Long roomId, LocalDate readingDate, User user);

    List<ElectricityReading> findByRoomId(Long roomId);
    List<ElectricityReading> findByReadingDate(LocalDate readingDate);
    Optional<ElectricityReading> findByRoomIdAndReadingDate(Long roomId, LocalDate readingDate);
}
