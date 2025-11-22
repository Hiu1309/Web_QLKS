package com.hotel.service;

import com.hotel.model.Room;
import com.hotel.model.RoomType;
import com.hotel.repository.RoomRepository;
import com.hotel.repository.RoomTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    // Lấy danh sách phòng với filter
    public List<Room> getRooms(String roomNumber, Integer roomTypeId, Integer statusId) {
        return roomRepository.findFiltered(
                roomNumber != null && !roomNumber.isEmpty() ? roomNumber : null,
                roomTypeId,
                statusId
        );
    }

    // Lấy phòng theo id
    public Optional<Room> getRoomById(Integer id) {
        return roomRepository.findById(id);
    }

    // Thêm phòng mới
    public Room addRoom(Room newRoom) {
        // Lấy thông tin RoomType để điền bedCount và maxOccupancy
        if (newRoom.getRoomType() != null && newRoom.getRoomType().getRoomTypeId() != null) {
            RoomType type = roomTypeRepository.findById(newRoom.getRoomType().getRoomTypeId())
                    .orElseThrow(() -> new RuntimeException("RoomType not found"));

            newRoom.setRoomType(type);
        }
        return roomRepository.save(newRoom);
    }

    // Cập nhật phòng
    public Room updateRoom(Integer id, Room updatedRoom) {
        Room existingRoom = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        existingRoom.setRoomNumber(updatedRoom.getRoomNumber());
        existingRoom.setFloor(updatedRoom.getFloor());
        existingRoom.setStatus(updatedRoom.getStatus());

        if (updatedRoom.getRoomType() != null && updatedRoom.getRoomType().getRoomTypeId() != null) {
            RoomType type = roomTypeRepository.findById(updatedRoom.getRoomType().getRoomTypeId())
                    .orElseThrow(() -> new RuntimeException("RoomType not found"));
            existingRoom.setRoomType(type);
        }
        existingRoom.setImage(updatedRoom.getImage());

        return roomRepository.save(existingRoom);
    }

    // Xóa phòng
    public void deleteRoom(Integer id) {
        roomRepository.deleteById(id);
    }

    // Lấy số giường của phòng
    public int getBedCount(Room room) {
        return room.getRoomType().getBedCount();
    }

    // Lấy sức chứa tối đa của phòng
    public int getMaxOccupancy(Room room) {
        return room.getRoomType().getMaxOccupancy();
    }
}
