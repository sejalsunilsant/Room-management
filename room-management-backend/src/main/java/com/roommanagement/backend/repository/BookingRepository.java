package com.roommanagement.backend.repository;

import com.roommanagement.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerId(Long customerId);
    List<Booking> findByRoomId(Long roomId);
    List<Booking> findByStatus(String status);

    @Query("SELECT b FROM Booking b WHERE b.room.id = :roomId AND b.status = 'Booked' AND " +
           "((b.checkInDate < :checkOutDate AND (b.checkOutDate IS NULL OR b.checkOutDate > :checkInDate)))")
    List<Booking> findOverlappingBookings(@Param("roomId") Long roomId, 
                                          @Param("checkInDate") LocalDate checkInDate, 
                                          @Param("checkOutDate") LocalDate checkOutDate);

    @Query("SELECT b FROM Booking b WHERE b.room.id = :roomId AND b.status = 'Booked' AND " +
           "b.checkInDate <= :endOfMonth AND (b.checkOutDate IS NULL OR b.checkOutDate >= :startOfMonth)")
    List<Booking> findBookingsInMonth(@Param("roomId") Long roomId,
                                      @Param("startOfMonth") LocalDate startOfMonth,
                                      @Param("endOfMonth") LocalDate endOfMonth);
}
