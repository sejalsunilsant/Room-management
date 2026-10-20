package com.roommanagement.backend.repository;

import com.roommanagement.backend.model.Bill;
import com.roommanagement.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByUser(User user);
    Optional<Bill> findByIdAndUser(Long id, User user);
    List<Bill> findByBillingMonthAndUser(LocalDate billingMonth, User user);

    @Query("SELECT b FROM Bill b WHERE b.booking.customer.id = :customerId AND b.user = :user")
    List<Bill> findByCustomerIdAndUser(@Param("customerId") Long customerId, @Param("user") User user);

    List<Bill> findByBookingIdAndUser(Long bookingId, User user);
    Optional<Bill> findByBookingIdAndBillingMonthAndUser(Long bookingId, LocalDate billingMonth, User user);

    List<Bill> findByBillingMonth(LocalDate billingMonth);
    @Query("SELECT b FROM Bill b WHERE b.booking.customer.id = :customerId")
    List<Bill> findByCustomerId(@Param("customerId") Long customerId);
    List<Bill> findByBookingId(Long bookingId);
    Optional<Bill> findByBookingIdAndBillingMonth(Long bookingId, LocalDate billingMonth);
}
