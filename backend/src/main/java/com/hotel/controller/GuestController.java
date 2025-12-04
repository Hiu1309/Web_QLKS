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
    public Guest create(@RequestBody Guest g) { return guestService.addGuest(g); }

    @PutMapping("/{id}")
    public ResponseEntity<Guest> update(@PathVariable Integer id, @RequestBody Guest g) { try { return ResponseEntity.ok(guestService.updateGuest(id, g)); } catch (RuntimeException e) { return ResponseEntity.notFound().build(); } }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) { guestService.deleteGuest(id); return ResponseEntity.noContent().build(); }
}
