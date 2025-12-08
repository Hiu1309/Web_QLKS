package com.hotel.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Entity
@Table(name = "invoice_items")
@Data
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_item_id")
    private Integer invoiceItemId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "invoice_id", nullable = false)
    @JsonBackReference
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "posted_date")
    private Timestamp postedDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "posted_by_user_id")
    private User postedByUser;

    @PrePersist
    protected void onCreate() {
        postedDate = new Timestamp(System.currentTimeMillis());
    }
}
