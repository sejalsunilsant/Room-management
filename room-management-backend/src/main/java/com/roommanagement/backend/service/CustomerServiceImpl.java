package com.roommanagement.backend.service;

import com.roommanagement.backend.dto.CustomerDto;
import com.roommanagement.backend.exception.ResourceNotFoundException;
import com.roommanagement.backend.model.Customer;
import com.roommanagement.backend.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
        return mapToDto(customer);
    }

    @Override
    public CustomerDto createCustomer(CustomerDto customerDto) {
        Customer customer = Customer.builder()
                .name(customerDto.getName())
                .phoneNo(customerDto.getPhoneNo())
                .email(customerDto.getEmail())
                .address(customerDto.getAddress())
                .build();
        Customer saved = customerRepository.save(customer);
        return mapToDto(saved);
    }

    @Override
    public CustomerDto updateCustomer(Long id, CustomerDto customerDto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));

        customer.setName(customerDto.getName());
        customer.setPhoneNo(customerDto.getPhoneNo());
        customer.setEmail(customerDto.getEmail());
        customer.setAddress(customerDto.getAddress());

        Customer saved = customerRepository.save(customer);
        return mapToDto(saved);
    }

    @Override
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
        customerRepository.delete(customer);
    }

    private CustomerDto mapToDto(Customer customer) {
        return CustomerDto.builder()
                .id(customer.getId())
                .name(customer.getName())
                .phoneNo(customer.getPhoneNo())
                .email(customer.getEmail())
                .address(customer.getAddress())
                .build();
    }
}
