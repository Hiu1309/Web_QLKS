package com.hotel.repository;

import com.hotel.model.ReservationRoom;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReservationRoomRepository extends JpaRepository<ReservationRoom, Long> {
    List<ReservationRoom> findByReservationReservationId(Integer reservationId);

    @Query("SELECT rr.room.roomId, COUNT(rr) FROM ReservationRoom rr WHERE rr.room IS NOT NULL GROUP BY rr.room.roomId ORDER BY COUNT(rr) DESC")
    List<Object[]> findTopBookedRooms(Pageable pageable);
}
