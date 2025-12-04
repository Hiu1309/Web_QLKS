package com.hotel.service;

import com.hotel.model.RoomStatus;
import com.hotel.repository.RoomStatusRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    public RoomStatus getByName(String name) {
        if (name == null) return null;
        Optional<RoomStatus> s = repo.findByName(name);
        return s.orElse(null);
    }

    public RoomStatus createIfNotExists(String name) {
        if (name == null) return null;
        Optional<RoomStatus> existing = repo.findByName(name);
        if (existing.isPresent()) return existing.get();
        RoomStatus ns = new RoomStatus();
        ns.setName(name);
        return repo.save(ns);
    }
}
