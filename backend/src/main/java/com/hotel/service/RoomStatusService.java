package com.hotel.service;

import com.hotel.model.RoomStatus;
import com.hotel.repository.RoomStatusRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomStatusService {

    private final RoomStatusRepository repo;

    public RoomStatusService(RoomStatusRepository repo) {
        this.repo = repo;
    }

    public List<RoomStatus> getAll() {
        return repo.findAll();
    }

    public RoomStatus getById(Integer id) {
        return repo.findById(id).orElse(null);
    }
}
