package com.hotel.service;

import com.hotel.model.Reservation;
import com.hotel.model.ReservationRoom;
import com.hotel.model.Room;
import com.hotel.model.RoomType;
import com.hotel.model.Guest;
import com.hotel.model.User;
import com.hotel.repository.ReservationRepository;
import com.hotel.repository.ReservationRoomRepository;
import com.hotel.repository.RoomRepository;
import com.hotel.repository.RoomTypeRepository;
import com.hotel.repository.GuestRepository;
import com.hotel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ReservationService {
    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ReservationRoomRepository reservationRoomRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Reservation> getAllReservations(String guestName, String status) {
        String guestNameParam = (guestName == null || guestName.isBlank()) ? null : guestName.toLowerCase();
        return reservationRepository.findFiltered(guestNameParam, (status == null || status.isBlank()) ? null : status);
    }

    public Optional<Reservation> getReservationById(Integer id) {
        return reservationRepository.findById(id);
    }

    public Reservation createReservation(Reservation reservation) {
        // Attach existing guest if provided
        if (reservation.getGuest() != null && reservation.getGuest().getGuestId() != null) {
            Guest g = guestRepository.findById(reservation.getGuest().getGuestId()).orElse(null);
            reservation.setGuest(g);
        }

        // Attach createdByUser if provided
        if (reservation.getCreatedByUser() != null && reservation.getCreatedByUser().getUserId() != null) {
            User u = userRepository.findById(reservation.getCreatedByUser().getUserId()).orElse(null);
            reservation.setCreatedByUser(u);
        }

        // Ensure reservationRooms link back to reservation and resolve room/roomType objects
        if (reservation.getReservationRooms() != null) {
            List<ReservationRoom> rrList = new ArrayList<>();
            for (ReservationRoom rr : reservation.getReservationRooms()) {
                if (rr.getRoom() != null && rr.getRoom().getRoomId() != null) {
                    Room room = roomRepository.findById(rr.getRoom().getRoomId()).orElse(null);
                    rr.setRoom(room);
                }
                if (rr.getRoomType() != null && rr.getRoomType().getRoomTypeId() != null) {
                    RoomType rt = roomTypeRepository.findById(rr.getRoomType().getRoomTypeId()).orElse(null);
                    rr.setRoomType(rt);
                }
                rr.setReservation(reservation);
                rrList.add(rr);
            }
            reservation.setReservationRooms(rrList);
        }

        return reservationRepository.save(reservation);
    }

    public Reservation updateReservation(Integer id, Reservation updated) {
        Reservation existing = reservationRepository.findById(id).orElseThrow(() -> new RuntimeException("Reservation not found"));
        existing.setArrivalDate(updated.getArrivalDate());
        existing.setDepartureDate(updated.getDepartureDate());
        existing.setNumGuests(updated.getNumGuests());
        existing.setTotalEstimated(updated.getTotalEstimated());
        existing.setStatus(updated.getStatus());

        if (updated.getGuest() != null && updated.getGuest().getGuestId() != null) {
            Guest g = guestRepository.findById(updated.getGuest().getGuestId()).orElse(null);
            existing.setGuest(g);
        }

        if (updated.getCreatedByUser() != null && updated.getCreatedByUser().getUserId() != null) {
            User u = userRepository.findById(updated.getCreatedByUser().getUserId()).orElse(null);
            existing.setCreatedByUser(u);
        }

        // Replace reservationRooms: delete all old and save new ones
        List<com.hotel.model.ReservationRoom> oldRRs = reservationRoomRepository.findByReservationReservationId(id);
        if (oldRRs != null && !oldRRs.isEmpty()) {
            reservationRoomRepository.deleteAll(oldRRs);
        }

        if (updated.getReservationRooms() != null) {
            List<ReservationRoom> newRRs = new ArrayList<>();
            for (ReservationRoom rr : updated.getReservationRooms()) {
                if (rr.getRoom() != null && rr.getRoom().getRoomId() != null) {
                    Room room = roomRepository.findById(rr.getRoom().getRoomId()).orElse(null);
                    rr.setRoom(room);
                }
                if (rr.getRoomType() != null && rr.getRoomType().getRoomTypeId() != null) {
                    RoomType rt = roomTypeRepository.findById(rr.getRoomType().getRoomTypeId()).orElse(null);
                    rr.setRoomType(rt);
                }
                rr.setReservation(existing);
                newRRs.add(rr);
            }
            existing.setReservationRooms(newRRs);
        }

        return reservationRepository.save(existing);
    }

    public void deleteReservation(Integer id) {
        reservationRepository.deleteById(id);
    }
}
