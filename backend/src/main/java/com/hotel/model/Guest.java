package com.hotel.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
    private java.sql.Date dob;
    @Column(name = "id_type")
    private String idType;
    @Column(name = "id_number")
    private String idNumber;
}
