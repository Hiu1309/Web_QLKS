package com.hotel.repository;

import com.hotel.model.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Integer> {
    List<InvoiceItem> findByInvoice_InvoiceId(Integer invoiceId);
    
    @Query("SELECT i FROM InvoiceItem i WHERE i.invoice.invoiceId = :invoiceId")
    List<InvoiceItem> findItemsByInvoiceId(@Param("invoiceId") Integer invoiceId);
}

