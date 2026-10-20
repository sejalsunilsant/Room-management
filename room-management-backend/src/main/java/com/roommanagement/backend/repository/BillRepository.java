package com.roommanagement.backend.repository;

import com.roommanagement.backend.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByBillingMonth(LocalDate billingMonth);
    
    @Query("SELECT b FROM Bill b WHERE b.booking.customer.id = :customerId")
    List<Bill> findByCustomerId(@Param("customerId") Long customerId);
    
    List<Bill> findByBookingId(Long bookingId);
    
    Optional<Bill> findByBookingIdAndBillingMonth(Long bookingId, LocalDate billingMonth);
}
