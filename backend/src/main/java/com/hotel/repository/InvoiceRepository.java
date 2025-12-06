package com.hotel.repository;

import com.hotel.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {
    List<Invoice> findByGuest_GuestId(Integer guestId);
    Optional<Invoice> findByStay_StayId(Integer stayId);
}
