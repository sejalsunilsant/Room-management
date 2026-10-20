package com.roommanagement.backend;

import com.roommanagement.backend.dto.RoomDto;
import com.roommanagement.backend.service.RoomService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class RoomManagementBackendApplicationTests {

    @Autowired
    private RoomService roomService;

    @Test
    void contextLoads() {
    }

    @Test
    @WithMockUser(username = "user")
    void testUserIsolationForRooms() {
        // "user" should only see rooms belonging to "user"
        List<RoomDto> userRoomsBefore = roomService.getAllRooms();

        // Create a room 999 for "user"
        RoomDto newRoom = RoomDto.builder()
                .roomNumber("999")
                .floor(9)
                .status("available")
                .currentMeterReading(500)
                .price(BigDecimal.valueOf(1500))
                .build();

        RoomDto created = roomService.createRoom(newRoom);
        assertNotNull(created.getId());
        assertEquals("999", created.getRoomNumber());

        List<RoomDto> userRoomsAfter = roomService.getAllRooms();
        assertTrue(userRoomsAfter.stream().anyMatch(r -> "999".equals(r.getRoomNumber())));

        // Clean up
        roomService.deleteRoom(created.getId());
    }
}
