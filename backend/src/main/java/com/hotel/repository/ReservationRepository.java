package com.hotel.repository;

import com.hotel.model.Reservation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
    @Query("SELECT DISTINCT r FROM Reservation r LEFT JOIN FETCH r.reservationRooms rr LEFT JOIN FETCH rr.room room LEFT JOIN FETCH rr.roomType rt LEFT JOIN FETCH r.guest g " +
           "WHERE (:guestName IS NULL OR LOWER(g.fullName) LIKE %:guestName%) " +
           "AND (:status IS NULL OR r.status = :status)")
    List<Reservation> findFiltered(@Param("guestName") String guestName, @Param("status") String status);
    
    @Query("SELECT DISTINCT r FROM Reservation r LEFT JOIN FETCH r.reservationRooms rr LEFT JOIN FETCH rr.room room LEFT JOIN FETCH rr.roomType rt LEFT JOIN FETCH r.guest g " +
           "WHERE g.guestId = :guestId ORDER BY r.createdAt DESC")
    List<Reservation> findByGuestId(@Param("guestId") Integer guestId);

       @EntityGraph(attributePaths = {"guest", "reservationRooms", "reservationRooms.room", "reservationRooms.roomType"})
       List<Reservation> findTop5ByOrderByCreatedAtDesc();

       long countByStatusIgnoreCase(String status);
}
