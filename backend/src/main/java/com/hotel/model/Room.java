package com.hotel.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "rooms")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Integer roomId;

    @Column(name = "room_number")
    private String roomNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;

    private String floor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "status_id", nullable = false)
    private RoomStatus status;

    private String image;

    // Lấy thông tin tiện ích từ RoomType
    public Integer getBedCount() {
        return roomType != null ? roomType.getBedCount() : null;
    }

    public Integer getMaxOccupancy() {
        return roomType != null ? roomType.getMaxOccupancy() : null;
    }

    public Double getBasePrice() {
        return roomType != null ? roomType.getBasePrice() : null;
    }
}
