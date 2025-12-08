# API Hóa Đơn (Invoice API)

## Tổng Quan

API Hóa Đơn quản lý toàn bộ quy trình tạo, xem, và cập nhật hóa đơn cho khách sạn. Hóa đơn được tự động tạo khi khách trả phòng.

## Base URL

```
http://localhost:8080/api/invoices
```

## Endpoints

### 1. Lấy Tất Cả Hóa Đơn

**GET** `/api/invoices`

**Mô Tả**: Lấy danh sách tất cả hóa đơn trong hệ thống

**Response** (200 OK):

```json
[
  {
    "invoiceId": 1,
    "stay": {
      "stayId": 1,
      "reservation": { ... },
      "guest": { ... },
      "room": { ... },
      "checkinTime": "2025-12-01T10:30:00",
      "checkoutTime": "2025-12-02T11:00:00",
      "totalCost": 1500000.00,
      "status": "completed"
    },
    "guest": {
      "guestId": 1,
      "fullName": "Pham Thi D",
      "email": "phamthid@example.com"
    },
    "currency": "VND",
    "balance": 1500000.00,
    "createdByUser": { ... },
    "createdAt": "2025-12-02T11:00:00",
    "invoiceItems": []
  }
]
```

---

### 2. Lấy Hóa Đơn Theo ID

**GET** `/api/invoices/{invoiceId}`

**Parameters**:

- `invoiceId` (path, required): ID của hóa đơn

**Response** (200 OK):

```json
{
  "invoiceId": 1,
  "stay": { ... },
  "guest": { ... },
  "currency": "VND",
  "balance": 1500000.00,
  "createdByUser": { ... },
  "createdAt": "2025-12-02T11:00:00",
  "invoiceItems": []
}
```

**Response** (404 Not Found): Hóa đơn không tồn tại

---

### 3. Lấy Hóa Đơn Theo Guest ID

**GET** `/api/invoices/guest/{guestId}`

**Parameters**:

- `guestId` (path, required): ID của khách hàng

**Response** (200 OK):

```json
[
  {
    "invoiceId": 1,
    "stay": { ... },
    "guest": { ... },
    "currency": "VND",
    "balance": 1500000.00,
    "createdByUser": { ... },
    "createdAt": "2025-12-02T11:00:00",
    "invoiceItems": []
  }
]
```

---

### 4. Lấy Hóa Đơn Theo Stay ID

**GET** `/api/invoices/stay/{stayId}`

**Parameters**:

- `stayId` (path, required): ID của lần ở

**Response** (200 OK):

```json
{
  "invoiceId": 1,
  "stay": { ... },
  "guest": { ... },
  "currency": "VND",
  "balance": 1500000.00,
  "createdByUser": { ... },
  "createdAt": "2025-12-02T11:00:00",
  "invoiceItems": []
}
```

---

### 5. Tạo Hóa Đơn Từ Stay (Được Gọi Tự Động Khi Trả Phòng)

**POST** `/api/invoices/create-from-stay/{stayId}`

**Parameters**:

- `stayId` (path, required): ID của lần ở
- `createdByUserId` (query, optional): ID của người tạo hóa đơn (mặc định: 1)

**Response** (201 Created):

```json
{
  "invoiceId": 1,
  "stay": {
    "stayId": 1,
    "reservation": { ... },
    "guest": { ... },
    "room": { ... },
    "checkinTime": "2025-12-01T10:30:00",
    "checkoutTime": "2025-12-02T11:00:00",
    "totalCost": 1500000.00,
    "status": "completed"
  },
  "guest": {
    "guestId": 1,
    "fullName": "Pham Thi D",
    "email": "phamthid@example.com"
  },
  "currency": "VND",
  "balance": 1500000.00,
  "createdByUser": { ... },
  "createdAt": "2025-12-02T11:00:00",
  "invoiceItems": []
}
```

**Response** (400 Bad Request): Stay không tồn tại

---

### 6. Cập Nhật Hóa Đơn

**PUT** `/api/invoices/{invoiceId}`

**Parameters**:

- `invoiceId` (path, required): ID của hóa đơn

**Request Body**:

```json
{
  "balance": 1500000.0,
  "currency": "VND"
}
```

**Response** (200 OK):

```json
{
  "invoiceId": 1,
  "stay": { ... },
  "guest": { ... },
  "currency": "VND",
  "balance": 1500000.00,
  "createdByUser": { ... },
  "createdAt": "2025-12-02T11:00:00",
  "invoiceItems": []
}
```

---

### 7. Xóa Hóa Đơn

