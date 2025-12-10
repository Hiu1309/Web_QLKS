package com.hotel.repository;

import com.hotel.model.InvoiceItem;
import org.springframework.data.domain.Pageable;
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

    @Query("SELECT ii.item.itemId, COUNT(ii) FROM InvoiceItem ii WHERE ii.item IS NOT NULL GROUP BY ii.item.itemId ORDER BY COUNT(ii) DESC")
    List<Object[]> findTopUsedItems(Pageable pageable);
}

