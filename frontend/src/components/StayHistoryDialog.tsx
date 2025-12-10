import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { handlePrintInvoice } from "./InvoicePrinter";
import { CalendarDays, BedDouble, Eye, Loader2, Printer } from "lucide-react";

const API_BASE =
  ((import.meta as any).env?.VITE_API_BASE as string) ||
  (import.meta as any).env?.VITE_API ||
  "http://localhost:8080";

interface RawInvoice {
  invoiceId?: number;
  status?: string;
  paymentMethod?: string;
  createdAt?: string;
  stay?: {
    checkinTime?: string;
    checkoutTime?: string;
    room?: {
      roomNumber?: string;
      roomType?: { name?: string; basePrice?: number | string };
    };
    totalCost?: number | string;
  };
  guest?: {
    fullName?: string;
    phone?: string;
    idType?: string;
    idNumber?: string;
  };
  createdByUser?: {
    fullName?: string;
    username?: string;
  };
}

interface InvoiceSummary {
  invoiceId: number;
  status: string;
  statusLabel: string;
  isPaid: boolean;
  checkInRaw?: string;
  checkOutRaw?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomNumber: string;
  roomType?: string;
  paymentMethod?: string;
  createdAt: string;
  createdAtRaw?: string;
}

interface InvoiceItemSummary {
  id: string;
  name: string;
  price: number;
  category?: string;
}

