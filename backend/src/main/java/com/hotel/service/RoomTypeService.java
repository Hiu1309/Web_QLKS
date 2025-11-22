package com.hotel.service;

import com.hotel.model.RoomType;
import com.hotel.repository.RoomTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomTypeService {
    private final RoomTypeRepository repo;

    public RoomTypeService(RoomTypeRepository repo) {
        this.repo = repo;
    }

    public List<RoomType> getAllRoomTypes() {
        return repo.findAll();
    }

    public RoomType getById(Integer id) {
        return repo.findById(id).orElse(null);
    }
}