**DELETE** `/api/invoices/{invoiceId}`

**Parameters**:

- `invoiceId` (path, required): ID của hóa đơn

**Response** (204 No Content): Xóa thành công

---

### 8. Thêm Dịch Vụ Vào Hóa Đơn

**POST** `/api/invoices/{invoiceId}/services/{itemId}`

**Parameters**:

- `invoiceId` (path, required): ID của hóa đơn
- `itemId` (path, required): ID của dịch vụ
- `amount` (query, required): Số tiền của dịch vụ
- `postedByUserId` (query, optional): ID của người thêm dịch vụ (mặc định: 1)

**Request Example**:

```
POST /api/invoices/1/services/3?amount=300000&postedByUserId=1
```

**Response** (201 Created):

```json
{
  "invoiceItemId": 1,
  "invoice": { ... },
  "item": {
    "itemId": 3,
    "itemName": "Dịch vụ spa & massage",
    "price": 300000.00,
    "status": "Còn hoạt động",
    "image": "uploads/services/spa-massage.jpg"
  },
  "amount": 300000.00,
  "postedDate": "2025-12-02T11:05:00",
  "postedByUser": { ... }
}
```

---

### 9. Lấy Các Mục Của Hóa Đơn

**GET** `/api/invoices/{invoiceId}/items`

**Parameters**:

- `invoiceId` (path, required): ID của hóa đơn

**Response** (200 OK):

```json
[
  {
    "invoiceItemId": 1,
    "invoice": { ... },
    "item": {
      "itemId": 3,
      "itemName": "Dịch vụ spa & massage",
      "price": 300000.00
    },
    "amount": 300000.00,
    "postedDate": "2025-12-02T11:05:00",
    "postedByUser": { ... }
  }
]
```

---

## Quy Trình Tạo Hóa Đơn Khi Trả Phòng

### Luồng Xử Lý:

1. **Khách trả phòng** → Gọi endpoint `POST /api/reservations/{id}/checkout`
2. **StayService.checkoutStaysForReservation()** được gọi
3. Cập nhật status của Stay thành "completed"
4. **Tự động gọi** `InvoiceService.createInvoiceFromStay()`
5. **Hóa đơn được tạo** với:
   - Liên kết đến Stay đã hoàn thành
   - Balance = totalCost từ Stay
   - Currency = "VND"
   - CreatedAt = thời gian hiện tại

### Ví Dụ Quy Trình Chi Tiết:

```
1. Khách check-in vào phòng 101:
   - POST /api/reservations/1/checkin
   - Tạo Stay với status="checked-in", totalCost=1500000

2. Khách trở lại sau vài ngày, trả phòng:
   - POST /api/reservations/1/checkout
   - Stay status → "completed"
   - Tự động tạo Invoice với balance=1500000

3. Quản lý xem hóa đơn:
   - GET /api/invoices
   - Hoặc: GET /api/invoices/1
   - Hoặc: GET /api/invoices/stay/1

4. (Tuỳ chọn) Thêm dịch vụ vào hóa đơn:
   - POST /api/invoices/1/services/3?amount=300000
   - Balance cập nhật: 1500000 + 300000 = 1800000
```

---

## Lưu Ý

- **Hóa đơn được tạo tự động** khi khách check-out
- **Balance khởi tạo** = totalCost từ Stay (giá phòng)
- **Có thể thêm dịch vụ** vào hóa đơn để cập nhật balance
- **Tất cả dữ liệu** được lưu trong database
- **Timestamp** được tự động gán khi tạo hóa đơn

---

## Mô Hình Dữ Liệu

### Bảng: invoice

```sql
CREATE TABLE invoice (
  invoice_id INT PRIMARY KEY AUTO_INCREMENT,
  stay_id INT NOT NULL,
  guest_id INT NOT NULL,
  currency VARCHAR(10) DEFAULT 'VND',
  balance DECIMAL(18,2) DEFAULT 0.00,
  created_by_user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stay_id) REFERENCES stays(stay_id),
  FOREIGN KEY (guest_id) REFERENCES guests(guest_id),
  FOREIGN KEY (created_by_user_id) REFERENCES users(user_id)
);
```

### Bảng: invoice_items

```sql
CREATE TABLE invoice_items (
  invoice_item_id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT NOT NULL,
  item_id INT NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  posted_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  posted_by_user_id INT NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoice(invoice_id),
  FOREIGN KEY (item_id) REFERENCES items(item_id),
  FOREIGN KEY (posted_by_user_id) REFERENCES users(user_id)
);
```
