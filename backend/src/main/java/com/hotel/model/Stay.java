package com.hotel.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Entity
@Table(name = "stays")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Stay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stay_id")
    private Integer stayId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "guest_id", nullable = false)
    private Guest guest;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "checkin_time")
    private Timestamp checkinTime;

    @Column(name = "checkout_time")
    private Timestamp checkoutTime;

    @Column(name = "total_cost")
    private BigDecimal totalCost;

    private String status; // checked-in, checked-out

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by_user_id")
    private User createdByUser;

    @Column(name = "created_at")
    private Timestamp createdAt;
}
