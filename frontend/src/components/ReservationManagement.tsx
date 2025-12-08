import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
import { BookingDialog } from "./BookingDialog";
import { ReservationEditDialog } from "./ReservationEditDialog";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

type ReservationStatus = "booking" | "checked-in" | "checked-out" | "cancelled";

interface ReservationRoomDto {
  id?: number | string;
  roomId?: number;
  roomNumber?: string;
  room?: { roomId?: number; roomNumber?: string; roomType?: any };
  roomType?: any;
  pricePerNight?: number;
  price?: number;
}

interface Reservation {
  reservationId: number;
  guest: {
    guestId: number;
    fullName: string;
    email?: string;
    phone?: string;
    idNumber?: string;
  };
  arrivalDate: string;
  departureDate: string;
  numGuests: number;
  totalEstimated: number;
  status: ReservationStatus | string;
  reservationRooms?: ReservationRoomDto[];
  user?: { userId: number; username: string; fullName?: string };
}

const API_BASE =
  ((import.meta as any).env?.VITE_API_BASE as string) ||
  "http://localhost:8080";

const statusText = (s: string | undefined) => {
  const key = (s || "").toLowerCase();
  switch (key) {
    case "booking":
      return "Đã đặt";
    case "checked-in":
      return "Đã nhận phòng";
    case "checked-out":
      return "Đã trả phòng";
    case "cancelled":
      return "Đã hủy phòng";
    default:
      return s || "-";
  }
};

const statusColorMap: Record<string, { bg: string; text: string }> = {
  booking: { bg: "#0ea5e9", text: "#ffffff" },
  "checked-in": { bg: "#fbbf24", text: "#ffffff" },
  "checked-out": { bg: "#22c55e", text: "#ffffff" },
  cancelled: { bg: "#ef4444", text: "#ffffff" },
};

const StatusBadge = ({ status }: { status: string | undefined }) => {
  const statusLower = (status || "").toLowerCase();
  const colors = statusColorMap[statusLower];

  if (!colors) return null;

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
      {statusText(status)}
    </span>
  );
};

const formatCurrency = (val?: number | string | null) => {
  if (val === null || val === undefined || val === "") return "-";
  const num =
    typeof val === "number"
      ? val
      : parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
  if (isNaN(num)) return String(val);
  return num.toLocaleString("vi-VN");
};

