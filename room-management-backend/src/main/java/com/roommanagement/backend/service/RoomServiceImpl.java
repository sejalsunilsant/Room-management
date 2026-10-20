package com.roommanagement.backend.service;

import com.roommanagement.backend.dto.RoomDto;
import com.roommanagement.backend.exception.InvalidBookingException;
import com.roommanagement.backend.exception.ResourceNotFoundException;
import com.roommanagement.backend.model.Room;
import com.roommanagement.backend.model.User;
import com.roommanagement.backend.repository.RoomRepository;
import com.roommanagement.backend.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final SecurityUtils securityUtils;

    public RoomServiceImpl(RoomRepository roomRepository, SecurityUtils securityUtils) {
        this.roomRepository = roomRepository;
        this.securityUtils = securityUtils;
    }

    @Override
    public List<RoomDto> getAllRooms() {
        User currentUser = securityUtils.getCurrentUser();
        return roomRepository.findByUser(currentUser).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public RoomDto getRoomById(Long id) {
        User currentUser = securityUtils.getCurrentUser();
        Room room = roomRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));
        return mapToDto(room);
    }

    @Override
    public RoomDto createRoom(RoomDto roomDto) {
        User currentUser = securityUtils.getCurrentUser();
        if (roomRepository.findByRoomNumberAndUser(roomDto.getRoomNumber(), currentUser).isPresent()) {
            throw new InvalidBookingException("Room number " + roomDto.getRoomNumber() + " already exists in your account");
        }

        String status = "available";
        if (roomDto.getStatus() != null) {
            status = roomDto.getStatus().toLowerCase();
        }

        Room room = Room.builder()
                .user(currentUser)
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
        User currentUser = securityUtils.getCurrentUser();
        Room room = roomRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));

        if (!room.getRoomNumber().equals(roomDto.getRoomNumber())) {
            if (roomRepository.findByRoomNumberAndUser(roomDto.getRoomNumber(), currentUser).isPresent()) {
                throw new InvalidBookingException("Room number " + roomDto.getRoomNumber() + " already exists in your account");
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
        User currentUser = securityUtils.getCurrentUser();
        Room room = roomRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));
        roomRepository.delete(room);
    }

    @Override
    public List<RoomDto> getRoomsByStatus(String status) {
        User currentUser = securityUtils.getCurrentUser();
        return roomRepository.findByStatusAndUser(status.toLowerCase(), currentUser).stream()
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
