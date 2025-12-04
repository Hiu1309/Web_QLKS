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
import com.hotel.repository.RoomStatusRepository;
import com.hotel.service.RoomStatusService;
import com.hotel.model.RoomStatus;
import com.hotel.exception.BadRequestException;
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

    @Autowired
    private RoomStatusService roomStatusService;

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
                    // Ensure room is available to be booked
                    if (room != null && room.getStatus() != null && !"Còn Trống".equals(room.getStatus().getName())) {
                        throw new BadRequestException("Phòng không khả dụng để đặt: " + room.getRoomNumber());
                    }
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

        // Set createdAt if not provided (db constraint requires non-null)
        if (reservation.getCreatedAt() == null) {
            reservation.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        }

        // Set a default createdByUser if none provided to satisfy non-null DB constraint
        if (reservation.getCreatedByUser() == null || reservation.getCreatedByUser().getUserId() == null) {
            User defaultUser = userRepository.findById(1).orElse(null);
            if (defaultUser != null) {
                reservation.setCreatedByUser(defaultUser);
            }
        }

        Reservation saved = reservationRepository.save(reservation);

        // Set rooms to 'Đã đặt' status when reservation is created
        RoomStatus bookedStatus = roomStatusService.createIfNotExists("Đã đặt");
        if (saved.getReservationRooms() != null) {
            for (ReservationRoom rr : saved.getReservationRooms()) {
                if (rr.getRoom() != null) {
                    Room room = rr.getRoom();
                    boolean isOccupied = false;
                    if (room.getStatus() != null && room.getStatus().getName() != null) {
                        String currentStatus = room.getStatus().getName();
                        isOccupied = "Đã nhận phòng".equals(currentStatus) || "Đang dùng phòng".equals(currentStatus);
                    }
                    if (!isOccupied) {
                        room.setStatus(bookedStatus);
                        roomRepository.save(room);
                    }
                }
            }
        }
        return saved;
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

        // Replace reservationRooms: free old rooms then delete all old RRs
        List<com.hotel.model.ReservationRoom> oldRRs = reservationRoomRepository.findByReservationReservationId(id);
        RoomStatus freeStatus = roomStatusService.getByName("Còn Trống");
        if (oldRRs != null && !oldRRs.isEmpty()) {
            for (com.hotel.model.ReservationRoom old : oldRRs) {
                if (old.getRoom() != null && freeStatus != null) {
                    Room rrRoom = old.getRoom();
                    rrRoom.setStatus(freeStatus);
                    roomRepository.save(rrRoom);
                }
            }
            reservationRoomRepository.deleteAll(oldRRs);
        }

        if (updated.getReservationRooms() != null) {
            List<ReservationRoom> newRRs = new ArrayList<>();
            for (ReservationRoom rr : updated.getReservationRooms()) {
                if (rr.getRoom() != null && rr.getRoom().getRoomId() != null) {
                    Room room = roomRepository.findById(rr.getRoom().getRoomId()).orElse(null);
                    rr.setRoom(room);
                    if (room != null && room.getStatus() != null && !"Còn Trống".equals(room.getStatus().getName())) {
                        throw new BadRequestException("Phòng không khả dụng để đặt: " + room.getRoomNumber());
                    }
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

        Reservation saved = reservationRepository.save(existing);
        // mark new rooms as 'Đã đặt'
        RoomStatus booked = roomStatusService.getByName("Đã đặt");
        if (booked == null) booked = roomStatusService.createIfNotExists("Đã đặt");
        if (booked != null && saved.getReservationRooms() != null) {
            for (ReservationRoom rr : saved.getReservationRooms()) {
                if (rr.getRoom() != null) {
                    Room r = rr.getRoom();
                    boolean isOccupied = false;
                    if (r.getStatus() != null && r.getStatus().getName() != null) {
                        String currentStatus = r.getStatus().getName();
                        isOccupied = "Đã nhận phòng".equals(currentStatus) || "Đang dùng phòng".equals(currentStatus);
                    }
                    if (!isOccupied) {
                        r.setStatus(booked);
                        roomRepository.save(r);
                    }
                }
            }
        }
        // If updated status is 'cancelled', revert rooms to 'Còn Trống'
        if ("cancelled".equalsIgnoreCase(updated.getStatus())) {
            RoomStatus free = roomStatusService.getByName("Còn Trống");
            if (free != null) {
                List<ReservationRoom> rrs = reservationRoomRepository.findByReservationReservationId(id);
                for (ReservationRoom rr : rrs) {
                    if (rr.getRoom() != null) {
                        Room r = rr.getRoom();
                        r.setStatus(free);
                        roomRepository.save(r);
                    }
                }
            }
        }
        return saved;
    }

    public void deleteReservation(Integer id) {
        reservationRepository.deleteById(id);
    }
}