const calculateNights = (arrival?: string, departure?: string) => {
  if (!arrival || !departure) return 0;
  try {
    const a = new Date(arrival);
    const d = new Date(departure);
    const days = Math.ceil((d.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  } catch (err) {
    return 0;
  }
};

const calculateReservationTotal = (reservation: Reservation | null) => {
  if (!reservation) return 0;
  const nights = calculateNights(
    reservation.arrivalDate,
    reservation.departureDate
  );
  if (
    !reservation.reservationRooms ||
    reservation.reservationRooms.length === 0
  )
    return 0;
  let total = 0;
  reservation.reservationRooms.forEach((rr) => {
    const perNight =
      rr.pricePerNight ?? (rr.price ? Number(rr.price) / (nights || 1) : 0);
    total += (perNight || 0) * (nights || 0);
  });
  return total;
};

const formatDateDisplay = (value?: string) => {
  if (!value) return "-";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("vi-VN"); // dd/mm/yyyy
  } catch (err) {
    return value;
  }
};

export function ReservationManagement() {
  const [reservationsList, setReservationsList] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  const fetchReservations = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/reservations`)
      .then((r) => r.json())
      .then((data) => {
        // Hiển thị cả các đặt phòng đã hủy; sắp xếp mới nhất trước
        const sorted = (data || []).slice().sort((a: any, b: any) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        });
        setReservationsList(sorted);
      })
      .catch(() => toast.error("Không tải được danh sách đặt phòng"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const updateReservationStatus = async (
    reservationId: number,
    newStatus: string
  ) => {
    const r = reservationsList.find((i) => i.reservationId === reservationId);
    if (!r) return null;
    try {
      const updated = { ...r, status: newStatus } as any;
      const resp = await fetch(
        `${API_BASE}/api/reservations/${reservationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }
      );
      if (!resp.ok) {
        if (resp.status === 404) {
          toast.error("Không tìm thấy đặt phòng (có thể đã bị xóa).");
          // Refresh reservations to sync state
          fetchReservations();
          return null;
        }
        throw new Error("update failed");
      }
      const updatedFromServer = await resp.json();
      // keep detail view in sync if currently selected
      if (
        selectedReservation &&
        selectedReservation.reservationId === reservationId
      ) {
        if (newStatus === "cancelled") {
          setSelectedReservation(null);
        } else {
          setSelectedReservation(updatedFromServer);
        }
      }
      // If cancelled, remove from list
      if (newStatus === "cancelled") {
        setReservationsList((prev) =>
          prev.filter((p) => p.reservationId !== reservationId)
        );
      } else {
        setReservationsList((prev) =>
          prev.map((item) =>
            item.reservationId === reservationId ? updatedFromServer : item
          )
        );
      }
      return updatedFromServer;
    } catch (err) {
      toast.error("Không thể đổi trạng thái");
      return null;
    }
  };

  const handleCheckIn = async (reservationId: number) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/reservations/${reservationId}/checkin`,
        {
          method: "POST",
        }
      );
      if (!res.ok) throw new Error("Check-in failed");
      const data = await res.json();
      // backend sets reservation status and returns stays; refresh list
      fetchReservations();
      try {
        window.dispatchEvent(new Event("roomsUpdated"));
      } catch (e) {}
      return data;
    } catch (err) {
      console.error(err);
      toast.error("Không thể nhận phòng");
      return null;
    }
  };

  const handleCheckOut = async (reservationId: number) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/reservations/${reservationId}/checkout`,
        {
          method: "POST",
        }
      );
      if (!res.ok) throw new Error("Check-out failed");
      const data = await res.json();
      fetchReservations();
      try {
        window.dispatchEvent(new Event("roomsUpdated"));
      } catch (e) {}
      return data;
    } catch (err) {
      console.error(err);
      toast.error("Không thể trả phòng");
      return null;
    }
  };

  const handleCancel = async (reservationId: number) => {
    try {
      const updated = await updateReservationStatus(reservationId, "cancelled");
      if (updated) toast.success("Đã hủy đặt phòng!");
      try {
        window.dispatchEvent(new Event("roomsUpdated"));
      } catch (e) {}
    } catch (err) {
      toast.error("Xóa (hủy) đặt phòng thất bại");
    }
  };

  const filteredReservations = reservationsList.filter((reservation) => {
    const guestName = reservation.guest?.fullName || "";
    const guestPhone = reservation.guest?.phone || "";
    const roomNumbers =
      reservation.reservationRooms
        ?.map((rr) => rr.room?.roomNumber || rr.roomNumber || "")
        .join(" ") || "";
    const reservationId = reservation.reservationId?.toString() || "";

    const matchesSearch =
      guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guestPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roomNumbers.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservationId.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (reservation.status || "").toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-700">Đặt Phòng</h1>
          <p className="text-slate-600">Quản lý tất cả đặt phòng khách sạn</p>
        </div>
        <BookingDialog
          trigger={
            <Button className="bg-gray-700 hover:bg-gray-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Đặt Phòng Mới
            </Button>
          }
          onCreated={() => fetchReservations()}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm theo mã, tên khách, số điện thoại hoặc số phòng..."
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
            <SelectItem value="booking">Đã Đặt</SelectItem>
            <SelectItem value="checked-in">Đã Nhận Phòng</SelectItem>
            <SelectItem value="checked-out">Đã Trả Phòng</SelectItem>
            <SelectItem value="cancelled">Đã Hủy Phòng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-700">Đặt Phòng Gần Đây</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-600">Mã Đặt Phòng</TableHead>
                <TableHead className="text-slate-600">Khách Hàng</TableHead>
                <TableHead className="text-slate-600">Phòng</TableHead>
                <TableHead className="text-slate-600">Loại Phòng</TableHead>
                <TableHead className="text-slate-600">Nhận Phòng</TableHead>
                <TableHead className="text-slate-600">Trả Phòng</TableHead>
                <TableHead className="text-slate-600">Đêm</TableHead>
                <TableHead className="text-slate-600">Trạng Thái</TableHead>
                <TableHead className="text-slate-600">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow
                  key={reservation.reservationId}
                  className="hover:bg-slate-50"
                >
                  <TableCell className="font-medium text-slate-700">
                    {reservation.reservationId}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-700">
                        {reservation.guest?.fullName}
                      </p>
                      <p className="text-sm text-slate-500">
                        {reservation.guest?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {reservation.reservationRooms &&
                      reservation.reservationRooms.length > 0 ? (
                        reservation.reservationRooms.map((rr, idx) => (
                          <p key={idx} className="font-medium text-slate-700">
                            {rr.room?.roomNumber ??
                              rr.roomNumber ??
                              "(Chưa chọn)"}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">
                          (Chưa chọn phòng)
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {reservation.reservationRooms &&
                      reservation.reservationRooms.length > 0 ? (
                        reservation.reservationRooms.map((rr, idx) => (
                          <p key={idx} className="font-medium text-slate-700">
                            {(rr.roomType as any)?.name || rr.roomType || "-"}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">
                          (Chưa chọn loại)
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatDateDisplay(reservation.arrivalDate)}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatDateDisplay(reservation.departureDate)}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {Math.ceil(
                      (new Date(reservation.departureDate).getTime() -
                        new Date(reservation.arrivalDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}
                  </TableCell>
                  <TableCell>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <StatusBadge status={reservation.status} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 items-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              // Fetch chi tiết; nếu backend không trả reservationRooms (đặc biệt với trạng thái hủy), dùng dữ liệu hiện có để merge
                              try {
                                const res = await fetch(
                                  `${API_BASE}/api/reservations/${reservation.reservationId}`
                                );
                                if (res.ok) {
                                  const data = await res.json();
                                  const mergedRooms =
                                    data?.reservationRooms &&
                                    data.reservationRooms.length > 0
                                      ? data.reservationRooms
                                      : reservation.reservationRooms;
                                  setSelectedReservation({
                                    ...data,
                                    reservationRooms: mergedRooms,
                                  });
                                  return;
                                }
                              } catch (e) {
                                console.error(
                                  "Load reservation detail failed",
                                  e
                                );
                              }
                              setSelectedReservation(reservation);
                            }}
                            className="border-slate-300 hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-white p-6">
                          <DialogHeader>
                            <DialogTitle className="text-slate-700">
                              Chi Tiết Đặt Phòng
                            </DialogTitle>
                          </DialogHeader>
                          {selectedReservation &&
                            selectedReservation.reservationId ===
                              reservation.reservationId && (
                              <div className="space-y-6 text-sm">
                                {/* Guest & basics */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <Label className="text-slate-600">
                                      Mã Đặt Phòng
                                    </Label>
                                    <p className="font-medium text-slate-700">
                                      {selectedReservation.reservationId}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-slate-600">
                                      Trạng thái
                                    </Label>
                                    <p className="font-medium text-slate-700">
                                      {statusText(selectedReservation.status)}
                                    </p>
                                  </div>
                                  <div />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <Label className="text-slate-600">
                                      Khách Hàng
                                    </Label>
                                    <p className="font-medium text-slate-700">
                                      {selectedReservation.guest?.fullName}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      {selectedReservation.guest?.idNumber ||
                                        "-"}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      {selectedReservation.guest?.phone || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-slate-600">
                                      Nhận Phòng
                                    </Label>
                                    <p className="font-medium text-slate-700">
                                      {formatDateDisplay(
                                        selectedReservation.arrivalDate
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-slate-600">
                                      Trả Phòng
                                    </Label>
                                    <p className="font-medium text-slate-700">
                                      {formatDateDisplay(
                                        selectedReservation.departureDate
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <Label className="text-slate-600">
                                      Số Đêm
                                    </Label>
                                    <p className="font-medium text-slate-700">
                                      {Math.ceil(
                                        (new Date(
                                          selectedReservation.departureDate
                                        ).getTime() -
                                          new Date(
                                            selectedReservation.arrivalDate
                                          ).getTime()) /
                                          (1000 * 60 * 60 * 24)
                                      )}{" "}
                                      đêm
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-slate-600">
                                      Số khách
                                    </Label>
                                    <p className="font-medium text-slate-700">
                                      {selectedReservation.numGuests}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-slate-600">
                                      Người tạo
                                    </Label>
                                    <p className="font-medium text-slate-700">
                                      {selectedReservation.user?.fullName ||
                                        selectedReservation.user?.username ||
                                        "-"}
                                    </p>
                                  </div>
                                </div>

                                {/* Rooms list */}
                                <div>
                                  <Label className="text-slate-600">
                                    Phòng đã chọn
                                  </Label>
                                  <div className="mt-2 space-y-2">
                                    {selectedReservation.reservationRooms?.map(
                                      (rr, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center justify-between gap-4 p-3 border rounded-md"
                                        >
                                          <div>
                                            <p className="font-medium text-slate-700">
                                              {rr.room?.roomNumber ??
                                                rr.roomNumber ??
                                                "(Chưa chọn)"}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                              {(rr.roomType as any)?.name ||
                                                rr.roomType}
                                            </p>
                                          </div>
                                          <div className="text-sm text-slate-700">
                                            {rr.pricePerNight
                                              ? `${formatCurrency(
                                                  rr.pricePerNight
                                                )} đ/đêm`
                                              : "-"}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>

                                {/* Totals */}
                                <div className="flex items-center justify-between">
                                  <div>
                                    <Label className="text-slate-600">
                                      Tổng ước tính
                                    </Label>
                                    <p className="font-medium text-slate-700">
                                      {selectedReservation.totalEstimated
                                        ? `${formatCurrency(
                                            selectedReservation.totalEstimated
                                          )} đ`
                                        : "-"}
                                    </p>
                                  </div>
                                  <div />
                                </div>
                              </div>
                            )}
                        </DialogContent>
                      </Dialog>
                      <ReservationEditDialog
                        reservation={reservation}
                        onSave={(updated) => {
                          fetchReservations();
                          if (updated) setSelectedReservation(updated);
                        }}
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-300 hover:bg-slate-50"
                            disabled={
                              (reservation.status || "").toLowerCase() ===
                                "checked-in" ||
                              (reservation.status || "").toLowerCase() ===
                                "checked-out" ||
                              (reservation.status || "").toLowerCase() ===
                                "cancelled"
                            }
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-300 hover:bg-slate-50"
                            disabled={
                              (reservation.status || "").toLowerCase() ===
                                "checked-in" ||
                              (reservation.status || "").toLowerCase() ===
                                "checked-out" ||
                              (reservation.status || "").toLowerCase() ===
                                "cancelled"
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Bạn có chắc muốn hủy đặt phòng?
                            </AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Huỷ</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleCancel(reservation.reservationId)
                              }
                              disabled={
                                (reservation.status || "").toLowerCase() ===
                                  "checked-in" ||
                                (reservation.status || "").toLowerCase() ===
                                  "checked-out" ||
                                (reservation.status || "").toLowerCase() ===
                                  "cancelled"
                              }
                            >
                              Hủy đặt
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {((reservation.status || "").toLowerCase() ===
                        "booking" ||
                        (reservation.status || "").toLowerCase() ===
                          "confirmed") && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={async () => {
                            const result = await handleCheckIn(
                              reservation.reservationId
                            );
                            if (result) {
                              toast.success("Khách đã nhận phòng");
                            }
                          }}
                        >
                          Nhận Phòng
                        </Button>
                      )}
                      {(reservation.status || "").toLowerCase() ===
                        "checked-in" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={async () => {
                            const result = await handleCheckOut(
                              reservation.reservationId
                            );
                            if (result) {
                              toast.success("Trả phòng thành công!");
                            }
                          }}
                        >
                          Trả Phòng
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {filteredReservations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-500">
            Không tìm thấy đặt phòng nào phù hợp với tiêu chí của bạn.
          </p>
        </div>
      )}
    </div>
  );
}

export default ReservationManagement;
