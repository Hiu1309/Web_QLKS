package com.hotel.controller;

import com.hotel.model.Invoice;
import com.hotel.model.InvoiceItem;
import com.hotel.model.Item;
import com.hotel.model.Room;
import com.hotel.model.RoomType;
import com.hotel.model.Guest;
import com.hotel.model.Reservation;
import com.hotel.model.Stay;
import com.hotel.service.InvoiceService;
import com.hotel.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private ItemRepository itemRepository;

    /**
     * Lấy tất cả hóa đơn
     */
    @GetMapping
    public ResponseEntity<List<InvoiceDTO>> getAllInvoices() {
        List<Invoice> invoices = invoiceService.getAllInvoices();
        List<InvoiceDTO> dtoList = invoices.stream().map(InvoiceDTO::fromEntity).toList();
        return ResponseEntity.ok(dtoList);
    }

    /**
     * Lấy hóa đơn theo ID
     */
    @GetMapping("/{invoiceId}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Integer invoiceId) {
        Optional<Invoice> invoice = invoiceService.getInvoiceById(invoiceId);
        if (invoice.isPresent()) {
            return ResponseEntity.ok(invoice.get());
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Lấy hóa đơn theo Guest ID
     */
    @GetMapping("/guest/{guestId}")
    public ResponseEntity<List<Invoice>> getInvoicesByGuestId(@PathVariable Integer guestId) {
        List<Invoice> invoices = invoiceService.getInvoicesByGuestId(guestId);
        return ResponseEntity.ok(invoices);
    }

    /**
     * Lấy hóa đơn theo Stay ID
     */
    @GetMapping("/stay/{stayId}")
    public ResponseEntity<Invoice> getInvoiceByStayId(@PathVariable Integer stayId) {
        Optional<Invoice> invoice = invoiceService.getInvoiceByStayId(stayId);
        if (invoice.isPresent()) {
            return ResponseEntity.ok(invoice.get());
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Tạo hóa đơn từ Stay (được gọi khi trả phòng)
     */
    @PostMapping("/create-from-stay/{stayId}")
    public ResponseEntity<Invoice> createInvoiceFromStay(
            @PathVariable Integer stayId,
            @RequestParam(defaultValue = "1") Integer createdByUserId) {
        try {
            Invoice invoice = invoiceService.createInvoiceFromStay(stayId, createdByUserId);
            return ResponseEntity.status(HttpStatus.CREATED).body(invoice);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Cập nhật hóa đơn
     */
    @PutMapping("/{invoiceId}")
    public ResponseEntity<Invoice> updateInvoice(
            @PathVariable Integer invoiceId,
            @RequestBody Invoice invoiceDetails) {
        try {
            Invoice updatedInvoice = invoiceService.updateInvoice(invoiceId, invoiceDetails);
            return ResponseEntity.ok(updatedInvoice);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Xóa hóa đơn
     */
    @DeleteMapping("/{invoiceId}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Integer invoiceId) {
        invoiceService.deleteInvoice(invoiceId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Thêm dịch vụ vào hóa đơn
     */
    @PostMapping("/{invoiceId}/services/{itemId}")
    public ResponseEntity<InvoiceItem> addServiceToInvoice(
            @PathVariable Integer invoiceId,
            @PathVariable Integer itemId,
            @RequestParam BigDecimal amount,
            @RequestParam(defaultValue = "1") Integer postedByUserId) {
        try {
            Optional<Item> itemOpt = itemRepository.findById(itemId);
            if (!itemOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            InvoiceItem invoiceItem = invoiceService.addServiceToInvoice(
                    invoiceId,
                    itemOpt.get(),
                    amount,
                    postedByUserId
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(invoiceItem);
        } catch (RuntimeException e) {
            e.printStackTrace();
            System.err.println("Error adding service to invoice: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Lấy các mục của hóa đơn
     */
    @GetMapping("/{invoiceId}/items")
    public ResponseEntity<List<InvoiceItem>> getInvoiceItems(@PathVariable Integer invoiceId) {
        List<InvoiceItem> items = invoiceService.getInvoiceItems(invoiceId);
        return ResponseEntity.ok(items);
    }

    // lightweight DTOs to avoid deep recursive serialization
    static class InvoiceDTO {
        public Integer invoiceId;
        public String status;
        public String currency;
        public String createdAt;
        public String balance;
        public ReservationDTO reservation;
        public StayDTO stay;
        public GuestDTO guest;

        static InvoiceDTO fromEntity(Invoice invoice) {
            InvoiceDTO dto = new InvoiceDTO();
            dto.invoiceId = invoice.getInvoiceId();
            dto.status = invoice.getStatus();
            dto.currency = invoice.getCurrency();
            dto.balance = invoice.getBalance() != null ? invoice.getBalance().toPlainString() : null;
            dto.createdAt = invoice.getCreatedAt() != null ? invoice.getCreatedAt().toInstant().toString() : null;

            Stay stay = invoice.getStay();
            if (stay != null) {
                dto.stay = new StayDTO();
                dto.stay.totalCost = stay.getTotalCost() != null ? stay.getTotalCost().toString() : null;
                dto.stay.checkIn = stay.getCheckinTime() != null ? stay.getCheckinTime().toInstant().toString() : null;
                dto.stay.checkOut = stay.getCheckoutTime() != null ? stay.getCheckoutTime().toInstant().toString() : null;
            }

            Reservation reservation = stay != null ? stay.getReservation() : null;
            if (reservation != null) {
                dto.reservation = new ReservationDTO();
                dto.reservation.reservationId = reservation.getReservationId();
                dto.reservation.checkIn = dto.stay != null ? dto.stay.checkIn : null;
                dto.reservation.checkOut = dto.stay != null ? dto.stay.checkOut : null;
            }

            Guest guest = invoice.getGuest();
            if (guest != null) {
                dto.guest = new GuestDTO();
                dto.guest.fullName = guest.getFullName();
                dto.guest.email = guest.getEmail();
                dto.guest.phone = guest.getPhone();
                dto.guest.idType = guest.getIdType();
                dto.guest.idNumber = guest.getIdNumber();
            }

            Room room = stay != null ? stay.getRoom() : null;
            if (room != null) {
                RoomType type = room.getRoomType();
                RoomTypeDTO typeDto = null;
                if (type != null) {
                    typeDto = new RoomTypeDTO();
                    typeDto.name = type.getName();
                    typeDto.basePrice = type.getBasePrice() != null ? type.getBasePrice().toString() : null;
                }
                RoomDTO roomDto = new RoomDTO();
                roomDto.roomNumber = room.getRoomNumber();
                roomDto.roomType = typeDto;
                if (dto.reservation != null) {
                    dto.reservation.room = roomDto;
                } else {
                    dto.reservation = new ReservationDTO();
                    dto.reservation.room = roomDto;
                }
            }
            return dto;
        }
    }

    static class ReservationDTO {
        public Integer reservationId;
        public String checkIn;
        public String checkOut;
        public RoomDTO room;
    }

    static class StayDTO {
        public String totalCost;
        public String checkIn;
        public String checkOut;
    }

    static class GuestDTO {
        public String fullName;
        public String email;
        public String phone;
        public String idType;
        public String idNumber;
    }

    static class RoomDTO {
        public String roomNumber;
        public RoomTypeDTO roomType;
    }

    static class RoomTypeDTO {
        public String name;
        public String basePrice;
    }
}
