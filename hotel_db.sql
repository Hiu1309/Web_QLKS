-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th12 06, 2025 lúc 08:21 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `hotel_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `guests`
--

CREATE TABLE `guests` (
  `guest_id` int(11) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `dob` date NOT NULL,
  `id_type` varchar(255) DEFAULT NULL,
  `id_number` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `guests`
--

INSERT INTO `guests` (`guest_id`, `full_name`, `email`, `phone`, `dob`, `id_type`, `id_number`, `created_at`) VALUES
(1, 'Pham Thi D', 'phamthid@example.com', '0987654321', '1995-03-15', 'CCCD', '123456789', '2025-11-26 01:47:21'),
(2, 'Nguyen Van E', 'nguyenvane@example.com', '0976543210', '1988-07-22', 'Hộ chiếu', 'B987654321', '2025-11-26 01:47:21'),
(3, 'Tran Van F', 'tranvanf@example.com', '0965432109', '2000-12-05', 'CCCD', '234567890', '2025-11-26 01:47:21');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `invoice`
--

CREATE TABLE `invoice` (
  `invoice_id` int(11) NOT NULL,
  `stay_id` int(11) NOT NULL,
  `guest_id` int(11) NOT NULL,
  `currency` varchar(255) DEFAULT NULL,
  `balance` decimal(38,2) DEFAULT NULL,
  `created_by_user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `status` varchar(255) DEFAULT 'Chưa thanh toán',
  `payment_method` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `invoice`
--

INSERT INTO `invoice` (`invoice_id`, `stay_id`, `guest_id`, `currency`, `balance`, `created_by_user_id`, `created_at`, `status`, `payment_method`) VALUES
(1, 24, 1, 'VND', 4450000.00, 1, '2025-12-05 02:26:07', 'Chưa thanh toán', ''),
(2, 23, 1, 'VND', 700000.00, 1, '2025-12-05 02:30:44', 'Chưa thanh toán', ''),
(3, 25, 2, 'VND', 300000.00, 1, '2025-12-05 02:30:58', 'Chưa thanh toán', ''),
(4, 26, 1, 'VND', 1350000.00, 1, '2025-12-05 02:33:12', 'Chưa thanh toán', ''),
(5, 27, 1, 'VND', 1500000.00, 1, '2025-12-05 02:33:12', 'Chưa thanh toán', ''),
(6, 28, 1, 'VND', 700000.00, 1, '2025-12-05 02:57:41', 'Chưa thanh toán', ''),
(7, 29, 1, 'VND', 1350000.00, 1, '2025-12-05 03:06:23', 'Chưa thanh toán', ''),
(8, 30, 1, 'VND', 300000.00, 1, '2025-12-05 03:06:23', 'Chưa thanh toán', ''),
(9, 31, 2, 'VND', 300000.00, 1, '2025-12-05 03:30:31', 'Chưa thanh toán', ''),
(10, 32, 1, 'VND', 700000.00, 1, '2025-12-05 03:56:14', 'Chưa thanh toán', ''),
(11, 33, 2, 'VND', 1350000.00, 1, '2025-12-05 03:56:16', 'Chưa thanh toán', ''),
(12, 34, 1, 'VND', 1580000.00, 1, '2025-12-05 04:05:19', 'Đã thanh toán', 'Chuyển khoản'),
(13, 37, 3, 'VND', 0.00, 1, '2025-12-05 21:17:02', 'cancelled', 'Tiền mặt');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `invoice_items`
--

