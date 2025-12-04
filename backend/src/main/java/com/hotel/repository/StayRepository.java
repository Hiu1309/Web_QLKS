package com.hotel.repository;

import com.hotel.model.Stay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StayRepository extends JpaRepository<Stay, Integer> {
    List<Stay> findByReservationReservationId(Integer reservationId);
    List<Stay> findByReservationReservationIdAndStatus(Integer reservationId, String status);
}
