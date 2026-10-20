package com.roommanagement.backend.config;

import com.roommanagement.backend.model.*;
import com.roommanagement.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final CustomerRepository customerRepository;
    private final BookingRepository bookingRepository;
    private final ElectricityReadingRepository readingRepository;
    private final BillRepository billRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, 
                      RoomRepository roomRepository, 
                      CustomerRepository customerRepository,
                      BookingRepository bookingRepository,
                      ElectricityReadingRepository readingRepository,
                      BillRepository billRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.customerRepository = customerRepository;
        this.bookingRepository = bookingRepository;
        this.readingRepository = readingRepository;
        this.billRepository = billRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Ensure default admin user exists
        User admin = userRepository.findByUsername("admin").orElse(null);
        if (admin == null) {
            admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .build();
            admin = userRepository.save(admin);
        }

        if (userRepository.findByUsername("user").isEmpty()) {
            User demoUser = User.builder()
                    .username("user")
                    .password(passwordEncoder.encode("user123"))
                    .build();
            userRepository.save(demoUser);
        }

        // 2. Ensure initial seed data belongs to admin
        if (customerRepository.count() == 0) {
            Customer cust1 = Customer.builder()
                    .user(admin)
                    .name("John Doe")
                    .phoneNo("555-0199")
                    .email("john.doe@gmail.com")
                    .address("123 Main St, Springfield")
                    .build();

            Customer cust2 = Customer.builder()
                    .user(admin)
                    .name("Alice Smith")
                    .phoneNo("555-0144")
                    .email("alice.smith@yahoo.com")
                    .address("456 Elm St, Shelbyville")
                    .build();

            customerRepository.saveAll(Arrays.asList(cust1, cust2));
        }

        if (roomRepository.count() == 0) {
            Room room1 = Room.builder()
                    .user(admin)
                    .roomNumber("101")
                    .floor(1)
                    .status("available")
                    .currentMeterReading(1000)
                    .price(BigDecimal.valueOf(2000.00))
                    .build();

            Room room2 = Room.builder()
                    .user(admin)
                    .roomNumber("102")
                    .floor(1)
                    .status("available")
                    .currentMeterReading(1250)
                    .price(BigDecimal.valueOf(2200.00))
                    .build();

            Room room3 = Room.builder()
                    .user(admin)
                    .roomNumber("201")
                    .floor(2)
                    .status("available")
                    .currentMeterReading(800)
                    .price(BigDecimal.valueOf(3000.00))
                    .build();

            Room room4 = Room.builder()
                    .user(admin)
                    .roomNumber("202")
                    .floor(2)
                    .status("maintenance")
                    .currentMeterReading(950)
                    .price(BigDecimal.valueOf(3200.00))
                    .build();

            roomRepository.saveAll(Arrays.asList(room1, room2, room3, room4));
        }

        // 3. Migrate any legacy unassociated rows to admin
        List<Room> orphanRooms = roomRepository.findAll().stream().filter(r -> r.getUser() == null).toList();
        for (Room r : orphanRooms) {
            r.setUser(admin);
            roomRepository.save(r);
        }

        List<Customer> orphanCustomers = customerRepository.findAll().stream().filter(c -> c.getUser() == null).toList();
        for (Customer c : orphanCustomers) {
            c.setUser(admin);
            customerRepository.save(c);
        }

        List<Booking> orphanBookings = bookingRepository.findAll().stream().filter(b -> b.getUser() == null).toList();
        for (Booking b : orphanBookings) {
            b.setUser(admin);
            bookingRepository.save(b);
        }

        List<ElectricityReading> orphanReadings = readingRepository.findAll().stream().filter(er -> er.getUser() == null).toList();
        for (ElectricityReading er : orphanReadings) {
            er.setUser(admin);
            readingRepository.save(er);
        }

        List<Bill> orphanBills = billRepository.findAll().stream().filter(bl -> bl.getUser() == null).toList();
        for (Bill bl : orphanBills) {
            bl.setUser(admin);
            billRepository.save(bl);
        }
    }
}
