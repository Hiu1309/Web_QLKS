package com.hotel.repository;

import com.hotel.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Integer> {

    List<Room> findByRoomNumberContainingIgnoreCase(String number);

    @Query("SELECT r FROM Room r " +
           "WHERE (:search IS NULL OR LOWER(r.roomNumber) LIKE %:search% OR LOWER(r.roomType.name) LIKE %:search%) " +
           "AND (:statusId IS NULL OR r.status.statusId = :statusId) " +
           "AND (:roomTypeId IS NULL OR r.roomType.roomTypeId = :roomTypeId)")
    List<Room> findFiltered(
        @Param("search") String search,
        @Param("statusId") Integer statusId,
        @Param("roomTypeId") Integer roomTypeId
    );
}
