package com.hotel.repository;

import com.hotel.model.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomStatusRepository extends JpaRepository<RoomStatus, Integer> {
}
