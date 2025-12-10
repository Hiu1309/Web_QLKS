import { useEffect, useMemo, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Label } from "./ui/label";
import {
  Search,
  Eye,
  Trash2,
  CreditCard,
  CheckCircle,
  Printer,
} from "lucide-react";
import { PaymentDialog } from "./PaymentDialog";
import { AddInvoiceServiceDialog } from "./AddInvoiceServiceDialog";
import { handlePrintInvoice } from "./InvoicePrinter";

interface ApiInvoiceItem {
  invoiceItemId: string;
  amount: number;
  item?: {
    itemId: number;
    itemName: string;
    price: number;
    itemType?: { typeName: string };
  };
}

interface ApiInvoice {
  invoiceId?: number;
  guest?: {
    fullName?: string;
    email?: string;
    phone?: string;
    idType?: string;
    idNumber?: string;
  };
  reservation?: {
    reservationId?: number;
    guest?: {
      fullName?: string;
      email?: string;
      phone?: string;
      idType?: string;
      idNumber?: string;
    };
    room?: {
      roomNumber?: string;
      roomType?: { name?: string; basePrice?: number };
    };
    checkIn?: string;
    checkOut?: string;
    stay?: { totalCost?: number };
  };
  balance?: number;
  status?: string;
  createdAt?: string;
}

interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  category?: string;
}

interface Invoice {
  id: string;
  reservationId: string;
  guestName: string;
  email: string;
  phone: string;
  idType?: string;
  idNumber?: string;
  roomNumber: string;
  roomType: string;
  roomPrice: number;
  nights: number;
  checkIn: string;
  checkOut: string;
  createdAt: string;
  isPaid: boolean;
  status: string;
  paymentMethod: string;
  createdByUser: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  category: string;
}

const API_BASE =
  ((import.meta as any).env?.VITE_API_BASE as string) ||
  (import.meta as any).env?.VITE_API ||
  "http://localhost:8080";

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};

const formatDateTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const formatted = date.toLocaleString("vi-VN");
  // Thêm gạch nối giữa thời gian và ngày tháng
  // Format: "HH:MM:SS - DD/MM/YYYY"
  return formatted.replace(/(\d{2}:\d{2}:\d{2})\s/, "$1 - ");
};

const formatIdDisplay = (idType?: string, idNumber?: string) => {
  const normalizedType = (idType || "").toLowerCase();

  let label = "Giấy tờ";
  if (
    normalizedType.includes("cccd") ||
    normalizedType.includes("cmnd") ||
    normalizedType.includes("national")
  ) {
    label = "CCCD";
  } else if (normalizedType.includes("passport")) {
    label = "Hộ chiếu";
  } else if (idType) {
    label = idType;
  }

  if (!idNumber) return `${label}: -`;
  return `${label}: ${idNumber}`;
};

const invoiceStatusColorMap: Record<string, { bg: string; text: string }> = {
  paid: { bg: "#22c55e", text: "#ffffff" },
  unpaid: { bg: "#0ea5e9", text: "#ffffff" },
  cancelled: { bg: "#ef4444", text: "#ffffff" },
};

const InvoiceStatusBadge = ({
  isPaid,
  status,
}: {
  isPaid: boolean;
  status?: string;
}) => {
  const statusKey =
    status === "cancelled" ? "cancelled" : isPaid ? "paid" : "unpaid";
  const colors = invoiceStatusColorMap[statusKey];

  if (!colors) return null;

  const label =
    status === "cancelled"
      ? "Đã Hủy Hóa Đơn"
      : isPaid
      ? "Đã Thanh Toán"
      : "Chờ Thanh Toán";

  return (
    <span
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        padding: "0.3rem 0.5rem",
        borderRadius: "0.9rem",
        fontWeight: 600,
        fontSize: "0.875rem",
        display: "inline-block",
        border: "none",
      }}
    >
      {label}
    </span>
  );
};

