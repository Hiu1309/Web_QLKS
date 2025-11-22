package com.hotel.repository;

import com.hotel.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Integer> {

    @Query("SELECT r FROM Room r " +
           "WHERE (:roomNumber IS NULL OR r.roomNumber LIKE %:roomNumber%) " +
           "AND (:roomTypeId IS NULL OR r.roomType.roomTypeId = :roomTypeId) " +
           "AND (:statusId IS NULL OR r.status.statusId = :statusId)")
    List<Room> findFiltered(@Param("roomNumber") String roomNumber,
                            @Param("roomTypeId") Integer roomTypeId,
                            @Param("statusId") Integer statusId);
}
