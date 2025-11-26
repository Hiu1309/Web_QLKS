package com.hotel.repository;

import com.hotel.model.ReservationRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReservationRoomRepository extends JpaRepository<ReservationRoom, Long> {
    List<ReservationRoom> findByReservationReservationId(Integer reservationId);
}
