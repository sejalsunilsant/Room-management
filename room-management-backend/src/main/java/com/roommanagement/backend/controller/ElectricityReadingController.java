package com.roommanagement.backend.controller;

import com.roommanagement.backend.dto.ElectricityReadingDto;
import com.roommanagement.backend.service.ElectricityReadingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/readings")
public class ElectricityReadingController {

    private final ElectricityReadingService readingService;

    public ElectricityReadingController(ElectricityReadingService readingService) {
        this.readingService = readingService;
    }

    @GetMapping
    public ResponseEntity<List<ElectricityReadingDto>> getAllReadings() {
        return ResponseEntity.ok(readingService.getAllReadings());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ElectricityReadingDto> addReading(@Valid @RequestBody ElectricityReadingDto readingDto) {
        ElectricityReadingDto saved = readingService.addReading(readingDto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<ElectricityReadingDto>> getReadingsByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(readingService.getReadingsByRoom(roomId));
    }
}
