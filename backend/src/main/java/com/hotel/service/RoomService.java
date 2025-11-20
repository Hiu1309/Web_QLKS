package com.hotel.service;

import com.hotel.model.Room;
import com.hotel.model.RoomStatus;
import com.hotel.model.RoomType;
import com.hotel.dto.RoomDTO;
import com.hotel.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoomService {
    private final RoomRepository repo;

    public RoomService(RoomRepository repo) {
        this.repo = repo;
    }

    public List<Room> getAllRooms() {
        return repo.findAll();
    }

    public Room getById(Integer id) {
        return repo.findById(id).orElse(null);
    }

    public List<Room> searchByNumber(String number) {
        return repo.findByRoomNumberContainingIgnoreCase(number);
    }

    public List<Room> getFiltered(String search, Integer statusId, Integer roomTypeId) {
        String s = (search == null || search.trim().isEmpty()) ? null : search.toLowerCase();
        return repo.findFiltered(s, statusId, roomTypeId);
    }

    @Transactional(readOnly = true)
    public List<RoomDTO> getFilteredDTO(String search, Integer statusId, Integer roomTypeId) {
        List<Room> rooms = getFiltered(search, statusId, roomTypeId);

        return rooms.stream().map(r -> new RoomDTO(
            r.getRoomId(),
            r.getRoomNumber() != null ? r.getRoomNumber().trim() : null,

            // RoomType
            r.getRoomType() != null ? r.getRoomType().getRoomTypeId() : null,
            r.getRoomType() != null ? r.getRoomType().getName().trim() : null,
            r.getRoomType() != null ? r.getRoomType().getBasePrice() : null,

            // Status
            r.getStatus() != null ? r.getStatus().getStatusId() : null,
            r.getStatus() != null ? r.getStatus().getName().trim() : null,

            r.getFloor() != null ? r.getFloor().trim() : null,
            r.getBedCount(),
            r.getMaxOccupancy(),
            r.getImage() != null ? r.getImage().trim() : null
        )).collect(Collectors.toList());
    }

    // =================== SAVE ===================
    public RoomDTO save(RoomDTO dto) {
        Room room = new Room();
        room.setRoomNumber(dto.roomNumber() != null ? dto.roomNumber().trim() : null);

        // RoomType
        if (dto.roomTypeId() != null) {
            RoomType type = new RoomType();
            type.setRoomTypeId(dto.roomTypeId());
            room.setRoomType(type);
        }

        // Status
        if (dto.statusId() != null) {
            RoomStatus status = new RoomStatus();
            status.setStatusId(dto.statusId());
            room.setStatus(status);
        }

        room.setFloor(dto.floor() != null ? dto.floor().trim() : null);
        room.setBedCount(dto.bedCount());
        room.setMaxOccupancy(dto.maxOccupancy());
        room.setImage(dto.image() != null ? dto.image().trim() : null);

        Room saved = repo.save(room);

        return new RoomDTO(
            saved.getRoomId(),
            saved.getRoomNumber() != null ? saved.getRoomNumber().trim() : null,
            saved.getRoomType() != null ? saved.getRoomType().getRoomTypeId() : null,
            saved.getRoomType() != null ? saved.getRoomType().getName().trim() : null,
            saved.getRoomType() != null ? saved.getRoomType().getBasePrice() : null,
            saved.getStatus() != null ? saved.getStatus().getStatusId() : null,
            saved.getStatus() != null ? saved.getStatus().getName().trim() : null,
            saved.getFloor() != null ? saved.getFloor().trim() : null,
            saved.getBedCount(),
            saved.getMaxOccupancy(),
            saved.getImage() != null ? saved.getImage().trim() : null
        );
    }

    // =================== UPDATE ===================
    public RoomDTO update(Integer id, RoomDTO dto) {
        Room room = repo.findById(id).orElseThrow(() -> new RuntimeException("Room not found"));

        room.setRoomNumber(dto.roomNumber() != null ? dto.roomNumber().trim() : null);

        if (dto.roomTypeId() != null) {
            RoomType type = new RoomType();
            type.setRoomTypeId(dto.roomTypeId());
            room.setRoomType(type);
        }

        if (dto.statusId() != null) {
            RoomStatus status = new RoomStatus();
            status.setStatusId(dto.statusId());
            room.setStatus(status);
        }

        room.setFloor(dto.floor() != null ? dto.floor().trim() : null);
        room.setBedCount(dto.bedCount());
        room.setMaxOccupancy(dto.maxOccupancy());
        room.setImage(dto.image() != null ? dto.image().trim() : null);

        Room updated = repo.save(room);

        return new RoomDTO(
            updated.getRoomId(),
            updated.getRoomNumber() != null ? updated.getRoomNumber().trim() : null,
            updated.getRoomType() != null ? updated.getRoomType().getRoomTypeId() : null,
            updated.getRoomType() != null ? updated.getRoomType().getName().trim() : null,
            updated.getRoomType() != null ? updated.getRoomType().getBasePrice() : null,
            updated.getStatus() != null ? updated.getStatus().getStatusId() : null,
            updated.getStatus() != null ? updated.getStatus().getName().trim() : null,
            updated.getFloor() != null ? updated.getFloor().trim() : null,
            updated.getBedCount(),
            updated.getMaxOccupancy(),
            updated.getImage() != null ? updated.getImage().trim() : null
        );
    }

    // =================== DELETE ===================
    public void delete(Integer id) {
        repo.deleteById(id);
    }
}
