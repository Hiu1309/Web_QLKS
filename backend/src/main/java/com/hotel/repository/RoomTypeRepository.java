package com.hotel.repository;

import com.hotel.model.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomTypeRepository extends JpaRepository<RoomType, Integer> {
}
