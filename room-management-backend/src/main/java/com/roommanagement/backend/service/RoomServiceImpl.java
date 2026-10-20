package com.roommanagement.backend.service;

import com.roommanagement.backend.dto.RoomDto;
import com.roommanagement.backend.exception.InvalidBookingException;
import com.roommanagement.backend.exception.ResourceNotFoundException;
import com.roommanagement.backend.model.Room;
import com.roommanagement.backend.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;

    public RoomServiceImpl(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Override
    public List<RoomDto> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public RoomDto getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));
        return mapToDto(room);
    }

    @Override
    public RoomDto createRoom(RoomDto roomDto) {
        if (roomRepository.findByRoomNumber(roomDto.getRoomNumber()).isPresent()) {
            throw new InvalidBookingException("Room number " + roomDto.getRoomNumber() + " already exists");
        }

        String status = "available";
        if (roomDto.getStatus() != null) {
            status = roomDto.getStatus().toLowerCase();
        }

        Room room = Room.builder()
                .roomNumber(roomDto.getRoomNumber())
                .floor(roomDto.getFloor())
                .status(status)
                .currentMeterReading(roomDto.getCurrentMeterReading())
                .price(roomDto.getPrice())
                .build();

        Room savedRoom = roomRepository.save(room);
        return mapToDto(savedRoom);
    }

    @Override
    public RoomDto updateRoom(Long id, RoomDto roomDto) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));

        if (!room.getRoomNumber().equals(roomDto.getRoomNumber())) {
            if (roomRepository.findByRoomNumber(roomDto.getRoomNumber()).isPresent()) {
                throw new InvalidBookingException("Room number " + roomDto.getRoomNumber() + " already exists");
            }
            room.setRoomNumber(roomDto.getRoomNumber());
        }

        room.setFloor(roomDto.getFloor());
        room.setPrice(roomDto.getPrice());
        room.setCurrentMeterReading(roomDto.getCurrentMeterReading());
        
        if (roomDto.getStatus() != null) {
            room.setStatus(roomDto.getStatus().toLowerCase());
        }

        Room updatedRoom = roomRepository.save(room);
        return mapToDto(updatedRoom);
    }

    @Override
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));
        roomRepository.delete(room);
    }

    @Override
    public List<RoomDto> getRoomsByStatus(String status) {
        return roomRepository.findByStatus(status.toLowerCase()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private RoomDto mapToDto(Room room) {
        return RoomDto.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .floor(room.getFloor())
                .status(room.getStatus())
                .currentMeterReading(room.getCurrentMeterReading())
                .price(room.getPrice())
                .build();
    }
}
