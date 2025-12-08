package com.hotel.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.sql.Timestamp;

@Entity
@Table(name = "guests")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Guest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "guest_id")
    private Integer guestId;

    @Column(name = "full_name")
    private String fullName;

    private String email;
    private String phone;

    @Column(name = "dob", nullable = false)
    private java.sql.Date dob;
    @Column(name = "id_type")
    private String idType;
    @Column(name = "id_number")
    private String idNumber;
    
    @Column(name = "created_at")
    private Timestamp createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Timestamp(System.currentTimeMillis());
    }

    public boolean isAdult() {
        if (dob == null) return false;
        java.time.LocalDate dobLocalDate = dob.toLocalDate();
        java.time.LocalDate today = java.time.LocalDate.now();
        int age = today.getYear() - dobLocalDate.getYear();
        if (today.getMonthValue() < dobLocalDate.getMonthValue() ||
            (today.getMonthValue() == dobLocalDate.getMonthValue() && today.getDayOfMonth() < dobLocalDate.getDayOfMonth())) {
            age--;
        }
        return age >= 18;
    }
}
