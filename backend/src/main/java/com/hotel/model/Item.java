package com.hotel.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "items")
@Data
@NoArgsConstructor
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Integer itemId;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "status")
    private String status;

    @Column(name = "image")
    private String image;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "item_type_id")
    private ItemType itemType;
}
