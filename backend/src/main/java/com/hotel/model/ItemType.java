package com.hotel.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "item_types")
@Data
@NoArgsConstructor
public class ItemType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_type_id")
    private Integer itemTypeId;

    @Column(name = "type_name", nullable = false)
    private String typeName;
}
