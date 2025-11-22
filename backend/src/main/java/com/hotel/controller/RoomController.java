package com.hotel.controller;

import com.hotel.model.Room;
import com.hotel.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomController {

    @Autowired
    private RoomService roomService;

    // Lấy danh sách phòng với filter
    @GetMapping
    public List<Room> getAllRooms(
            @RequestParam(required = false) String roomNumber,
            @RequestParam(required = false) Integer roomTypeId,
            @RequestParam(required = false) Integer statusId
    ) {
        return roomService.getRooms(roomNumber, roomTypeId, statusId);
    }

    // Lấy phòng theo id
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable Integer id) {
        return roomService.getRoomById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Thêm phòng mới
    @PostMapping
    public Room createRoom(@RequestBody Room newRoom) {
        return roomService.addRoom(newRoom);
    }

    // Cập nhật phòng
    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable Integer id, @RequestBody Room updatedRoom) {
        try {
            Room room = roomService.updateRoom(id, updatedRoom);
            return ResponseEntity.ok(room);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Xóa phòng
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Integer id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    // Lấy số giường của phòng
    @GetMapping("/{id}/bedCount")
    public ResponseEntity<Integer> getBedCount(@PathVariable Integer id) {
        return roomService.getRoomById(id)
                .map(room -> ResponseEntity.ok(roomService.getBedCount(room)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Lấy sức chứa tối đa của phòng
    @GetMapping("/{id}/maxOccupancy")
    public ResponseEntity<Integer> getMaxOccupancy(@PathVariable Integer id) {
        return roomService.getRoomById(id)
                .map(room -> ResponseEntity.ok(roomService.getMaxOccupancy(room)))
                .orElse(ResponseEntity.notFound().build());
    }
}
