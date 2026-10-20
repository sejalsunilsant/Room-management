package com.roommanagement.backend.service;

import com.roommanagement.backend.dto.ElectricityReadingDto;
import java.util.List;

public interface ElectricityReadingService {
    List<ElectricityReadingDto> getAllReadings();
    ElectricityReadingDto getReadingById(Long id);
    ElectricityReadingDto addReading(ElectricityReadingDto readingDto);
    List<ElectricityReadingDto> getReadingsByRoom(Long roomId);
}
