package com.hotel.repository;

import com.hotel.model.Stay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public interface StayRepository extends JpaRepository<Stay, Integer> {
    List<Stay> findByReservationReservationId(Integer reservationId);
    List<Stay> findByReservationReservationIdAndStatus(Integer reservationId, String status);
    List<Stay> findByGuestGuestId(Integer guestId);
    long countByCheckinTimeBetween(Timestamp start, Timestamp end);
    long countByCheckoutTimeBetween(Timestamp start, Timestamp end);
    long countByStatusIgnoreCase(String status);
}
