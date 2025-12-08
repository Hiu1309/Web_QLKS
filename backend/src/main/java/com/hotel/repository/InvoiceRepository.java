package com.hotel.repository;

import com.hotel.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Integer> {
    List<Invoice> findByGuest_GuestId(Integer guestId);
    Optional<Invoice> findByStay_StayId(Integer stayId);
    Optional<Invoice> findTopByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(i.balance), 0) FROM Invoice i WHERE LOWER(i.status) = LOWER(:status) AND i.createdAt BETWEEN :start AND :end")
    BigDecimal sumByStatusAndCreatedAtBetween(@Param("status") String status,
                                             @Param("start") Timestamp start,
                                             @Param("end") Timestamp end);

    long countByCreatedAtBetween(Timestamp start, Timestamp end);
}
