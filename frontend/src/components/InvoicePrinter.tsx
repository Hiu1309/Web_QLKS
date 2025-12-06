interface InvoicePrinterProps {
  invoice: {
    id: string;
    guestName: string;
    phone: string;
    idType?: string;
    idNumber?: string;
    roomNumber: string;
    roomType: string;
    roomPrice: number;
    nights: number;
    checkIn: string;
    checkOut: string;
    paymentMethod: string;
    status: string;
    isPaid: boolean;
    createdByUser: string;
  };
  services: Array<{
    id: string;
    name: string;
    price: number;
    category?: string;
  }>;
  roomTotal: number;
  servicesTotal: number;
  grandTotal: number;
}

const formatIdDisplay = (idType?: string, idNumber?: string) => {
  const normalized = (idType || "").toLowerCase();
  let label = "Giấy tờ";
  if (
    normalized.includes("cccd") ||
    normalized.includes("cmnd") ||
    normalized.includes("national")
  ) {
    label = "CCCD";
  } else if (normalized.includes("passport")) {
    label = "Hộ chiếu";
  } else if (idType) {
    label = idType;
  }

  if (!idNumber) return `${label}: -`;
  return `${label}: ${idNumber}`;
};

export function handlePrintInvoice(props: InvoicePrinterProps) {
  const { invoice, services, roomTotal, servicesTotal, grandTotal } = props;
  const now = new Date().toLocaleString("vi-VN");

  const servicesHtml = services.length
    ? services
        .map(
          (s) =>
            `<div class="muted">— ${s.name}: ${s.price.toLocaleString(
              "vi-VN"
            )} đ</div>`
        )
        .join("")
    : `<div class="muted">— Không có dịch vụ</div>`;

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Hóa đơn ${invoice.id}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4; margin: 15mm; }
  body {
    font-family: "Arial", sans-serif;
    background: #fff;
    padding: 20px 35px;
    font-size: 13px;
    color: #333;
    max-width: 800px;
    margin: 0 auto;
  }

  .header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #0ea5e9;
  }
  .company-name {
    font-size: 20px;
    font-weight: bold;
    letter-spacing: 0.8px;
    margin-bottom: 4px;
  }
  .invoice-code {
    font-size: 13px;
    color: #555;
  }

  .section {
    margin: 16px 0;
  }
  .section-title {
    font-weight: bold;
    font-size: 12px;
    text-transform: uppercase;
    margin-bottom: 8px;
    color: #0ea5e9;
    letter-spacing: 0.5px;
  }

  .info-row {
    display: flex;
    margin: 5px 0;
    font-size: 13px;
  }
  .info-label {
    min-width: 130px;
    color: #666;
  }
  .info-value {
    color: #222;
    font-weight: 500;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
  }
  th, td {
    border: 1px solid #ddd;
    padding: 8px 10px;
    font-size: 13px;
  }
  th {
    background: #f8f9fa;
    font-weight: 600;
    text-align: left;
    color: #444;
  }
  td {
    color: #555;
  }
  .text-right {
    text-align: right;
  }
  .text-center {
    text-align: center;
  }

  .divider {
    border-top: 1px solid #e5e7eb;
    margin: 18px 0;
  }

  .totals {
    margin: 16px 0;
    padding: 12px;
    background: #f9fafb;
    border-radius: 6px;
  }
  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    font-size: 13px;
  }
  .total-row.grand {
    font-size: 15px;
    font-weight: bold;
    color: #0f766e;
    padding-top: 8px;
    margin-top: 8px;
    border-top: 2px solid #d1d5db;
  }

  .footer {
    text-align: center;
    margin-top: 25px;
    padding-top: 15px;
    border-top: 1px solid #e5e7eb;
    font-size: 12px;
    color: #666;
  }
  .footer-item {
    margin: 4px 0;
  }
  .qr {
    width: 100px;
    margin: 12px auto 8px;
    display: block;
  }
  .thank-you {
    margin-top: 10px;
    font-style: italic;
    color: #888;
  }

  @media print {
    body { padding: 0; }
  }
</style>
</head>

<body>

