package com.hotel.dto;

public record RoomDTO(
        Integer roomId,
        String roomNumber,
        Integer roomTypeId,
        String roomTypeName,
        Double price,
        Integer statusId,
        String statusName,
        String floor,
        Integer bedCount,
        Integer maxOccupancy,
        String image
) {}
