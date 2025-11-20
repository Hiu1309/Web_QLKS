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
    private Integer capacity;

    @Column(name = "base_price")
    private Double basePrice;
}