<div class="header">  
  <div class="company-name"><strong>KHÁCH SẠN HHA</strong></div>
  <div class="invoice-code">Hóa đơn thanh toán<br> Mã: <strong>${
    invoice.id
  }</strong></div>
</div>

<div class="section">
  <div class="info-value">--------------</div>
  <div class="section-title"><strong>Thông Tin Khách Hàng</strong></div>
  <div class="info-row">
    <div class="info-label">Họ và tên: ${invoice.guestName}</div>    
  </div>
  <div class="info-row">
    <div class="info-label">Số điện thoại: ${invoice.phone || "-"}</div>
  </div>
  <div class="info-row">
    <div class="info-label">${formatIdDisplay(
      invoice.idType,
      invoice.idNumber
    )}</div>
  </div>  
</div>

<div class="section">
  <div class="section-title"><strong>Thông Tin Phòng</strong></div>
  <div class="info-row">
    <div class="info-label">Số phòng: ${invoice.roomNumber} (${
    invoice.roomType
  })</div>
  </div>
  <div class="info-row">
    <div class="info-label">Nhận phòng:</div>
    <div class="info-value">${invoice.checkIn}</div>
  </div>
  <div class="info-row">
    <div class="info-label">Trả phòng:</div>
    <div class="info-value">${invoice.checkOut}</div>
  </div>
  <div class="info-row">
    <div class="info-label">Số đêm: ${invoice.nights}</div>
    <div class="info-label">Giá phòng: ${invoice.roomPrice.toLocaleString(
      "vi-VN"
    )}đ</div>
  </div>
</div>

<div class="divider"></div>

<div class="section">
  <div class="section-title"><strong>Thông Tin Dịch Vụ</strong></div>
  <table>
    <thead>
      <tr>
        <th>Dịch vụ</th>
        <th>Thành tiền</th>
      </tr>
    </thead>
    <tbody>      
      ${
        services.length
          ? services
              .map(
                (s) => `
      <tr>
        <td>${s.name}</td>
        <td class="text-right">${s.price.toLocaleString("vi-VN")} đ</td>
      </tr>`
              )
              .join("")
          : `
      <tr>
        <td colspan="2" class="text-center" style="color:#999">Không có dịch vụ phát sinh</td>
      </tr>`
      }
    </tbody>
  </table>
</div>

<div class="totals">
  <div class="total-row">
    <span>Tiền phòng: <strong>${roomTotal.toLocaleString(
      "vi-VN"
    )} đ</strong></span>
  </div>
  <div class="total-row">
    <span>Dịch vụ: <strong>${servicesTotal.toLocaleString(
      "vi-VN"
    )} đ</strong></span>
  </div>
  <div class="total-row grand">
    <span>--------------</span> 
    <span>TỔNG CỘNG: <strong>${grandTotal.toLocaleString(
      "vi-VN"
    )}đ</strong></span>
    <span><br>--------------</span> 
  </div>
</div>


<div class="footer">
  <div class="footer-item"><strong>Người lập:</strong> ${
    invoice.createdByUser
  }</div>
  <div class="footer-item"><strong>Ngày lập:</strong> ${now}</div>
  <div class="footer-item"><strong>Phương thức:</strong> ${
    invoice.paymentMethod || "-"
  }</div>
  <div class="thank-you"><br><br>Cảm ơn quý khách đã sử dụng dịch vụ!</div>
</div>

</body>
</html>`;

  const printDiv = document.createElement("div");
  printDiv.innerHTML = html
    .replace(/<!doctype html>.*?<body>/s, "")
    .replace(/<\/body>.*?<\/html>/s, "");
  printDiv.id = "invoice-print-content";
  printDiv.style.display = "none";
  document.body.appendChild(printDiv);

  const printStyle = document.createElement("style");
  printStyle.textContent = `
    @media print {
      body > * { display: none; }
      #invoice-print-content { display: block !important; }
    }
  `;
  document.head.appendChild(printStyle);

  setTimeout(() => {
    window.print();
    setTimeout(() => {
      document.body.removeChild(printDiv);
      document.head.removeChild(printStyle);
    }, 100);
  }, 100);
}
