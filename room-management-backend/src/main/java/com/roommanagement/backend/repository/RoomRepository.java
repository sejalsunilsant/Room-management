package com.roommanagement.backend.repository;

import com.roommanagement.backend.model.Room;
import com.roommanagement.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByUser(User user);
    Optional<Room> findByIdAndUser(Long id, User user);
    Optional<Room> findByRoomNumberAndUser(String roomNumber, User user);
    List<Room> findByStatusAndUser(String status, User user);

    Optional<Room> findByRoomNumber(String roomNumber);
    List<Room> findByStatus(String status);
}
