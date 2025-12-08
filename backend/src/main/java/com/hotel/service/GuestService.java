package com.hotel.service;

import com.hotel.model.Guest;
import com.hotel.repository.GuestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GuestService {
    @Autowired
    private GuestRepository guestRepository;

    public List<Guest> getAllGuests() { return guestRepository.findAll(); }
    public Optional<Guest> getGuestById(Integer id) { return guestRepository.findById(id); }
    
    public Guest addGuest(Guest guest) { 
        return guestRepository.save(guest); 
    }
    
    public Guest updateGuest(Integer id, Guest updated) {
        Guest existing = guestRepository.findById(id).orElseThrow(() -> new RuntimeException("Guest not found"));
        existing.setFullName(updated.getFullName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setDob(updated.getDob());
        existing.setIdType(updated.getIdType());
        existing.setIdNumber(updated.getIdNumber());
        return guestRepository.save(existing);
    }
    
    public void deleteGuest(Integer id) { guestRepository.deleteById(id); }

    public List<Guest> searchGuests(String q, String idType) {
        String query = (q == null || q.isBlank()) ? null : q.toLowerCase();
        String type = (idType == null || idType.isBlank()) ? null : idType;
        return guestRepository.searchByQueryAndType(query, type);
    }
    
    public boolean isPhoneDuplicate(String phone, Integer excludeGuestId) {
        Optional<Guest> existing = guestRepository.findByPhone(phone);
        if (existing.isEmpty()) return false;
        return !existing.get().getGuestId().equals(excludeGuestId);
    }
    
    public boolean isIdNumberDuplicate(String idNumber, Integer excludeGuestId) {
        Optional<Guest> existing = guestRepository.findByIdNumber(idNumber);
        if (existing.isEmpty()) return false;
        return !existing.get().getGuestId().equals(excludeGuestId);
    }
}
