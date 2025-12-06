package com.hotel.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Integer reservationId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "guest_id", nullable = false)
    private Guest guest;

    @Column(name = "status")
    private String status = "booking";

    @Column(name = "arrival_date")
    private Timestamp arrivalDate;

    @Column(name = "departure_date")
    private Timestamp departureDate;

    @Column(name = "num_guests")
    private Integer numGuests;

    @Column(name = "total_estimated")
    private BigDecimal totalEstimated;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by_user_id")
    private User createdByUser;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ReservationRoom> reservationRooms;
}