function mapInvoice(api: ApiInvoice): Invoice {
  // API thực tế trả về invoice.stay.*, trong đó stay chứa reservation và room
  const stay: any = (api as any).stay || {};
  const reservation = api.reservation || stay.reservation || {};
  const guest = api.guest || stay.guest || reservation.guest;

  // Lấy thông tin phòng: ưu tiên stay.room -> reservation.room -> reservationRooms[0].room
  const room =
    stay.room ||
    reservation.room ||
    (reservation.reservationRooms?.[0] as any)?.room ||
    {};

  // Lấy thời gian checkin/checkout: ưu tiên stay.checkinTime/checkoutTime, fallback arrival/departure
  const checkInRaw =
    reservation.checkIn ||
    stay.checkinTime ||
    stay.checkIn ||
    reservation.arrivalDate;
  const checkOutRaw =
    reservation.checkOut ||
    stay.checkoutTime ||
    stay.checkOut ||
    reservation.departureDate;

  const checkIn = checkInRaw ? formatDateTime(checkInRaw) : "";
  const checkOut = checkOutRaw ? formatDateTime(checkOutRaw) : "";
  const createdAt = formatDateTime(api.createdAt) || "";

  const checkInDate = checkInRaw ? new Date(checkInRaw) : null;
  const checkOutDate = checkOutRaw ? new Date(checkOutRaw) : null;
  const nights =
    checkInDate && checkOutDate
      ? Math.max(
          1,
          Math.round(
            (checkOutDate.getTime() - checkInDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 1;

  const roomPriceFromType = room?.roomType?.basePrice ?? 0;
  const totalCost = stay?.totalCost ?? reservation?.totalEstimated ?? 0;
  const computedRoomPrice =
    nights > 0 && totalCost > 0 ? totalCost / nights : roomPriceFromType;

  const statusText = (api.status || "active").toLowerCase();
  const paymentMethod = (api as any)?.paymentMethod ?? "";

  const creatorObj =
    (api as any)?.createdByUser ||
    stay?.createdByUser ||
    reservation?.createdByUser ||
    {};
  const createdByUser =
    creatorObj?.fullName || creatorObj?.username || "Hệ thống";

  return {
    id: api.invoiceId?.toString() ?? "",
    reservationId: reservation?.reservationId?.toString() ?? "-",
    guestName: guest?.fullName ?? "Khách lẻ",
    email: guest?.email ?? "",
    phone: guest?.phone ?? "",
    idType: guest?.idType || "",
    idNumber: guest?.idNumber || "",
    roomNumber: room?.roomNumber ?? "",
    roomType: room?.roomType?.name ?? room?.roomType?.typeName ?? "",
    roomPrice: Number(computedRoomPrice) || 0,
    nights,
    checkIn,
    checkOut,
    createdAt,
    isPaid:
      statusText === "đã thanh toán" ||
      statusText.includes("paid") ||
      statusText === "completed",
    status: statusText,
    paymentMethod,
    createdByUser,
  };
}

export function InvoiceManagement() {
  const [invoicesList, setInvoicesList] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [invoiceItemsMap, setInvoiceItemsMap] = useState<
    Record<string, InvoiceItem[]>
  >({});
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [detailDialogLoading, setDetailDialogLoading] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/invoices`);
      const data: ApiInvoice[] = await res.json();
      const mapped = data.map(mapInvoice); // Không filter để hiển thị cả hóa đơn đã hủy
      mapped.sort((a, b) => Number(b.id) - Number(a.id));
      setInvoicesList(mapped);

      // Đảm bảo tổng và dịch vụ hiển thị đúng sau khi reload: nạp dịch vụ cho hóa đơn đã thanh toán
      const paidInvoices = mapped.filter((inv) => inv.isPaid);
      await Promise.all(paidInvoices.map((inv) => fetchInvoiceItems(inv.id)));
    } catch (err) {
      console.error("Failed to load invoices", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/items`);
        if (!res.ok) return;
        const data = await res.json();
        const mapped: Service[] = (data || []).map((item: any) => ({
          id: `SRV${item.itemId ?? item.id ?? ""}`,
          name: item.itemName || item.name || "Dịch vụ",
          price: Number(item.price) || 0,
          category: item.itemType?.typeName || item.typeName || "",
        }));
        setAvailableServices(mapped);
      } catch (err) {
        console.error("Failed to load services", err);
      }
    };

    fetchInvoices();
    fetchServices();
  }, [fetchInvoices]);

  const fetchInvoiceItems = async (invoiceId: string) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/invoice-items/invoice/${invoiceId}`
      );
      if (!res.ok) return [];
      const data: ApiInvoiceItem[] = await res.json();
      const mapped: InvoiceItem[] = (data || []).map((it) => ({
        id: it.invoiceItemId,
        name: it.item?.itemName || "Dịch vụ",
        price: Number(it.amount ?? it.item?.price ?? 0),
        category: it.item?.itemType?.typeName || "",
      }));
      setInvoiceItemsMap((prev) => ({ ...prev, [invoiceId]: mapped }));
      return mapped;
    } catch (err) {
      console.error("Failed to fetch invoice items", err);
      return [];
    }
  };

  const getServiceTotal = (invoiceId: string) => {
    const list = invoiceItemsMap[invoiceId] || [];
    return list.reduce((sum, item) => sum + (item.price || 0), 0);
  };

  const filteredInvoices = useMemo(() => {
    let result = invoicesList.filter(
      (invoice) =>
        invoice.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Lọc theo trạng thái
    if (statusFilter !== "all") {
      result = result.filter((invoice) => {
        if (statusFilter === "paid")
          return invoice.isPaid && invoice.status !== "cancelled";
        if (statusFilter === "unpaid")
          return !invoice.isPaid && invoice.status !== "cancelled";
        if (statusFilter === "cancelled") return invoice.status === "cancelled";
        return true;
      });
    }

    // Lọc theo thời gian tạo
    if (dateFilter !== "all") {
      const now = new Date();
      const invoiceDate = (invoice: Invoice) => {
        const match = invoice.createdAt.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) {
          return new Date(
            Number(match[3]),
            Number(match[2]) - 1,
            Number(match[1])
          );
        }
        return new Date();
      };

      result = result.filter((invoice) => {
        const invDate = invoiceDate(invoice);
        const daysDiff = Math.floor(
          (now.getTime() - invDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dateFilter === "today") return daysDiff === 0;
        if (dateFilter === "week") return daysDiff >= 0 && daysDiff < 7;
        if (dateFilter === "month") return daysDiff >= 0 && daysDiff < 30;
        if (dateFilter === "older") return daysDiff >= 30;
        return true;
      });
    }

    return result;
  }, [invoicesList, searchTerm, statusFilter, dateFilter]);

  const handlePaymentComplete = async (
    invoiceId: string,
    totalAmount: number,
    paymentMethod: string,
    services: Service[]
  ) => {
    try {
      // Fetch invoice mới nhất từ backend để cập nhật trạng thái
      const res = await fetch(`${API_BASE}/api/invoices/${invoiceId}`);
      if (!res.ok) throw new Error("Failed to fetch updated invoice");

      const updatedInvoice: ApiInvoice = await res.json();
      const mappedInvoice = mapInvoice(updatedInvoice);

      // Cập nhật invoice trong danh sách
      setInvoicesList((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? mappedInvoice : inv))
      );

      // Cập nhật selectedInvoice để hiển thị trạng thái mới trong detail dialog
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice(mappedInvoice);
      }

      // Fetch lại invoice items để hiển thị dịch vụ
      await fetchInvoiceItems(invoiceId);

      // Làm mới toàn bộ danh sách để đồng bộ trạng thái và số liệu
      await fetchInvoices();

      console.log(
        "Thanh toán thành công! Tổng tiền:",
        totalAmount,
        "Phương thức:",
        paymentMethod,
        "Dịch vụ:",
        services
      );
    } catch (error) {
      console.error("Lỗi cập nhật invoice sau thanh toán:", error);
    }
  };

  const handleCancelInvoice = async (invoiceId: string) => {
    setDeletingId(invoiceId);
    try {
      const resp = await fetch(`${API_BASE}/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!resp.ok) throw new Error("cancel failed");
      // Fetch lại danh sách để hiển thị hóa đơn với trạng thái đã hủy
      const res = await fetch(`${API_BASE}/api/invoices`);
      const data: ApiInvoice[] = await res.json();
      const mapped = data.map(mapInvoice); // Không filter để hiển thị cả hóa đơn đã hủy
      mapped.sort((a, b) => Number(b.id) - Number(a.id));
      setInvoicesList(mapped);
    } catch (err) {
      console.error("Cancel invoice failed", err);
    } finally {
      setDeletingId(null);
    }
  };

  const onPrintInvoice = (invoice: Invoice) => {
    const services = invoiceItemsMap[invoice.id] || [];
    const roomTotal = invoice.roomPrice * invoice.nights;
    const servicesTotal = getServiceTotal(invoice.id);
    const grandTotal = roomTotal + servicesTotal;

    handlePrintInvoice({
      invoice,
      services,
      roomTotal,
      servicesTotal,
      grandTotal,
    });
  };

  const renderInvoiceDetails = (invoice: Invoice) => {
    const services = invoiceItemsMap[invoice.id] || [];
    const roomTotal = invoice.roomPrice * invoice.nights;
    const servicesTotal = getServiceTotal(invoice.id);
    const grandTotal = roomTotal + servicesTotal;

    return (
      <div className="space-y-6 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-600">Mã Hóa Đơn</Label>
            <p className="font-semibold text-slate-800">{invoice.id}</p>
          </div>
          <div>
            <Label className="text-slate-600">Trạng Thái</Label>
            <p className="font-medium text-slate-800">
              {invoice.status === "cancelled"
                ? "Đã Hủy Hóa Đơn"
                : invoice.isPaid
                ? "Đã Thanh Toán"
                : "Chờ Thanh Toán"}
            </p>
          </div>
          <div>
            <Label className="text-slate-600">Khách Hàng</Label>
            <p className="font-medium text-slate-800">{invoice.guestName}</p>
            <p className="text-slate-500 text-xs">
              {formatIdDisplay(invoice.idType, invoice.idNumber)} •{" "}
              {invoice.phone}
            </p>
          </div>
          <div>
            <Label className="text-slate-600">Thời Gian Tạo</Label>
            <p className="font-medium text-slate-800">{invoice.createdAt}</p>
          </div>
          <div>
            <Label className="text-slate-600">Phương Thức Thanh Toán</Label>
            <p className="font-medium text-slate-800">
              {invoice.paymentMethod || "Chưa thanh toán"}
            </p>
          </div>
          <div>
            <Label className="text-slate-600">Người Tạo Hóa Đơn</Label>
            <p className="font-medium text-slate-800">
              {invoice.createdByUser}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-slate-600 text-xs">Phòng</Label>
                  <p className="font-medium text-slate-800">
                    {invoice.roomNumber}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-600 text-xs">Loại Phòng</Label>
                  <p className="font-medium text-slate-800">
                    {invoice.roomType}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-600 text-xs">Giá/Đêm</Label>
                  <p className="font-medium text-slate-800">
                    {invoice.roomPrice.toLocaleString("vi-VN")} đ
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-600">Nhận Phòng</Label>
                <p className="font-medium text-slate-800">{invoice.checkIn}</p>
              </div>

              <div>
                <Label className="text-slate-600">Trả Phòng</Label>
                <p className="font-medium text-slate-800">{invoice.checkOut}</p>
              </div>

              <div>
                <Label className="text-slate-600">Số Đêm</Label>
                <p className="font-medium text-slate-800">
                  {invoice.nights} đêm
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Dịch vụ
            </p>
            {detailDialogLoading ? (
              <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
            ) : services.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có dịch vụ nào.</p>
            ) : (
              <div
                className="grid gap-2 text-sm"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                }}
              >
                {services.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 text-slate-800"
                  >
                    <span className="text-lg leading-none text-slate-400">
                      •
                    </span>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-slate-500">
                        {item.category}
                      </span>
                      <span className="font-semibold">
                        {item.price.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
          <div>
            <p className="text-sm text-slate-600">Tiền phòng</p>
            <p className="font-semibold text-slate-800">
              {roomTotal.toLocaleString("vi-VN")} đ
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Dịch vụ</p>
            <p className="font-semibold text-slate-800">
              {servicesTotal.toLocaleString("vi-VN")} đ
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Tổng cộng</p>
            <p className="text-lg font-bold text-emerald-700">
              {grandTotal.toLocaleString("vi-VN")} đ
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          {invoice.isPaid && (
            <Button
              size="sm"
              variant="outline"
              className="border-slate-300 hover:bg-slate-50"
              onClick={() => onPrintInvoice(invoice)}
            >
              <Printer className="h-4 w-4 mr-1" />
              In Hóa Đơn
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-700">Hóa Đơn</h1>
          <p className="text-slate-600">
            Quản lý hóa đơn thanh toán của khách sạn
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm theo tên khách, mã hóa đơn hoặc số phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-slate-200"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white border-slate-200">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất Cả Trạng Thái</SelectItem>
            <SelectItem value="paid">Đã Thanh Toán</SelectItem>
            <SelectItem value="unpaid">Chờ Thanh Toán</SelectItem>
            <SelectItem value="cancelled">Đã Hủy Hóa Đơn</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[180px] bg-white border-slate-200">
            <SelectValue placeholder="Lọc theo thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất Cả Thời Gian</SelectItem>
            <SelectItem value="today">Hôm Nay</SelectItem>
            <SelectItem value="week">Tuần Này</SelectItem>
            <SelectItem value="month">Tháng Này</SelectItem>
            <SelectItem value="older">Trước Đây</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-700">Danh Sách Hóa Đơn</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-slate-500">Đang tải hóa đơn...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-600">Mã Hóa Đơn</TableHead>
                  <TableHead className="text-slate-600">Khách Hàng</TableHead>
                  <TableHead className="text-slate-600">Phòng</TableHead>
                  <TableHead className="text-slate-600">
                    Thời Gian Tạo
                  </TableHead>
                  <TableHead className="text-slate-600">Trạng Thái</TableHead>
                  <TableHead className="text-slate-600">Tổng</TableHead>
                  <TableHead className="text-slate-600">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-700">
                      {invoice.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-700">
                          {invoice.guestName}
                        </p>
                        <p className="text-sm text-slate-500">
                          {invoice.phone || "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-700">
                          {invoice.roomNumber}
                        </p>
                        <p className="text-sm text-slate-500">
                          {invoice.roomType}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {invoice.createdAt}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge
                        isPaid={invoice.isPaid}
                        status={invoice.status}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-emerald-600">
                      {(
                        invoice.roomPrice * invoice.nights +
                        getServiceTotal(invoice.id)
                      ).toLocaleString("vi-VN")}{" "}
                      đ
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                // Hiển thị ngay dữ liệu hiện có (cache) để mở dialog nhanh
                                setSelectedInvoice(invoice);
                                const cachedItems =
                                  invoiceItemsMap[invoice.id] || [];
                                const willFetchItems =
                                  invoice.isPaid && cachedItems.length === 0;
                                setDetailDialogLoading(willFetchItems);

                                // Làm mới dữ liệu ở background
                                try {
                                  const invoiceRes = await fetch(
                                    `${API_BASE}/api/invoices/${invoice.id}`
                                  );
                                  let updatedInvoice: ApiInvoice | null = null;
                                  let mappedInvoice: Invoice | null = null;
                                  if (invoiceRes.ok) {
                                    updatedInvoice = await invoiceRes.json();
                                    mappedInvoice = mapInvoice(updatedInvoice);
                                    setSelectedInvoice(mappedInvoice);
                                  }

                                  // Chỉ kiểm tra dịch vụ khi hóa đơn đã thanh toán
                                  const paid =
                                    mappedInvoice?.isPaid ?? invoice.isPaid;
                                  if (!paid) return;

                                  // Ưu tiên lấy invoiceItems ngay từ response để tránh call thêm
                                  const inlineItems: any[] =
                                    (updatedInvoice as any)?.invoiceItems || [];

                                  if (inlineItems.length > 0) {
                                    const mapped: InvoiceItem[] =
                                      inlineItems.map((it: any) => ({
                                        id: it.invoiceItemId,
                                        name: it.item?.itemName || "Dịch vụ",
                                        price: Number(
                                          it.amount ?? it.item?.price ?? 0
                                        ),
                                        category:
                                          it.item?.itemType?.typeName || "",
                                      }));
                                    setInvoiceItemsMap((prev) => ({
                                      ...prev,
                                      [invoice.id]: mapped,
                                    }));
                                  } else if (!cachedItems.length) {
                                    // Fallback call nếu response không có invoiceItems và chưa có cache
                                    const itemsRes = await fetch(
                                      `${API_BASE}/api/invoice-items/invoice/${invoice.id}`
                                    );
                                    if (itemsRes.ok) {
                                      const data: ApiInvoiceItem[] =
                                        await itemsRes.json();
                                      const mapped: InvoiceItem[] = (
                                        data || []
                                      ).map((it) => ({
                                        id: it.invoiceItemId,
                                        name: it.item?.itemName || "Dịch vụ",
                                        price: Number(
                                          it.amount ?? it.item?.price ?? 0
                                        ),
                                        category:
                                          it.item?.itemType?.typeName || "",
                                      }));
                                      setInvoiceItemsMap((prev) => ({
                                        ...prev,
                                        [invoice.id]: mapped,
                                      }));
                                    }
                                  }
                                } catch (err) {
                                  console.error(
                                    "Failed to fetch invoice details",
                                    err
                                  );
                                } finally {
                                  setDetailDialogLoading(false);
                                }
                              }}
                              className="border-slate-300 hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl bg-white">
                            <DialogHeader>
                              <DialogTitle className="text-slate-700">
                                Chi Tiết Hóa Đơn
                              </DialogTitle>
                            </DialogHeader>
                            {selectedInvoice ? (
                              renderInvoiceDetails(selectedInvoice)
                            ) : (
                              <p className="text-slate-500">Đang tải...</p>
                            )}
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-300 hover:bg-slate-50"
                              disabled={
                                deletingId === invoice.id ||
                                invoice.isPaid ||
                                invoice.status === "cancelled"
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Bạn có chắc muốn hủy hóa đơn?
                              </AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancelInvoice(invoice.id)}
                              >
                                Đồng ý
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        {!invoice.isPaid && invoice.status !== "cancelled" && (
                          <PaymentDialog
                            invoice={invoice}
                            availableServices={availableServices}
                            onPaymentComplete={handlePaymentComplete}
                            trigger={
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                Thanh Toán
                              </Button>
                            }
                          />
                        )}

                        {invoice.isPaid && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-300 text-green-700 hover:bg-green-50"
                            disabled
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Đã Thanh Toán
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-500">
            Không tìm thấy hóa đơn nào phù hợp với tiêu chí của bạn.
          </p>
        </div>
      )}
    </div>
  );
}
