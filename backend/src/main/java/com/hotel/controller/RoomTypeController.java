package com.hotel.controller;

import com.hotel.model.RoomType;
import com.hotel.service.RoomTypeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/room-types")
@CrossOrigin(origins = "*")
public class RoomTypeController {

    private final RoomTypeService service;

    public RoomTypeController(RoomTypeService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<RoomType>> getAllRoomTypes() {
        List<RoomType> list = service.getAllRoomTypes();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomType> getRoomType(@PathVariable Integer id) {
        RoomType type = service.getById(id);
        if (type == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(type);
    }
}
