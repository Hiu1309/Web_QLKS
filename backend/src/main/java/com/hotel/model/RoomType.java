package com.hotel.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "room_types")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_type_id")
    private Integer roomTypeId;

    private String name;

    private Integer bedCount;        // số giường
    private Integer maxOccupancy;    // sức chứa tối đa
    private Double basePrice;        // giá cơ bản
}
