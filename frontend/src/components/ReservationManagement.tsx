import { useState, useEffect } from "react";
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
import { BookingDialog } from "./BookingDialog";
import { ReservationEditDialog } from "./ReservationEditDialog";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

type ReservationStatus =
  | "checked-in"
  | "checked-out"
  | "confirmed"
  | "cancelled";

interface ReservationRoomDto {
  id?: number | string;
  roomId?: number;
  roomNumber?: string;
  roomType?: string;
  pricePerNight?: number;
  price?: number;
}

interface Reservation {
  reservationId: number;
  guest: { guestId: number; fullName: string; email?: string; phone?: string };
  arrivalDate: string;
  departureDate: string;
  numGuests: number;
  totalEstimated: number;
  status: ReservationStatus;
  reservationRooms?: ReservationRoomDto[];
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// sample fallback for UI usage in dev builds
const reservations: Reservation[] = [];

const statusColors = {
  "checked-in": "bg-green-100 text-green-800",
  "checked-out": "bg-gray-100 text-gray-800",
};

export function ReservationManagement() {
  const [reservationsList, setReservationsList] =
    useState<Reservation[]>(reservations);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  const handleCheckout = async (reservationId: number) => {
    const r = reservationsList.find((i) => i.reservationId === reservationId);
    if (!r) return;
    try {
      const updated = { ...r, status: "checked-out" } as any;
      const resp = await fetch(
        `${API_BASE}/api/reservations/${reservationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        }
      );
      if (!resp.ok) throw new Error("update failed");
      setReservationsList((prev) =>
        prev.map((item) =>
          item.reservationId === reservationId ? updated : item
        )
      );
      toast.success("Trả phòng thành công!");
    } catch (err) {
      toast.error("Không thể đổi trạng thái");
    }
  };

  const handleDelete = async (reservationId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/reservations/${reservationId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete failed");
      setReservationsList((prev) =>
        prev.filter((r) => r.reservationId !== reservationId)
      );
      toast.success("Đã xóa đặt phòng!");
    } catch (err) {
      toast.error("Xóa đặt phòng thất bại");
    }
  };

  const fetchReservations = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/reservations`)
      .then((res) => res.json())
      .then((data) => setReservationsList(data))
      .catch(() => toast.error("Không tải được danh sách đặt phòng"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const filteredReservations = reservationsList.filter((reservation) => {
    const guestName = reservation.guest?.fullName || "";
    const matchesSearch =
      guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reservation.reservationId?.toString() || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (reservation.guest?.email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || reservation.status === statusFilter;
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
          onCreated={(res) => {
            fetchReservations();
          }}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm theo tên khách, email hoặc mã đặt phòng..."
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
            <SelectItem value="checked-in">Đã Nhận Phòng</SelectItem>
            <SelectItem value="checked-out">Đã Trả Phòng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reservations Table */}
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
                            {rr.roomNumber
                              ? `#${rr.roomNumber}`
                              : (rr.roomType as any)?.name || rr.roomType}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">
                          (Chưa chọn phòng)
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {reservation.arrivalDate?.split("T")[0]}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {reservation.departureDate?.split("T")[0]}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {reservation.reservationRooms?.length || 0}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        statusColors[
                          reservation.status as ReservationStatus
                        ] as any
                      }
                    >
                      {reservation.status === "checked-in"
                        ? "Đã Nhận Phòng"
                        : reservation.status === "checked-out"
                        ? "Đã Trả Phòng"
                        : reservation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReservation(reservation)}
                            className="border-slate-300 hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-white">
                          <DialogHeader>
                            <DialogTitle className="text-slate-700">
                              Chi Tiết Đặt Phòng
                            </DialogTitle>
                          </DialogHeader>
                          {selectedReservation && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
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
                                    Trạng Thái
                                  </Label>
                                  <Badge
                                    className={`mt-1 ${
                                      statusColors[
                                        selectedReservation.status as ReservationStatus
                                      ]
                                    }`}
                                  >
                                    {selectedReservation.status === "checked-in"
                                      ? "Đã Nhận Phòng"
                                      : selectedReservation.status ===
                                        "checked-out"
                                      ? "Đã Trả Phòng"
                                      : selectedReservation.status}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-slate-600">
                                    Khách Hàng
                                  </Label>
                                  <p className="font-medium text-slate-700">
                                    {selectedReservation.guest?.fullName}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">
                                    Điện Thoại
                                  </Label>
                                  <p className="font-medium text-slate-700">
                                    {selectedReservation.guest?.phone}
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <Label className="text-slate-600">
                                    Các Phòng
                                  </Label>
                                  {selectedReservation.reservationRooms &&
                                    selectedReservation.reservationRooms.map(
                                      (rr, idx) => (
                                        <p
                                          key={idx}
                                          className="font-medium text-slate-700"
                                        >
                                          {rr.roomNumber
                                            ? `#${rr.roomNumber}`
                                            : `Loại: ${
                                                (rr.roomType as any)?.name ||
                                                rr.roomType
                                              }`}{" "}
                                          -{" "}
                                          {rr.pricePerNight
                                            ? `${rr.pricePerNight} / đêm`
                                            : ""}
                                        </p>
                                      )
                                    )}
                                </div>
                                <div>
                                  <Label className="text-slate-600">
                                    Số Khách
                                  </Label>
                                  <p className="font-medium text-slate-700">
                                    {selectedReservation.numGuests}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">
                                    Nhận Phòng
                                  </Label>
                                  <p className="font-medium text-slate-700">
                                    {
                                      selectedReservation.arrivalDate?.split(
                                        "T"
                                      )[0]
                                    }
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">
                                    Trả Phòng
                                  </Label>
                                  <p className="font-medium text-slate-700">
                                    {
                                      selectedReservation.departureDate?.split(
                                        "T"
                                      )[0]
                                    }
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">
                                    Thời Gian
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
                                    Tổng Tiền
                                  </Label>
                                  <p className="font-medium text-emerald-600">
                                    ₹
                                    {selectedReservation.totalEstimated?.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2 pt-4">
                                {selectedReservation.status ===
                                  "checked-in" && (
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() =>
                                      handleCheckout(
                                        selectedReservation.reservationId
                                      )
                                    }
                                  >
                                    Trả Phòng
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 border-slate-300"
                                  onClick={() =>
                                    handleDelete(
                                      selectedReservation.reservationId
                                    )
                                  }
                                >
                                  Xóa
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <ReservationEditDialog
                        reservation={reservation}
                        onSave={(updated) => fetchReservations()}
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-300 hover:bg-slate-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
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
