package com.hotel.repository;

import com.hotel.model.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoomStatusRepository extends JpaRepository<RoomStatus, Integer> {
	Optional<RoomStatus> findByName(String name);
}
