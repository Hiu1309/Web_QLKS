package com.hotel.service;

import com.hotel.dto.DashboardStatsResponse;
import com.hotel.model.Invoice;
import com.hotel.model.Reservation;
import com.hotel.model.ReservationRoom;
import com.hotel.model.Room;
import com.hotel.repository.GuestRepository;
import com.hotel.repository.InvoiceItemRepository;
import com.hotel.repository.InvoiceRepository;
import com.hotel.repository.ItemRepository;
import com.hotel.repository.ReservationRepository;
import com.hotel.repository.ReservationRoomRepository;
import com.hotel.repository.RoomRepository;
import com.hotel.repository.StayRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;

@Service
public class DashboardService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final Locale VI_LOCALE = new Locale("vi", "VN");

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationRoomRepository reservationRoomRepository;
    private final GuestRepository guestRepository;
    private final StayRepository stayRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final ItemRepository itemRepository;

    public DashboardService(RoomRepository roomRepository,
                             ReservationRepository reservationRepository,
                             ReservationRoomRepository reservationRoomRepository,
                             GuestRepository guestRepository,
                             StayRepository stayRepository,
                             InvoiceRepository invoiceRepository,
                             InvoiceItemRepository invoiceItemRepository,
                             ItemRepository itemRepository) {
        this.roomRepository = roomRepository;
        this.reservationRepository = reservationRepository;
        this.reservationRoomRepository = reservationRoomRepository;
        this.guestRepository = guestRepository;
        this.stayRepository = stayRepository;
        this.invoiceRepository = invoiceRepository;
        this.invoiceItemRepository = invoiceItemRepository;
        this.itemRepository = itemRepository;
    }

    public DashboardStatsResponse getDashboardOverview() {
        DashboardStatsResponse response = new DashboardStatsResponse();
        DashboardStatsResponse.Stats stats = response.getStats();

        List<Room> rooms = roomRepository.findAll();
        Map<String, Long> roomStatusCounts = rooms.stream()
                .map(room -> room.getStatus() != null ? room.getStatus().getName() : null)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .collect(Collectors.groupingBy(name -> name.toLowerCase(VI_LOCALE), Collectors.counting()));

        long totalRooms = rooms.size();
        long availableRooms = countStatuses(roomStatusCounts, "còn trống", "đã trả phòng");
        long occupiedRooms = countStatuses(roomStatusCounts, "đã nhận phòng", "đang dùng phòng", "đang sử dụng");
        long bookedRooms = countStatuses(roomStatusCounts, "đã đặt");
        long maintenanceRooms = countStatuses(roomStatusCounts, "đang bảo trì", "bảo trì");
        long cleaningRooms = countStatuses(roomStatusCounts, "dọn dẹp", "đang dọn dẹp");

        stats.setTotalRooms(totalRooms);
        stats.setAvailableRooms(availableRooms);
        stats.setOccupiedRooms(occupiedRooms);
        stats.setBookedRooms(bookedRooms);
        stats.setMaintenanceRooms(maintenanceRooms);
        stats.setCleaningRooms(cleaningRooms);

        stats.setTotalGuests(guestRepository.count());

        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        Timestamp startOfToday = Timestamp.valueOf(today.atStartOfDay());
        Timestamp startOfTomorrow = Timestamp.valueOf(today.plusDays(1).atStartOfDay());
        Timestamp startOfYesterday = Timestamp.valueOf(today.minusDays(1).atStartOfDay());
        Timestamp startOfMonth = Timestamp.valueOf(today.withDayOfMonth(1).atStartOfDay());
        Timestamp startOfYear = Timestamp.valueOf(today.withDayOfYear(1).atStartOfDay());

        stats.setCheckIns(stayRepository.countByCheckinTimeBetween(startOfToday, startOfTomorrow));
        stats.setCheckOuts(stayRepository.countByCheckoutTimeBetween(startOfToday, startOfTomorrow));

        stats.setPendingCheckIns(reservationRepository.countByStatusIgnoreCase("booking"));
        stats.setPendingCheckOuts(stayRepository.countByStatusIgnoreCase("checked-in"));

        double occupancyRate = totalRooms > 0 ? (occupiedRooms * 100.0) / totalRooms : 0.0;
        stats.setOccupancyRate(Math.round(occupancyRate * 10.0) / 10.0);

        BigDecimal todayRevenue = defaultIfNull(invoiceRepository.sumByStatusAndCreatedAtBetween(
                "Đã thanh toán",
                startOfToday,
                startOfTomorrow
        ));
        stats.setTodayRevenue(todayRevenue);

        BigDecimal yesterdayRevenue = defaultIfNull(invoiceRepository.sumByStatusAndCreatedAtBetween(
                "Đã thanh toán",
                startOfYesterday,
                startOfToday
        ));
        stats.setYesterdayRevenue(yesterdayRevenue);

        BigDecimal monthRevenue = defaultIfNull(invoiceRepository.sumByStatusAndCreatedAtBetween(
            "Đã thanh toán",
            startOfMonth,
            startOfTomorrow
        ));
        stats.setMonthRevenue(monthRevenue);

        BigDecimal yearRevenue = defaultIfNull(invoiceRepository.sumByStatusAndCreatedAtBetween(
            "Đã thanh toán",
            startOfYear,
            startOfTomorrow
        ));
        stats.setYearRevenue(yearRevenue);

        stats.setInvoicesToday(invoiceRepository.countByCreatedAtBetween(startOfToday, startOfTomorrow));

        if (occupiedRooms > 0) {
            stats.setAverageDailyRate(todayRevenue.divide(BigDecimal.valueOf(occupiedRooms), 2, RoundingMode.HALF_UP));
        } else {
            stats.setAverageDailyRate(BigDecimal.ZERO);
        }

        stats.setAverageRating(null);
        stats.setCurrency(resolveCurrency());

        List<Reservation> recentReservations = reservationRepository.findTop5ByOrderByCreatedAtDesc();
        List<DashboardStatsResponse.RecentReservationSummary> recentSummaries = recentReservations.stream()
                .map(this::mapReservation)
                .collect(Collectors.toList());
        response.setRecentReservations(recentSummaries);

        stats.setTopRoom(resolveTopRoomUsage());
        stats.setTopService(resolveTopServiceUsage());

        return response;
    }

    private DashboardStatsResponse.RecentReservationSummary mapReservation(Reservation reservation) {
        DashboardStatsResponse.RecentReservationSummary summary = new DashboardStatsResponse.RecentReservationSummary();
        summary.setId(reservation.getReservationId());
        summary.setGuestName(reservation.getGuest() != null ? reservation.getGuest().getFullName() : "Khách lẻ");
        summary.setStatus(reservation.getStatus());
        summary.setArrivalDate(formatDate(reservation.getArrivalDate()));
        summary.setDepartureDate(formatDate(reservation.getDepartureDate()));
        summary.setNights(calculateNights(reservation));
        summary.setRooms(new ArrayList<>(resolveRooms(reservation)));
        summary.setTotalAmount(resolveTotalAmount(reservation));
        return summary;
    }

    private List<String> resolveRooms(Reservation reservation) {
        if (reservation.getReservationRooms() == null) {
            return Collections.emptyList();
        }
        List<String> rooms = new ArrayList<>();
        for (ReservationRoom rr : reservation.getReservationRooms()) {
            if (rr.getRoom() != null && rr.getRoom().getRoomNumber() != null) {
                rooms.add(rr.getRoom().getRoomNumber());
            } else if (rr.getRoomType() != null && rr.getRoomType().getName() != null) {
                rooms.add(rr.getRoomType().getName());
            }
        }
        Collections.sort(rooms);
        return rooms;
    }

    private long calculateNights(Reservation reservation) {
        if (reservation.getArrivalDate() == null || reservation.getDepartureDate() == null) {
            return 0;
        }
        LocalDate arrival = reservation.getArrivalDate().toLocalDateTime().toLocalDate();
        LocalDate departure = reservation.getDepartureDate().toLocalDateTime().toLocalDate();
        long nights = ChronoUnit.DAYS.between(arrival, departure);
        return nights > 0 ? nights : 1;
    }

    private BigDecimal resolveTotalAmount(Reservation reservation) {
        if (reservation.getTotalEstimated() != null) {
            return reservation.getTotalEstimated();
        }
        if (reservation.getReservationRooms() == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal sum = BigDecimal.ZERO;
        for (ReservationRoom rr : reservation.getReservationRooms()) {
            if (rr.getPrice() != null) {
                sum = sum.add(rr.getPrice());
            } else if (rr.getPricePerNight() != null) {
                sum = sum.add(rr.getPricePerNight());
            }
        }
        return sum;
    }

    private String formatDate(java.sql.Timestamp timestamp) {
        if (timestamp == null) {
            return null;
        }
        return timestamp.toLocalDateTime().toLocalDate().format(DATE_FORMATTER);
    }

    private long countStatuses(Map<String, Long> counts, String... statuses) {
        long total = 0L;
        for (String status : statuses) {
            String normalized = status.toLowerCase(VI_LOCALE);
            total += counts.getOrDefault(normalized, 0L);
        }
        return total;
    }

    private BigDecimal defaultIfNull(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private String resolveCurrency() {
        return invoiceRepository.findTopByOrderByCreatedAtDesc()
            .map(Invoice::getCurrency)
            .filter(currency -> currency != null && !currency.isBlank())
            .orElse("VND");
    }

    private DashboardStatsResponse.TopUsage resolveTopRoomUsage() {
        List<Object[]> results = reservationRoomRepository.findTopBookedRooms(PageRequest.of(0, 1));
        if (results.isEmpty()) {
            return null;
        }
        Object[] row = results.get(0);
        if (row == null || row.length < 2 || row[0] == null) {
            return null;
        }
        Integer roomId = ((Number) row[0]).intValue();
        Long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
        return roomRepository.findById(roomId)
                .map(room -> {
                    DashboardStatsResponse.TopUsage usage = new DashboardStatsResponse.TopUsage();
                    usage.setName(room.getRoomNumber());
                    usage.setCount(count);
                    usage.setImage(room.getImage());
                    return usage;
                })
                .orElse(null);
    }

    private DashboardStatsResponse.TopUsage resolveTopServiceUsage() {
        List<Object[]> results = invoiceItemRepository.findTopUsedItems(PageRequest.of(0, 1));
        if (results.isEmpty()) {
            return null;
        }
        Object[] row = results.get(0);
        if (row == null || row.length < 2 || row[0] == null) {
            return null;
        }
        Integer itemId = ((Number) row[0]).intValue();
        Long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
        return itemRepository.findById(itemId)
                .map(item -> {
                    DashboardStatsResponse.TopUsage usage = new DashboardStatsResponse.TopUsage();
                    usage.setName(item.getItemName());
                    usage.setCount(count);
                    usage.setImage(item.getImage());
                    return usage;
                })
                .orElse(null);
    }
}
