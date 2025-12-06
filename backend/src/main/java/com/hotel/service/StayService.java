package com.hotel.service;

import com.hotel.model.Stay;
import com.hotel.model.Reservation;
import com.hotel.model.ReservationRoom;
import com.hotel.model.Room;
import com.hotel.model.Guest;
import com.hotel.model.User;
import com.hotel.repository.StayRepository;
import com.hotel.repository.UserRepository;
import com.hotel.repository.ReservationRepository;
import com.hotel.repository.ReservationRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.hotel.repository.RoomRepository;
import com.hotel.service.RoomStatusService;
import com.hotel.model.RoomStatus;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Service
public class StayService {
    @Autowired
    private StayRepository stayRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ReservationRoomRepository reservationRoomRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomStatusService roomStatusService;

    @Autowired
    private InvoiceService invoiceService;

    public List<Stay> createStaysForReservation(Integer reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId).orElse(null);
        if (reservation == null) throw new RuntimeException("Reservation not found");

        List<ReservationRoom> rrs = reservationRoomRepository.findByReservationReservationId(reservationId);
        List<Stay> stays = new ArrayList<>();
        for (ReservationRoom rr : rrs) {
            if (rr.getRoom() == null) continue;
            Stay s = new Stay();
            s.setReservation(reservation);
            s.setGuest(reservation.getGuest());
            s.setRoom(rr.getRoom());
            s.setCheckinTime(new Timestamp(System.currentTimeMillis()));
            // set checkout_time initially to the same as checkin_time because DB schema requires non-null
            s.setCheckoutTime(s.getCheckinTime());
            s.setStatus("checked-in");
            s.setTotalCost(rr.getPrice() != null ? rr.getPrice() : (rr.getPricePerNight() != null ? rr.getPricePerNight() : null));
            if (s.getTotalCost() == null) s.setTotalCost(null);
            // Default to user 1 if no createdByUser
            User u = userRepository.findById(1).orElse(null);
            s.setCreatedByUser(u);
            s.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            stays.add(stayRepository.save(s));
            // set room to 'Đã nhận phòng' when guest checks in
            RoomStatus occupied = roomStatusService.getByName("Đã nhận phòng");
            if (occupied == null) {
                occupied = roomStatusService.createIfNotExists("Đã nhận phòng");
            }
            if (occupied != null) {
                Room room = rr.getRoom();
                room.setStatus(occupied);
                reservationRoomRepository.save(rr); // keep link
                roomRepository.save(room);
            }
        }
        // update reservation status
        reservation.setStatus("checked-in");
        reservationRepository.save(reservation);
        return stays;
    }

    public List<Stay> checkoutStaysForReservation(Integer reservationId) {
        List<Stay> stays = stayRepository.findByReservationReservationIdAndStatus(reservationId, "checked-in");
        for (Stay s : stays) {
            s.setCheckoutTime(new Timestamp(System.currentTimeMillis()));
            s.setStatus("completed");
            // Keep totalCost as is or compute if needed
            stayRepository.save(s);
            // set room to 'Đã trả phòng' on checkout to signal cleaning phase
            RoomStatus returned = roomStatusService.getByName("Đã trả phòng");
            if (returned == null) {
                returned = roomStatusService.createIfNotExists("Đã trả phòng");
            }
            if (returned != null && s.getRoom() != null) {
                Room room = s.getRoom();
                room.setStatus(returned);
                roomRepository.save(room);
            }

            // Tạo hóa đơn từ Stay này
            try {
                invoiceService.createInvoiceFromStay(s.getStayId(), 1);
            } catch (Exception e) {
                // Log error but don't fail checkout if invoice creation fails
                System.err.println("Failed to create invoice for stay " + s.getStayId() + ": " + e.getMessage());
            }
        }
        // update reservation status
        Reservation reservation = reservationRepository.findById(reservationId).orElse(null);
        if (reservation != null) {
            reservation.setStatus("checked-out");
            reservationRepository.save(reservation);
        }
        return stays;
    }
}
