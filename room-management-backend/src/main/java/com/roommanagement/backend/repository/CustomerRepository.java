package com.roommanagement.backend.repository;

import com.roommanagement.backend.model.Customer;
import com.roommanagement.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByUser(User user);
    Optional<Customer> findByIdAndUser(Long id, User user);
}
