package com.hotel.controller;

import com.hotel.dto.RoomDTO;
import com.hotel.service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomController {

    private final RoomService service;

    public RoomController(RoomService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<RoomDTO>> getRooms(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer statusId,
            @RequestParam(required = false) Integer roomTypeId
    ) {
        List<RoomDTO> rooms = service.getFilteredDTO(search, statusId, roomTypeId);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomDTO> getRoom(@PathVariable Integer id) {
        var r = service.getById(id);
        if (r == null) return ResponseEntity.notFound().build();

        var dto = new RoomDTO(
            r.getRoomId(),
            r.getRoomNumber() != null ? r.getRoomNumber().trim() : null,
            r.getRoomType() != null ? r.getRoomType().getRoomTypeId() : null,
            r.getRoomType() != null ? r.getRoomType().getName().trim() : null,
            r.getRoomType() != null ? r.getRoomType().getBasePrice() : null,
            r.getStatus() != null ? r.getStatus().getStatusId() : null,
            r.getStatus() != null ? r.getStatus().getName().trim() : null,
            r.getFloor() != null ? r.getFloor().trim() : null,
            r.getBedCount(),
            r.getMaxOccupancy(),
            r.getImage() != null ? r.getImage().trim() : null
        );

        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<RoomDTO> createRoom(@RequestBody RoomDTO dto) {
        RoomDTO saved = service.save(dto);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomDTO> updateRoom(@PathVariable Integer id, @RequestBody RoomDTO dto) {
        RoomDTO updated = service.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
