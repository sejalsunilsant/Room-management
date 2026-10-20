package com.roommanagement.backend.service;

import com.roommanagement.backend.dto.ElectricityReadingDto;
import com.roommanagement.backend.exception.ResourceNotFoundException;
import com.roommanagement.backend.model.ElectricityReading;
import com.roommanagement.backend.model.Room;
import com.roommanagement.backend.model.User;
import com.roommanagement.backend.repository.ElectricityReadingRepository;
import com.roommanagement.backend.repository.RoomRepository;
import com.roommanagement.backend.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ElectricityReadingServiceImpl implements ElectricityReadingService {

    private final ElectricityReadingRepository readingRepository;
    private final RoomRepository roomRepository;
    private final SecurityUtils securityUtils;

    public ElectricityReadingServiceImpl(ElectricityReadingRepository readingRepository,
                                         RoomRepository roomRepository,
                                         SecurityUtils securityUtils) {
        this.readingRepository = readingRepository;
        this.roomRepository = roomRepository;
        this.securityUtils = securityUtils;
    }

    @Override
    public List<ElectricityReadingDto> getAllReadings() {
        User currentUser = securityUtils.getCurrentUser();
        return readingRepository.findByUser(currentUser).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ElectricityReadingDto getReadingById(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        ElectricityReading reading = readingRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Reading not found with ID: " + id));
        return mapToDto(reading);
    }

    @Override
    @Transactional
    public ElectricityReadingDto addReading(ElectricityReadingDto readingDto) {
        User currentUser = securityUtils.getCurrentUser();
        Room room = roomRepository.findByIdAndUser(readingDto.getRoomId(), currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + readingDto.getRoomId()));

        BigDecimal units = BigDecimal.valueOf(readingDto.getUnitsConsumed());
        BigDecimal total = units.multiply(readingDto.getUnitRate());

        ElectricityReading reading = ElectricityReading.builder()
                .user(currentUser)
                .room(room)
                .readingDate(readingDto.getReadingDate())
                .unitsConsumed(readingDto.getUnitsConsumed())
                .unitRate(readingDto.getUnitRate())
                .totalAmount(total)
                .build();

        room.setCurrentMeterReading(room.getCurrentMeterReading() + readingDto.getUnitsConsumed());
        roomRepository.save(room);

        ElectricityReading saved = readingRepository.save(reading);
        return mapToDto(saved);
    }

    @Override
    public List<ElectricityReadingDto> getReadingsByRoom(Long roomId) {
        User currentUser = securityUtils.getCurrentUser();
        return readingRepository.findByRoomIdAndUser(roomId, currentUser).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ElectricityReadingDto mapToDto(ElectricityReading reading) {
        return ElectricityReadingDto.builder()
                .id(reading.getId())
                .roomId(reading.getRoom().getId())
                .roomNumber(reading.getRoom().getRoomNumber())
                .readingDate(reading.getReadingDate())
                .unitsConsumed(reading.getUnitsConsumed())
                .unitRate(reading.getUnitRate())
                .totalAmount(reading.getTotalAmount())
                .build();
    }
}
