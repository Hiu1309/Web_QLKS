package com.hotel.controller;

import com.hotel.model.RoomStatus;
import com.hotel.service.RoomStatusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/room-statuses")
@CrossOrigin(origins = "*")
public class RoomStatusController {

    private final RoomStatusService service;

    public RoomStatusController(RoomStatusService service) {
        this.service = service;
    }

    // Lấy tất cả trạng thái phòng
    @GetMapping
    public ResponseEntity<List<RoomStatus>> getAllStatuses() {
        List<RoomStatus> statuses = service.getAll();
        return ResponseEntity.ok(statuses);
    }

    // Lấy trạng thái phòng theo id
    @GetMapping("/{id}")
    public ResponseEntity<RoomStatus> getStatusById(@PathVariable Integer id) {
        RoomStatus status = service.getById(id);
        if (status == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(status);
    }
}
