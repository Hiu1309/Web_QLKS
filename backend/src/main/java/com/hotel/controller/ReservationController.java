package com.hotel.controller;

import com.hotel.model.Reservation;
import com.hotel.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "*")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;
    @Autowired
    private com.hotel.service.StayService stayService;

    @GetMapping
    public List<Reservation> getAll(@RequestParam(required = false) String guestName,
                                     @RequestParam(required = false) String status) {
        return reservationService.getAllReservations(guestName, status);
    }

    @GetMapping("/guest/{guestId}")
    public List<Reservation> getByGuestId(@PathVariable Integer guestId) {
        return reservationService.getReservationsByGuestId(guestId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getById(@PathVariable Integer id) {
        return reservationService.getReservationById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Reservation create(@RequestBody Reservation r) {
        return reservationService.createReservation(r);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reservation> update(@PathVariable Integer id, @RequestBody Reservation r) {
        try {
            Reservation updated = reservationService.updateReservation(id, r);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/checkin")
    public ResponseEntity<?> checkIn(@PathVariable Integer id) {
        try {
            java.util.List<com.hotel.model.Stay> stays = stayService.createStaysForReservation(id);
            return ResponseEntity.ok(stays);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/checkout")
    public ResponseEntity<?> checkOut(@PathVariable Integer id) {
        try {
            java.util.List<com.hotel.model.Stay> stays = stayService.checkoutStaysForReservation(id);
            return ResponseEntity.ok(stays);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        reservationService.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }
}
