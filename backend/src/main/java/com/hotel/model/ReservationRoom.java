package com.hotel.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

@Entity
@Table(name = "reservation_rooms")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class ReservationRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;

    private BigDecimal price;

    @Column(name = "price_per_night")
    private BigDecimal pricePerNight;
}