CREATE TABLE `invoice_items` (
  `invoice_item_id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `amount` decimal(38,2) DEFAULT NULL,
  `posted_date` datetime NOT NULL DEFAULT current_timestamp(),
  `posted_by_user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `invoice_items`
--

INSERT INTO `invoice_items` (`invoice_item_id`, `invoice_id`, `item_id`, `amount`, `posted_date`, `posted_by_user_id`) VALUES
(15, 12, 1, 150000.00, '2025-12-06 07:04:52', 1),
(16, 12, 2, 80000.00, '2025-12-06 07:04:52', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `items`
--

CREATE TABLE `items` (
  `item_id` int(11) NOT NULL,
  `item_type_id` int(11) DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `price` double NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `items`
--

INSERT INTO `items` (`item_id`, `item_type_id`, `item_name`, `price`, `status`, `image`) VALUES
(1, 3, 'Phòng ăn', 150000, 'Còn hoạt động', 'uploads/services/room-service.jpg'),
(2, 1, 'Giặt ủi', 80000, 'Còn hoạt động', 'uploads/services/laundry.jpg'),
(3, 2, 'Spa & massage', 300000, 'Còn hoạt động', 'uploads/services/spa-massage.jpg'),
(4, 1, 'Hồ bơi', 200000, 'Còn hoạt động', 'uploads/services/swimming-pool.jpg'),
(5, 2, 'Gym', 120000, 'Còn hoạt động', 'uploads/services/gym.jpg');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `item_types`
--

CREATE TABLE `item_types` (
  `item_type_id` int(11) NOT NULL,
  `type_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `item_types`
--

INSERT INTO `item_types` (`item_type_id`, `type_name`) VALUES
(1, 'Tiện ích'),
(2, 'Sức khỏe'),
(3, 'Ăn uống');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reservations`
--

CREATE TABLE `reservations` (
  `reservation_id` int(11) NOT NULL,
  `guest_id` int(11) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `arrival_date` datetime(6) NOT NULL,
  `departure_date` datetime(6) NOT NULL,
  `num_guests` int(11) NOT NULL DEFAULT 1,
  `total_estimated` decimal(38,2) DEFAULT NULL,
  `created_by_user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `reservations`
--

INSERT INTO `reservations` (`reservation_id`, `guest_id`, `status`, `arrival_date`, `departure_date`, `num_guests`, `total_estimated`, `created_by_user_id`, `created_at`) VALUES
(1, 1, 'cancelled', '2025-12-01 00:00:00.000000', '2025-12-03 00:00:00.000000', 1, 600000.00, 1, '2025-11-26 01:47:54'),
(2, 2, 'cancelled', '2025-12-05 00:00:00.000000', '2025-12-07 00:00:00.000000', 2, 1400000.00, 2, '2025-11-26 01:47:55'),
(13, 1, 'checked-out', '2025-11-29 17:00:00.000000', '2025-12-04 17:00:00.000000', 3, 7500000.00, 1, '2025-11-29 08:19:06'),
(14, 3, 'checked-out', '2025-11-30 17:00:00.000000', '2025-12-02 17:00:00.000000', 3, 4100000.00, 1, '2025-11-30 08:52:01'),
(15, 3, 'cancelled', '2025-11-30 17:00:00.000000', '2025-12-01 17:00:00.000000', 1, 1800000.00, 1, '2025-11-30 08:52:01'),
(16, 1, 'cancelled', '2025-12-01 17:00:00.000000', '2025-12-04 17:00:00.000000', 1, 900000.00, 1, '2025-11-30 10:03:36'),
(17, 1, 'cancelled', '2025-12-01 17:00:00.000000', '2025-12-04 17:00:00.000000', 1, 900000.00, 1, '2025-11-30 10:03:36'),
(18, 1, 'checked-out', '2025-12-01 17:00:00.000000', '2025-12-03 17:00:00.000000', 2, 600000.00, 1, '2025-11-30 10:47:38'),
(19, 2, 'checked-out', '2025-12-05 17:00:00.000000', '2025-12-07 17:00:00.000000', 2, 2700000.00, 1, '2025-11-30 10:55:52'),
(20, 1, 'checked-out', '2025-12-01 17:00:00.000000', '2025-12-02 17:00:00.000000', 1, 2500000.00, 1, '2025-11-30 16:34:48'),
(21, 3, 'cancelled', '2025-12-03 17:00:00.000000', '2025-12-05 17:00:00.000000', 4, 2800000.00, 1, '2025-12-03 06:16:18'),
(22, 2, 'checked-out', '2025-12-03 17:00:00.000000', '2025-12-05 17:00:00.000000', 3, 3300000.00, 1, '2025-12-03 06:53:56'),
(23, 1, 'checked-out', '2025-12-04 00:00:00.000000', '2025-12-06 00:00:00.000000', 1, 5700000.00, 1, '2025-12-03 06:58:17'),
(24, 1, 'checked-out', '2025-12-07 00:00:00.000000', '2025-12-08 00:00:00.000000', 2, 1000000.00, 1, '2025-12-03 08:04:03'),
(25, 1, 'checked-out', '2025-12-04 00:00:00.000000', '2025-12-05 00:00:00.000000', 2, 1650000.00, 1, '2025-12-03 08:22:02'),
(26, 1, 'checked-out', '2025-12-04 00:00:00.000000', '2025-12-05 00:00:00.000000', 4, 1350000.00, 1, '2025-12-03 08:38:52'),
(27, 1, 'checked-out', '2025-12-05 00:00:00.000000', '2025-12-07 00:00:00.000000', 6, 3300000.00, 1, '2025-12-03 12:49:26'),
(28, 1, 'checked-out', '2025-12-04 00:00:00.000000', '2025-12-07 00:00:00.000000', 2, 2100000.00, 1, '2025-12-03 12:50:59'),
(29, 1, 'checked-out', '2025-12-04 00:00:00.000000', '2025-12-05 00:00:00.000000', 1, 700000.00, 1, '2025-12-03 13:32:16'),
(30, 2, 'checked-out', '2025-12-04 00:00:00.000000', '2025-12-06 00:00:00.000000', 2, 600000.00, 1, '2025-12-03 13:42:04'),
(31, 1, 'checked-out', '2025-12-10 00:00:00.000000', '2025-12-30 00:00:00.000000', 6, 89000000.00, 1, '2025-12-04 14:59:44'),
(32, 1, 'checked-out', '2025-12-06 00:00:00.000000', '2025-12-08 00:00:00.000000', 4, 5700000.00, 1, '2025-12-05 02:31:48'),
(33, 1, 'checked-out', '2025-12-07 00:00:00.000000', '2025-12-09 00:00:00.000000', 2, 1400000.00, 1, '2025-12-05 02:57:24'),
(34, 1, 'checked-out', '2025-12-07 00:00:00.000000', '2025-12-10 00:00:00.000000', 1, 4950000.00, 1, '2025-12-05 03:05:17'),
(35, 2, 'checked-out', '2025-12-07 00:00:00.000000', '2025-12-09 00:00:00.000000', 2, 600000.00, 1, '2025-12-05 03:30:14'),
(36, 2, 'checked-out', '2025-12-06 00:00:00.000000', '2025-12-07 00:00:00.000000', 1, 1350000.00, 1, '2025-12-05 03:33:33'),
(37, 1, 'checked-out', '2025-12-08 00:00:00.000000', '2025-12-11 00:00:00.000000', 1, 2100000.00, 1, '2025-12-05 03:42:31'),
(38, 1, 'cancelled', '2025-12-07 00:00:00.000000', '2025-12-09 00:00:00.000000', 1, 2700000.00, 1, '2025-12-05 03:57:02'),
(39, 1, 'checked-out', '2025-12-06 00:00:00.000000', '2025-12-07 00:00:00.000000', 1, 1350000.00, 1, '2025-12-05 04:01:56'),
(40, 1, 'checked-out', '2025-12-06 00:00:00.000000', '2025-12-08 00:00:00.000000', 1, 3000000.00, 1, '2025-12-05 04:09:28'),
(41, 3, 'checked-out', '2025-12-06 00:00:00.000000', '2025-12-07 00:00:00.000000', 1, 700000.00, 1, '2025-12-05 04:24:38'),
(42, 3, 'checked-out', '2025-12-07 00:00:00.000000', '2025-12-09 00:00:00.000000', 1, 8900000.00, 1, '2025-12-05 21:16:53');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reservation_rooms`
--

CREATE TABLE `reservation_rooms` (
  `id` bigint(20) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `room_type_id` int(11) NOT NULL,
  `price` decimal(38,2) DEFAULT NULL,
  `price_per_night` decimal(38,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `reservation_rooms`
--

INSERT INTO `reservation_rooms` (`id`, `reservation_id`, `room_id`, `room_type_id`, `price`, `price_per_night`) VALUES
(36, 13, 5, 3, 7500000.00, 1500000.00),
(45, 14, 4, 5, 2700000.00, 1350000.00),
(46, 14, 3, 2, 1400000.00, 700000.00),
(49, 18, 1, 1, NULL, 300000.00),
(50, 19, 2, 5, NULL, 1350000.00),
(51, 20, 5, 3, NULL, 1500000.00),
(52, 20, 3, 2, NULL, 700000.00),
(53, 20, 1, 1, NULL, 300000.00),
(56, 22, 1, 1, NULL, 300000.00),
(57, 22, 2, 5, NULL, 1350000.00),
(58, 23, 5, 3, NULL, 1500000.00),
(59, 23, 4, 5, NULL, 1350000.00),
(60, 24, 1, 1, NULL, 300000.00),
(61, 24, 21, 2, NULL, 700000.00),
(62, 25, 1, 1, NULL, 300000.00),
(63, 25, 2, 5, NULL, 1350000.00),
(64, 26, 2, 5, NULL, 1350000.00),
(65, 27, 1, 1, NULL, 300000.00),
(66, 27, 2, 5, NULL, 1350000.00),
(67, 28, 3, 2, NULL, 700000.00),
(68, 29, 3, 2, NULL, 700000.00),
(69, 30, 1, 1, NULL, 300000.00),
(70, 31, 29, 9, NULL, 4450000.00),
(71, 32, 2, 5, NULL, 1350000.00),
(72, 32, 5, 3, NULL, 1500000.00),
(73, 33, 21, 2, NULL, 700000.00),
(74, 34, 2, 5, NULL, 1350000.00),
(75, 34, 1, 1, NULL, 300000.00),
(76, 35, 1, 1, NULL, 300000.00),
(77, 36, 2, 5, NULL, 1350000.00),
(78, 37, 3, 2, NULL, 700000.00),
(80, 39, 4, 5, NULL, 1350000.00),
(81, 40, 5, 3, NULL, 1500000.00),
(82, 41, 21, 2, NULL, 700000.00),
(83, 42, 29, 9, NULL, 4450000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(1, 'Quản lý'),
(2, 'Lễ tân'),
(3, 'Buồng phòng');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `rooms`
--

CREATE TABLE `rooms` (
  `room_id` int(11) NOT NULL,
  `room_number` varchar(255) NOT NULL,
  `room_type_id` int(11) NOT NULL,
  `floor` varchar(255) DEFAULT NULL,
  `status_id` int(11) NOT NULL,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `rooms`
--

INSERT INTO `rooms` (`room_id`, `room_number`, `room_type_id`, `floor`, `status_id`, `image`) VALUES
(1, '101', 1, '1', 3, 'uploads/rooms/standard.jpg'),
(2, '102', 5, '1', 3, 'uploads/rooms/standard.jpg'),
(3, '201', 2, '2', 3, 'uploads/rooms/deluxe.jpg'),
(4, '202', 5, '2', 3, 'uploads/rooms/deluxe.jpg'),
(5, '301', 3, '3', 3, 'uploads/rooms/vip.jpg'),
(21, '203', 2, '2', 3, 'uploads/rooms/deluxe.jpg'),
(29, '304', 9, '3', 3, 'uploads/rooms/vip.jpg');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `room_statuses`
--

CREATE TABLE `room_statuses` (
  `status_id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `room_statuses`
--

INSERT INTO `room_statuses` (`status_id`, `name`) VALUES
(1, 'Còn Trống'),
(2, 'Đã nhận phòng'),
(3, 'Đã trả phòng'),
(4, 'Dọn dẹp'),
(5, 'Đang bảo trì'),
(7, 'Đã đặt');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `room_types`
--

CREATE TABLE `room_types` (
  `room_type_id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `max_occupancy` int(11) NOT NULL,
  `base_price` double DEFAULT NULL,
  `bed_count` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `room_types`
--

INSERT INTO `room_types` (`room_type_id`, `name`, `max_occupancy`, `base_price`, `bed_count`) VALUES
(1, 'Standard', 2, 300000, 1),
(2, 'Deluxe', 2, 700000, 1),
(3, 'Vip', 2, 1500000, 1),
(4, 'Standard 2', 4, 550000, 2),
(5, 'Deluxe 2', 4, 1350000, 2),
(6, 'Vip 2', 4, 2950000, 2),
(7, 'Standard 3', 6, 850000, 3),
(8, 'Deluxe 3', 6, 2050000, 3),
(9, 'Vip 3', 6, 4450000, 3);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `stays`
--

CREATE TABLE `stays` (
  `stay_id` int(11) NOT NULL,
  `reservation_id` int(11) NOT NULL,
  `guest_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `checkin_time` datetime NOT NULL,
  `checkout_time` datetime NOT NULL,
  `total_cost` decimal(38,2) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `created_by_user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `stays`
--

INSERT INTO `stays` (`stay_id`, `reservation_id`, `guest_id`, `room_id`, `checkin_time`, `checkout_time`, `total_cost`, `status`, `created_by_user_id`, `created_at`) VALUES
(1, 13, 1, 5, '2025-11-30 09:53:49', '2025-11-30 09:54:32', 7500000.00, 'checked-out', 1, '2025-11-30 09:53:49'),
(2, 14, 3, 4, '2025-11-30 09:55:52', '2025-11-30 09:57:48', 2700000.00, 'checked-out', 1, '2025-11-30 09:55:52'),
(3, 14, 3, 3, '2025-11-30 09:55:52', '2025-11-30 09:57:48', 1400000.00, 'checked-out', 1, '2025-11-30 09:55:52'),
(4, 18, 1, 1, '2025-11-30 10:48:02', '2025-11-30 10:48:25', 300000.00, 'checked-out', 1, '2025-11-30 10:48:02'),
(5, 19, 2, 2, '2025-11-30 16:33:36', '2025-11-30 16:33:40', 1350000.00, 'checked-out', 1, '2025-11-30 16:33:36'),
(6, 19, 2, 2, '2025-11-30 16:33:36', '2025-11-30 16:33:40', 1350000.00, 'checked-out', 1, '2025-11-30 16:33:36'),
(7, 19, 2, 2, '2025-11-30 16:33:36', '2025-11-30 16:33:40', 1350000.00, 'checked-out', 1, '2025-11-30 16:33:36'),
(8, 20, 1, 5, '2025-11-30 16:34:57', '2025-11-30 16:35:04', 1500000.00, 'checked-out', 1, '2025-11-30 16:34:57'),
(9, 20, 1, 3, '2025-11-30 16:34:57', '2025-11-30 16:35:04', 700000.00, 'checked-out', 1, '2025-11-30 16:34:57'),
(10, 20, 1, 1, '2025-11-30 16:34:57', '2025-11-30 16:35:04', 300000.00, 'checked-out', 1, '2025-11-30 16:34:57'),
(11, 23, 1, 5, '2025-12-03 06:58:55', '2025-12-03 07:34:39', 1500000.00, 'checked-out', 1, '2025-12-03 06:58:55'),
(12, 23, 1, 4, '2025-12-03 06:58:55', '2025-12-03 07:34:39', 1350000.00, 'checked-out', 1, '2025-12-03 06:58:55'),
(13, 22, 2, 1, '2025-12-03 07:35:03', '2025-12-03 07:35:12', 300000.00, 'checked-out', 1, '2025-12-03 07:35:03'),
(14, 22, 2, 2, '2025-12-03 07:35:03', '2025-12-03 07:35:12', 1350000.00, 'checked-out', 1, '2025-12-03 07:35:03'),
(15, 24, 1, 1, '2025-12-03 08:04:44', '2025-12-03 08:18:44', 300000.00, 'checked-out', 1, '2025-12-03 08:04:44'),
(16, 24, 1, 21, '2025-12-03 08:04:44', '2025-12-03 08:18:44', 700000.00, 'checked-out', 1, '2025-12-03 08:04:44'),
(17, 25, 1, 1, '2025-12-03 08:22:27', '2025-12-03 08:35:13', 300000.00, 'checked-out', 1, '2025-12-03 08:22:27'),
(18, 25, 1, 2, '2025-12-03 08:22:27', '2025-12-03 08:35:13', 1350000.00, 'checked-out', 1, '2025-12-03 08:22:27'),
(19, 26, 1, 2, '2025-12-03 08:39:08', '2025-12-03 08:39:33', 1350000.00, 'checked-out', 1, '2025-12-03 08:39:08'),
(20, 27, 1, 1, '2025-12-03 12:49:42', '2025-12-03 12:49:48', 300000.00, 'checked-out', 1, '2025-12-03 12:49:42'),
(21, 27, 1, 2, '2025-12-03 12:49:42', '2025-12-03 12:49:48', 1350000.00, 'checked-out', 1, '2025-12-03 12:49:42'),
(22, 28, 1, 3, '2025-12-03 12:51:49', '2025-12-03 12:52:23', 700000.00, 'checked-out', 1, '2025-12-03 12:51:49'),
(23, 29, 1, 3, '2025-12-03 13:36:52', '2025-12-05 02:30:44', 700000.00, 'completed', 1, '2025-12-03 13:36:52'),
(24, 31, 1, 29, '2025-12-05 02:26:05', '2025-12-05 02:26:07', 4450000.00, 'completed', 1, '2025-12-05 02:26:05'),
(25, 30, 2, 1, '2025-12-05 02:30:56', '2025-12-05 02:30:58', 300000.00, 'completed', 1, '2025-12-05 02:30:56'),
(26, 32, 1, 2, '2025-12-05 02:32:41', '2025-12-05 02:33:12', 1350000.00, 'completed', 1, '2025-12-05 02:32:41'),
(27, 32, 1, 5, '2025-12-05 02:32:41', '2025-12-05 02:33:12', 1500000.00, 'completed', 1, '2025-12-05 02:32:41'),
(28, 33, 1, 21, '2025-12-05 02:57:35', '2025-12-05 02:57:41', 700000.00, 'completed', 1, '2025-12-05 02:57:35'),
(29, 34, 1, 2, '2025-12-05 03:05:57', '2025-12-05 03:06:23', 1350000.00, 'completed', 1, '2025-12-05 03:05:57'),
(30, 34, 1, 1, '2025-12-05 03:05:57', '2025-12-05 03:06:23', 300000.00, 'completed', 1, '2025-12-05 03:05:57'),
(31, 35, 2, 1, '2025-12-05 03:30:26', '2025-12-05 03:30:31', 300000.00, 'completed', 1, '2025-12-05 03:30:26'),
(32, 37, 1, 3, '2025-12-05 03:56:11', '2025-12-05 03:56:14', 700000.00, 'completed', 1, '2025-12-05 03:56:11'),
(33, 36, 2, 2, '2025-12-05 03:56:12', '2025-12-05 03:56:16', 1350000.00, 'completed', 1, '2025-12-05 03:56:12'),
(34, 39, 1, 4, '2025-12-05 04:05:17', '2025-12-05 04:05:19', 1350000.00, 'completed', 1, '2025-12-05 04:05:17'),
(35, 41, 3, 21, '2025-12-05 04:24:41', '2025-12-05 20:57:50', 700000.00, 'completed', 1, '2025-12-05 04:24:41'),
(36, 40, 1, 5, '2025-12-05 20:58:00', '2025-12-05 20:58:01', 1500000.00, 'completed', 1, '2025-12-05 20:58:00'),
(37, 42, 3, 29, '2025-12-05 21:17:00', '2025-12-05 21:17:02', 4450000.00, 'completed', 1, '2025-12-05 21:17:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `role_id` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `full_name`, `role_id`, `email`, `phone`, `created_at`) VALUES
(1, 'admin01', 'admin123', 'Nguyen Van A', 1, 'admin01@example.com', '0912345678', '2025-11-26 01:47:21'),
(2, 'reception01', 'recep123', 'Tran Thi B', 2, 'reception01@example.com', '0923456789', '2025-11-26 01:47:21'),
(3, 'manager01', 'manager123', 'Le Van C', 3, 'manager01@example.com', '0934567890', '2025-11-26 01:47:21');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `guests`
--
ALTER TABLE `guests`
  ADD PRIMARY KEY (`guest_id`),
  ADD UNIQUE KEY `guest_id` (`guest_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- Chỉ mục cho bảng `invoice`
--
ALTER TABLE `invoice`
  ADD PRIMARY KEY (`invoice_id`),
  ADD UNIQUE KEY `invoice_id` (`invoice_id`),
  ADD KEY `stay_id` (`stay_id`),
  ADD KEY `guest_id` (`guest_id`),
  ADD KEY `created_by_user_id` (`created_by_user_id`);

--
-- Chỉ mục cho bảng `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`invoice_item_id`),
  ADD UNIQUE KEY `invoice_item_id` (`invoice_item_id`),
  ADD KEY `invoice_id` (`invoice_id`),
  ADD KEY `posted_by_user_id` (`posted_by_user_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Chỉ mục cho bảng `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`item_id`),
  ADD UNIQUE KEY `item_id` (`item_id`),
  ADD KEY `fk_items_item_type_id` (`item_type_id`);

--
-- Chỉ mục cho bảng `item_types`
--
ALTER TABLE `item_types`
  ADD PRIMARY KEY (`item_type_id`),
  ADD UNIQUE KEY `item_type_id` (`item_type_id`);

--
-- Chỉ mục cho bảng `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`reservation_id`),
  ADD UNIQUE KEY `reservation_id` (`reservation_id`),
  ADD KEY `created_by_user_id` (`created_by_user_id`),
  ADD KEY `guest_id` (`guest_id`);

--
-- Chỉ mục cho bảng `reservation_rooms`
--
ALTER TABLE `reservation_rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `reservation_id` (`reservation_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_id` (`role_id`);

--
-- Chỉ mục cho bảng `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`room_id`),
  ADD UNIQUE KEY `room_id` (`room_id`),
  ADD UNIQUE KEY `room_number` (`room_number`),
  ADD KEY `room_type_id` (`room_type_id`),
  ADD KEY `status_id` (`status_id`);

--
-- Chỉ mục cho bảng `room_statuses`
--
ALTER TABLE `room_statuses`
  ADD PRIMARY KEY (`status_id`),
  ADD UNIQUE KEY `status_id` (`status_id`);

--
-- Chỉ mục cho bảng `room_types`
--
ALTER TABLE `room_types`
  ADD PRIMARY KEY (`room_type_id`),
  ADD UNIQUE KEY `room_type_id` (`room_type_id`);

--
-- Chỉ mục cho bảng `stays`
--
ALTER TABLE `stays`
  ADD PRIMARY KEY (`stay_id`),
  ADD UNIQUE KEY `stay_id` (`stay_id`),
  ADD KEY `reservation_id` (`reservation_id`),
  ADD KEY `guest_id` (`guest_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `created_by_user_id` (`created_by_user_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `guests`
--
ALTER TABLE `guests`
  MODIFY `guest_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `invoice`
--
ALTER TABLE `invoice`
  MODIFY `invoice_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT cho bảng `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `invoice_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT cho bảng `items`
--
ALTER TABLE `items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `item_types`
--
ALTER TABLE `item_types`
  MODIFY `item_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `reservations`
--
ALTER TABLE `reservations`
  MODIFY `reservation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT cho bảng `reservation_rooms`
--
ALTER TABLE `reservation_rooms`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `rooms`
--
ALTER TABLE `rooms`
  MODIFY `room_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT cho bảng `room_statuses`
--
ALTER TABLE `room_statuses`
  MODIFY `status_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `room_types`
--
ALTER TABLE `room_types`
  MODIFY `room_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `stays`
--
ALTER TABLE `stays`
  MODIFY `stay_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `invoice`
--
ALTER TABLE `invoice`
  ADD CONSTRAINT `invoice_ibfk_1` FOREIGN KEY (`stay_id`) REFERENCES `stays` (`stay_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `invoice_ibfk_2` FOREIGN KEY (`guest_id`) REFERENCES `guests` (`guest_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `invoice_ibfk_3` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Các ràng buộc cho bảng `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`invoice_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `invoice_items_ibfk_2` FOREIGN KEY (`posted_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `invoice_items_ibfk_3` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Các ràng buộc cho bảng `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `fk_items_item_type_id` FOREIGN KEY (`item_type_id`) REFERENCES `item_types` (`item_type_id`);

--
-- Các ràng buộc cho bảng `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`guest_id`) REFERENCES `guests` (`guest_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Các ràng buộc cho bảng `reservation_rooms`
--
ALTER TABLE `reservation_rooms`
  ADD CONSTRAINT `reservation_rooms_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`reservation_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `reservation_rooms_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `reservation_rooms_ibfk_3` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Các ràng buộc cho bảng `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `rooms_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `room_statuses` (`status_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Các ràng buộc cho bảng `stays`
--
ALTER TABLE `stays`
  ADD CONSTRAINT `stays_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`reservation_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `stays_ibfk_2` FOREIGN KEY (`guest_id`) REFERENCES `guests` (`guest_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `stays_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `stays_ibfk_4` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
