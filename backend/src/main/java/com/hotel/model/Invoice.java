package com.hotel.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "invoice")
@Data
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id")
    private Integer invoiceId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "stay_id", nullable = false)
    private Stay stay;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "guest_id", nullable = false)
    private Guest guest;

    @Column(name = "currency")
    private String currency = "VND";

    @Column(name = "balance")
    private BigDecimal balance = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by_user_id")
    private User createdByUser;

    @Column(name = "created_at")
    private Timestamp createdAt;

    @Column(name = "status")
    private String status = "Chưa thanh toán"; // default unpaid, else cancelled/đã thanh toán

    @Column(name = "payment_method")
    private String paymentMethod = ""; // cash, card, transfer, etc.

    @OneToMany(mappedBy = "invoice", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<InvoiceItem> invoiceItems;

    @PrePersist
    protected void onCreate() {
        createdAt = new Timestamp(System.currentTimeMillis());
    }
}
