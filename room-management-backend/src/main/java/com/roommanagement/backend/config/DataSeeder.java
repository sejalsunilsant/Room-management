package com.roommanagement.backend.config;

import com.roommanagement.backend.model.*;
import com.roommanagement.backend.repository.CustomerRepository;
import com.roommanagement.backend.repository.RoomRepository;
import com.roommanagement.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, 
                      RoomRepository roomRepository, 
                      CustomerRepository customerRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .build();

            User user = User.builder()
                    .username("user")
                    .password(passwordEncoder.encode("user123"))
                    .build();

            userRepository.saveAll(Arrays.asList(admin, user));
        }

        if (customerRepository.count() == 0) {
            Customer cust1 = Customer.builder()
                    .name("John Doe")
                    .phoneNo("555-0199")
                    .email("john.doe@gmail.com")
                    .address("123 Main St, Springfield")
                    .build();

            Customer cust2 = Customer.builder()
                    .name("Alice Smith")
                    .phoneNo("555-0144")
                    .email("alice.smith@yahoo.com")
                    .address("456 Elm St, Shelbyville")
                    .build();

            customerRepository.saveAll(Arrays.asList(cust1, cust2));
        }

        if (roomRepository.count() == 0) {
            Room room1 = Room.builder()
                    .roomNumber("101")
                    .floor(1)
                    .status("available")
                    .currentMeterReading(1000)
                    .price(BigDecimal.valueOf(2000.00))
                    .build();

            Room room2 = Room.builder()
                    .roomNumber("102")
                    .floor(1)
                    .status("available")
                    .currentMeterReading(1250)
                    .price(BigDecimal.valueOf(2200.00))
                    .build();

            Room room3 = Room.builder()
                    .roomNumber("201")
                    .floor(2)
                    .status("available")
                    .currentMeterReading(800)
                    .price(BigDecimal.valueOf(3000.00))
                    .build();

            Room room4 = Room.builder()
                    .roomNumber("202")
                    .floor(2)
                    .status("maintenance")
                    .currentMeterReading(950)
                    .price(BigDecimal.valueOf(3200.00))
                    .build();

            roomRepository.saveAll(Arrays.asList(room1, room2, room3, room4));
        }
    }
}
