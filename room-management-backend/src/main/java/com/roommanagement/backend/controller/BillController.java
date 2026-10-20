package com.roommanagement.backend.controller;

import com.roommanagement.backend.dto.BillDto;
import com.roommanagement.backend.service.BillService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @GetMapping
    public ResponseEntity<List<BillDto>> getAllBills() {
        return ResponseEntity.ok(billService.getAllBills());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillDto> getBillById(@PathVariable Long id) {
        return ResponseEntity.ok(billService.getBillById(id));
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BillDto> generateBill(@RequestParam Long bookingId, 
                                                @RequestParam String billingMonth,
                                                @RequestParam(required = false) BigDecimal fallbackUnitRate) {
        BillDto bill = billService.generateBill(bookingId, billingMonth, fallbackUnitRate);
        return new ResponseEntity<>(bill, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BillDto> recordPayment(@PathVariable Long id, @RequestParam BigDecimal amount) {
        BillDto updated = billService.recordPayment(id, amount);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/month/{month}")
    public ResponseEntity<List<BillDto>> getBillsByMonth(@PathVariable String month) {
        return ResponseEntity.ok(billService.getBillsByMonth(month));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<BillDto>> getBillsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(billService.getBillsByCustomer(customerId));
    }
}
