package com.hotel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardStatsResponse {
    private Stats stats = new Stats();
    private List<RecentReservationSummary> recentReservations = new ArrayList<>();

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Stats {
        private long totalRooms;
        private long occupiedRooms;
        private long availableRooms;
        private long bookedRooms;
        private long maintenanceRooms;
        private long cleaningRooms;
        private long totalGuests;
        private long checkIns;
        private long checkOuts;
        private long pendingCheckIns;
        private long pendingCheckOuts;
        private double occupancyRate;
        private BigDecimal todayRevenue = BigDecimal.ZERO;
        private BigDecimal yesterdayRevenue = BigDecimal.ZERO;
        private BigDecimal averageDailyRate = BigDecimal.ZERO;
        private Double averageRating;
        private String currency = "VND";
        private long invoicesToday;
    }

    @Data
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class RecentReservationSummary {
        private Integer id;
        private String guestName;
        private List<String> rooms = new ArrayList<>();
        private String arrivalDate;
        private String departureDate;
        private String status;
        private BigDecimal totalAmount = BigDecimal.ZERO;
        private long nights;
    }
}
