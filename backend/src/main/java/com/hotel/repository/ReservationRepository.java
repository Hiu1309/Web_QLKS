package com.hotel.repository;

import com.hotel.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
    @Query("SELECT DISTINCT r FROM Reservation r LEFT JOIN FETCH r.reservationRooms rr LEFT JOIN FETCH rr.room room LEFT JOIN FETCH rr.roomType rt LEFT JOIN FETCH r.guest g " +
           "WHERE (:guestName IS NULL OR LOWER(g.fullName) LIKE %:guestName%) " +
           "AND (:status IS NULL OR r.status = :status)")
    List<Reservation> findFiltered(@Param("guestName") String guestName, @Param("status") String status);
}