interface InvoiceView {
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

interface StayHistoryDialogProps {
  guestId: string;
  trigger?: React.ReactNode;
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
}

function calculateNights(checkIn?: string, checkOut?: string) {
  if (!checkIn || !checkOut) return 0;
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (
    Number.isNaN(checkInDate.getTime()) ||
    Number.isNaN(checkOutDate.getTime())
  ) {
    return 0;
  }
  const diff = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(diff, 1);
}

function invoiceStatusBadge(status: string, isPaid: boolean) {
  const normalized = status.toLowerCase();
  if (normalized === "cancelled")
    return "bg-rose-100 text-rose-600 border border-rose-200";
  if (isPaid)
    return "bg-emerald-100 text-emerald-600 border border-emerald-200";
  return "bg-blue-100 text-blue-600 border border-blue-200";
}

function formatIdDisplay(idType?: string, idNumber?: string) {
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
}

function mapInvoiceSummary(raw: RawInvoice | null): InvoiceSummary | null {
  if (!raw || raw.invoiceId == null) return null;

  const stay = raw.stay || {};
  const room = stay.room || {};
  const checkInRaw = stay.checkinTime;
  const checkOutRaw = stay.checkoutTime;
  const nights = calculateNights(checkInRaw, checkOutRaw) || 0;
  const status = raw.status || "Chưa thanh toán";
  const statusLower = status.toLowerCase();
  const isPaid =
    statusLower === "đã thanh toán" ||
    statusLower.includes("paid") ||
    statusLower === "completed";

  return {
    invoiceId: raw.invoiceId || 0,
    status,
    statusLabel:
      statusLower === "cancelled"
        ? "Đã hủy hóa đơn"
        : isPaid
        ? "Đã thanh toán"
        : status,
    isPaid,
    checkInRaw,
    checkOutRaw,
    checkIn: formatDateTime(checkInRaw),
    checkOut: formatDateTime(checkOutRaw),
    nights,
    roomNumber: room.roomNumber || "",
    roomType: room.roomType?.name || room.roomType?.typeName || "",
    paymentMethod: raw.paymentMethod || "",
    createdAt: formatDateTime(raw.createdAt),
    createdAtRaw: raw.createdAt,
  };
}

function mapInvoiceView(raw: RawInvoice | null): InvoiceView | null {
  if (!raw) return null;

  const stay: any = (raw as any).stay || {};
  const reservation: any = (raw as any).reservation || stay.reservation || {};
  const guest: any = raw.guest || stay.guest || reservation.guest || {};

  const room =
    stay.room ||
    reservation.room ||
    (reservation.reservationRooms?.[0] as any)?.room ||
    {};

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
  const createdAt = formatDateTime(raw.createdAt) || "";

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
    nights > 0 && totalCost > 0
      ? Number(totalCost) / nights
      : Number(roomPriceFromType) || 0;

  const statusText = (raw.status || "active").toLowerCase();
  const paymentMethod = (raw as any)?.paymentMethod ?? "";

  const creatorObj =
    (raw as any)?.createdByUser ||
    stay?.createdByUser ||
    reservation?.createdByUser ||
    {};
  const createdByUser =
    creatorObj?.fullName || creatorObj?.username || "Hệ thống";

  return {
    id: raw.invoiceId?.toString() ?? "",
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

function mapInvoiceItems(data: any[]): InvoiceItemSummary[] {
  return (data || []).map((item) => ({
    id: item.invoiceItemId?.toString() || item.id?.toString() || "",
    name: item.item?.itemName || item.name || "Dịch vụ",
    price: Number(item.amount ?? item.item?.price ?? 0) || 0,
    category: item.item?.itemType?.typeName || item.itemType?.typeName || "",
  }));
}

export function StayHistoryDialog({
  guestId,
  trigger,
}: StayHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [invoiceDetailOpen, setInvoiceDetailOpen] = useState(false);
  const [invoiceDetailLoading, setInvoiceDetailLoading] = useState(false);
  const [invoiceDetail, setInvoiceDetail] = useState<InvoiceView | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemSummary[]>([]);

  const servicesTotal = invoiceItems.reduce(
    (sum, item) => sum + (item.price || 0),
    0
  );
  const roomTotal = invoiceDetail
    ? (invoiceDetail.roomPrice || 0) * (invoiceDetail.nights || 0)
    : 0;
  const grandTotal = roomTotal + servicesTotal;

  const handleViewInvoiceDetail = useCallback(async (invoiceId: number) => {
    setInvoiceDetailOpen(true);
    setInvoiceDetailLoading(true);
    setInvoiceDetail(null);
    setInvoiceItems([]);
    try {
      const res = await fetch(`${API_BASE}/api/invoices/${invoiceId}`);
      if (!res.ok) throw new Error(`Failed to load invoice ${invoiceId}`);
      const data: RawInvoice = await res.json();
      const mappedDetail = mapInvoiceView(data);
      setInvoiceDetail(mappedDetail);

      let itemsData: any[] = [];
      try {
        const primary = await fetch(
          `${API_BASE}/api/invoice-items/invoice/${invoiceId}`
        );
        if (primary.ok) {
          itemsData = await primary.json();
        } else {
          const fallback = await fetch(
            `${API_BASE}/api/invoices/${invoiceId}/items`
          );
          if (fallback.ok) {
            itemsData = await fallback.json();
          }
        }
      } catch (itemErr) {
        console.error("Failed to load invoice items", itemErr);
      }
      setInvoiceItems(mapInvoiceItems(itemsData));
    } catch (err) {
      console.error("Failed to load invoice detail", err);
    } finally {
      setInvoiceDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    async function loadStays() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/invoices/guest/${guestId}`);
        if (!res.ok)
          throw new Error(`Failed to fetch invoices for guest ${guestId}`);
        const data: RawInvoice[] = await res.json();
        if (!cancelled) {
          const mapped = (data || [])
            .map((item) => mapInvoiceSummary(item))
            .filter(Boolean) as InvoiceSummary[];
          mapped.sort((a, b) => {
            const aTime = a.createdAtRaw
              ? new Date(a.createdAtRaw).getTime()
              : 0;
            const bTime = b.createdAtRaw
              ? new Date(b.createdAtRaw).getTime()
              : 0;
            return bTime - aTime;
          });
          setInvoices(mapped);
        }
      } catch (err) {
        console.error("Failed to load guest invoices", err);
        if (!cancelled) setInvoices([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStays();
    return () => {
      cancelled = true;
    };
  }, [open, guestId]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || <Button variant="outline">Lịch sử lưu trú</Button>}
        </DialogTrigger>
        <DialogContent className="max-w-xl bg-white max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Lịch sử lưu trú
            </DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
              <span className="ml-2 text-blue-500">Đang tải...</span>
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Chưa có hóa đơn nào cho khách này.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white/70 divide-y divide-gray-100">
              {invoices.map((invoice) => (
                <div
                  key={invoice.invoiceId}
                  className="px-3 py-3 text-sm text-slate-700 space-y-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-blue-50 p-1.5">
                        <BedDouble className="h-4 w-4 text-blue-500" />
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">
                          Hóa đơn #{invoice.invoiceId}
                        </p>
                        <p className="text-xs text-slate-500 sm:text-sm">
                          Phòng {invoice.roomNumber || "-"} • {invoice.nights}{" "}
                          đêm
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${invoiceStatusBadge(
                          invoice.status,
                          invoice.isPaid
                        )}`}
                      >
                        {invoice.statusLabel}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-300 hover:bg-slate-100"
                        onClick={() =>
                          handleViewInvoiceDetail(invoice.invoiceId)
                        }
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-xs text-slate-600 sm:grid-cols-3 sm:text-sm">
                    <div>
                      <span className="font-medium text-slate-500">Nhận</span>
                      <p className="text-slate-800">{invoice.checkIn || "-"}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-500">Trả</span>
                      <p className="text-slate-800">
                        {invoice.checkOut || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-500">
                        Phương thức
                      </span>
                      <p className="text-slate-800">
                        {invoice.paymentMethod || "Chưa thanh toán"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={invoiceDetailOpen} onOpenChange={setInvoiceDetailOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-700">
              Chi tiết hóa đơn
            </DialogTitle>
          </DialogHeader>
          {invoiceDetailLoading ? (
            <div className="flex items-center justify-center py-10 text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Đang tải dữ liệu...</span>
            </div>
          ) : !invoiceDetail ? (
            <p className="text-sm text-slate-500">
              Không tìm thấy thông tin hóa đơn.
            </p>
          ) : (
            <div className="space-y-6 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-600">Mã Hóa Đơn</Label>
                  <p className="font-semibold text-slate-800">
                    {invoiceDetail.id}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-600">Trạng Thái</Label>
                  <p className="font-medium text-slate-800">
                    {invoiceDetail.status === "cancelled"
                      ? "Đã Hủy Hóa Đơn"
                      : invoiceDetail.isPaid
                      ? "Đã Thanh Toán"
                      : "Chờ Thanh Toán"}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-600">Khách Hàng</Label>
                  <p className="font-medium text-slate-800">
                    {invoiceDetail.guestName}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {formatIdDisplay(
                      invoiceDetail.idType,
                      invoiceDetail.idNumber
                    )}{" "}
                    • {invoiceDetail.phone || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-600">Người Tạo Hóa Đơn</Label>
                  <p className="font-medium text-slate-800">
                    {invoiceDetail.createdByUser}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-600">Thời Gian Tạo</Label>
                  <p className="font-medium text-slate-800">
                    {invoiceDetail.createdAt}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-600">
                    Phương Thức Thanh Toán
                  </Label>
                  <p className="font-medium text-slate-800">
                    {invoiceDetail.paymentMethod || "Chưa thanh toán"}
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
                          {invoiceDetail.roomNumber}
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-600 text-xs">
                          Loại Phòng
                        </Label>
                        <p className="font-medium text-slate-800">
                          {invoiceDetail.roomType}
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-600 text-xs">
                          Giá/Đêm
                        </Label>
                        <p className="font-medium text-slate-800">
                          {invoiceDetail.roomPrice.toLocaleString("vi-VN")} đ
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-600">Nhận Phòng</Label>
                      <p className="font-medium text-slate-800">
                        {invoiceDetail.checkIn}
                      </p>
                    </div>

                    <div>
                      <Label className="text-slate-600">Trả Phòng</Label>
                      <p className="font-medium text-slate-800">
                        {invoiceDetail.checkOut}
                      </p>
                    </div>

                    <div>
                      <Label className="text-slate-600">Số Đêm</Label>
                      <p className="font-medium text-slate-800">
                        {invoiceDetail.nights} đêm
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Dịch vụ
                  </p>
                  {invoiceItems.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Chưa có dịch vụ nào.
                    </p>
                  ) : (
                    <div
                      className="grid gap-2 text-sm"
                      style={{
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(220px, 1fr))",
                      }}
                    >
                      {invoiceItems.map((item) => (
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
                              {item.category || ""}
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
                {invoiceDetail.isPaid && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-300 hover:bg-slate-50"
                    onClick={() =>
                      handlePrintInvoice({
                        invoice: invoiceDetail,
                        services: invoiceItems,
                        roomTotal,
                        servicesTotal,
                        grandTotal,
                      })
                    }
                  >
                    <Printer className="h-4 w-4 mr-1" />
                    In Hóa Đơn
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default StayHistoryDialog;
