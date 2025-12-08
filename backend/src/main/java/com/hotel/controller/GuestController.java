package com.hotel.controller;

import com.hotel.model.Guest;
import com.hotel.service.GuestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guests")
@CrossOrigin(origins = "*")
public class GuestController {
    @Autowired
    private GuestService guestService;

    @GetMapping
    public List<Guest> getAllGuests() { return guestService.getAllGuests(); }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Guest> getById(@PathVariable Integer id) { return guestService.getGuestById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build()); }

    @GetMapping("/find")
    public List<Guest> search(@RequestParam(value = "idNumber", required = false) String idNumber,
                              @RequestParam(value = "q", required = false) String q,
                              @RequestParam(value = "idType", required = false) String idType) {
        String searchTerm = q != null ? q : idNumber;
        System.out.println("Guest search called with q="+q+" idNumber="+idNumber+" idType="+idType+" => searchTerm="+searchTerm);
        return guestService.searchGuests(searchTerm, idType);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Guest g) {
        if (g.getDob() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Ngày sinh là bắt buộc"));
        }
        if (!g.isAdult()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Khách hàng phải từ 18 tuổi trở lên"));
        }
        if (guestService.isPhoneDuplicate(g.getPhone(), null)) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Số điện thoại này đã tồn tại"));
        }
        if (guestService.isIdNumberDuplicate(g.getIdNumber(), null)) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Mã giấy tờ này đã tồn tại"));
        }
        return ResponseEntity.ok(guestService.addGuest(g));
    }

    public static class ErrorResponse {
        public String message;
        public ErrorResponse(String message) {
            this.message = message;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Guest g) {
        if (g.getDob() == null) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Ngày sinh là bắt buộc"));
        }
        if (!g.isAdult()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Khách hàng phải từ 18 tuổi trở lên"));
        }
        if (guestService.isPhoneDuplicate(g.getPhone(), id)) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Số điện thoại này đã tồn tại"));
        }
        if (guestService.isIdNumberDuplicate(g.getIdNumber(), id)) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Mã giấy tờ này đã tồn tại"));
        }
        try {
            return ResponseEntity.ok(guestService.updateGuest(id, g));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) { guestService.deleteGuest(id); return ResponseEntity.noContent().build(); }
}
