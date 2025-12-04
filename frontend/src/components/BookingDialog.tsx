import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AddGuestDialog } from "./AddGuestDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Textarea } from "./ui/textarea";
import { CalendarIcon, Users, Bed, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface BookingDialogProps {
  trigger?: React.ReactNode;
  roomNumber?: string;
  roomType?: string;
  roomPrice?: number;
  onCreated?: (reservation: any) => void;
}

export function BookingDialog({
  trigger,
  roomNumber,
  roomType,
  roomPrice,
  onCreated,
}: BookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [formData, setFormData] = useState({
    guestId: "",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    idType: "national-id",
    idNumber: "",
    numberOfGuests: "1",
    roomNumber: roomNumber || "",
    roomType: roomType || "standard",
    specialRequests: "",
    paymentMethod: "credit-card",
  });
  // const [allGuests, setAllGuests] = useState<any[]>([]);
  const [foundGuest, setFoundGuest] = useState<any | null>(null);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [selectedRoomObjects, setSelectedRoomObjects] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number | null>(
    null
  );
  const [lookupMessage, setLookupMessage] = useState("");
  const formatCurrency = (val?: number | string | null) => {
    if (val === null || val === undefined || val === "") return "-";
    const num =
      typeof val === "number"
        ? val
        : parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
    if (isNaN(num)) return String(val);
    return num.toLocaleString("vi-VN");
  };
  const API_BASE =
    (import.meta.env.VITE_API_BASE as string) || "http://localhost:8080";
  const toApiIdType = (value: string) =>
    value === "national-id"
      ? "CCCD"
      : value === "passport"
      ? "Hộ chiếu"
      : value || "CCCD";
  const toLocalIsoString = (date: Date | undefined) => {
    if (!date) return null;
    const normalized = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    return normalized.toISOString();
  };
  // use Enter-based lookup instead of suggestions

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Booking submitted:", {
      ...formData,
      checkInDate,
      checkOutDate,
      totalPrice: calculateTotal(),
    });
    // send reservation to backend
    if (!formData.guestId && !foundGuest) {
      toast.error("Vui lòng chọn hoặc thêm khách hàng trước khi đặt phòng");
      return;
    }
    if (!checkInDate || !checkOutDate) {
      toast.error("Vui lòng chọn ngày nhận và ngày trả");
      return;
    }
    if (selectedRooms.length === 0) {
      toast.error("Vui lòng chọn ít nhất một phòng");
      return;
    }
    if (parseInt(formData.numberOfGuests || "1") > (totalMaxOccupancy || 0)) {
      toast.error(
        "Số khách phải nhỏ hơn hoặc bằng tổng sức chứa tối đa của các phòng đã chọn"
      );
      return;
    }
    const guestIdVal = formData.guestId
      ? parseInt(String(formData.guestId))
      : foundGuest && foundGuest.guestId;

    const reservation = {
      guest: {
        guestId: guestIdVal,
        fullName: formData.guestName,
        email: formData.guestEmail,
        phone: formData.guestPhone,
      },
      arrivalDate: toLocalIsoString(checkInDate),
      departureDate: toLocalIsoString(checkOutDate),
      numGuests: parseInt(formData.numberOfGuests || "1"),
      totalEstimated: calculateTotal(),
      status: "confirmed",
      reservationRooms: selectedRoomObjects.map((r) => ({
        room: { roomId: r.roomId },
        roomType: r.roomType
          ? { roomTypeId: r.roomType.roomTypeId }
          : undefined,
        pricePerNight: r.roomType?.basePrice || r.basePrice || undefined,
      })),
    };

    fetch(`${API_BASE}/api/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reservation),
    })
      .then(async (res) => {
        if (!res.ok) {
          // Try to extract server error message
          const body = await res.text().catch(() => "");
          try {
            const json = JSON.parse(body || "{}");
            const msg =
              json.message || json.error || body || "Đặt phòng thất bại";
            console.error("Reservation POST failed:", json);
            toast.error(msg);
          } catch (e) {
            console.error("Reservation POST failed:", body);
            toast.error(body || "Đặt phòng thất bại");
          }
          throw new Error("Đặt phòng thất bại");
        }
        toast.success("Đặt phòng thành công");
        res
          .json()
          .then((data) => {
            onCreated && onCreated(data);
            // notify any listeners (room list) to refresh since a room status may have changed
            try {
              window.dispatchEvent(new Event("roomsUpdated"));
            } catch (e) {
              /* ignore */
            }
            setOpen(false);
          })
          .catch(() => {
            setOpen(false);
          });
      })
      .catch((err) => {
        if (!(err instanceof Error)) console.error(err);
        toast.error(err?.message || "Đặt phòng thất bại");
      });
  };

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const days = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    // Sum up selected rooms' price per night
    const perNightTotal = selectedRoomObjects.reduce((sum, r) => {
      const price = r?.roomType?.basePrice || r?.basePrice || 0;
      return sum + price;
    }, 0);
    return perNightTotal * days;
  };

  useEffect(() => {
    // fetch available rooms (filter "Còn Trống" status on the client) initially and room types
    fetch("http://localhost:8080/api/room-types")
      .then((res) => res.json())
      .then((data) => setRoomTypes(data))
      .catch(() => {});

    fetch("http://localhost:8080/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        const available = data.filter(
          (r: any) => r.status?.name === "Còn Trống"
        );
        setAvailableRooms(available);
      })
      .catch(() => {});
  }, []);

  // reload available rooms when selectedRoomTypeId changes
  useEffect(() => {
    const url = selectedRoomTypeId
      ? `http://localhost:8080/api/rooms?roomTypeId=${selectedRoomTypeId}&statusId=1`
      : `http://localhost:8080/api/rooms?statusId=1`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setAvailableRooms(data))
      .catch(() => setAvailableRooms([]));
  }, [selectedRoomTypeId]);

  // Enter-triggered guest lookup
  const searchGuestById = async (
    idNumber?: string,
    idTypeOverride?: string
  ) => {
    const searchValue = (idNumber ?? formData.idNumber ?? "").trim();
    if (!searchValue) {
      setFoundGuest(null);
      setLookupMessage("");
      return;
    }
    const idTypeForAPI = toApiIdType(idTypeOverride ?? formData.idType);
    const normalize = (value: string) =>
      value.replace(/\s+/g, "").toLowerCase();
    try {
      const res = await fetch(
        `http://localhost:8080/api/guests/find?q=${encodeURIComponent(
          searchValue
        )}&idType=${encodeURIComponent(idTypeForAPI)}`
      );
      if (!res.ok) throw new Error("not found");
      const data = await res.json();
      if (!data || (Array.isArray(data) && data.length === 0)) {
        setFoundGuest(null);
        setLookupMessage("Chưa có tài khoản khách");
        return;
      }
      const desiredId = normalize(searchValue);
      const matchingGuest = Array.isArray(data)
        ? data.find(
            (item) => item?.idNumber && normalize(item.idNumber) === desiredId
          )
        : data?.idNumber && normalize(data.idNumber) === desiredId
        ? data
        : null;
      if (!matchingGuest) {
        setFoundGuest(null);
        setLookupMessage("Chưa có tài khoản khách");
        return;
      }
      const g = matchingGuest;
      setFoundGuest(g);
      setLookupMessage("");
      setFormData((prev) => ({
        ...prev,
        guestId: g.guestId,
        guestName: g.fullName,
        guestEmail: g.email,
        guestPhone: g.phone,
      }));
    } catch (err) {
      setFoundGuest(null);
      setLookupMessage("Chưa có tài khoản khách");
    }
  };

  // ensure selectedRoomObjects contains objects for any selectedRooms (merge, don't override)
  useEffect(() => {
    const foundObjs = selectedRooms
      .map((id) => availableRooms.find((ar) => ar.roomId === id))
      .filter(Boolean);
    setSelectedRoomObjects((prev) => {
      const map = new Map<number, any>();
      prev.forEach((p) => map.set(p.roomId, p));
      foundObjs.forEach((f) => map.set(f.roomId, f));
      return Array.from(map.values());
    });
  }, [selectedRooms, availableRooms]);

  const totalMaxOccupancy = selectedRoomObjects.reduce(
    (sum, r) => sum + (r.roomType?.maxOccupancy || r.maxOccupancy || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gray-700 hover:bg-gray-800 text-white">
            Đặt Phòng
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-800">
            Đặt Phòng Mới
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Điền thông tin để đặt phòng tại khách sạn HHA
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Guest Identification */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Thông Tin Khách Hàng
            </h3>

            {/* HÀNG 1: Loại giấy tờ – Số giấy tờ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="idType">Loại Giấy Tờ *</Label>
                <Select
                  value={formData.idType}
                  onValueChange={(value: string) => {
                    setFormData({ ...formData, idType: value });
                  }}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Chọn loại giấy tờ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national-id">CMND/CCCD</SelectItem>
                    <SelectItem value="passport">Hộ Chiếu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Label htmlFor="idNumber">Số Giấy Tờ *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={(e) => {
                      const newVal = e.target.value;
                      setFormData((prev) => ({ ...prev, idNumber: newVal }));
                      setFoundGuest(null);
                      setLookupMessage("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        searchGuestById(formData.idNumber);
                      }
                    }}
                    required
                    className="border-gray-300 focus:border-gray-500"
                    placeholder="001234567890"
                  />
                  {!foundGuest && (
                    <Button
                      type="button"
                      size="sm"
                      disabled
                      title="Tính năng thêm khách chưa hỗ trợ"
                    >
                      +
                    </Button>
                  )}
                </div>

                {lookupMessage && (
                  <p className="text-sm text-amber-600 mt-1">{lookupMessage}</p>
                )}
              </div>
            </div>

            {/* HÀNG 2: Tên khách – SĐT – Email */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="guestName">Tên Khách</Label>
                <Input
                  id="guestName"
                  placeholder="Họ tên"
                  value={formData.guestName}
                  disabled={!foundGuest}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, guestName: e.target.value }))
                  }
                  className="border-gray-300"
                />
              </div>

              <div>
                <Label htmlFor="guestPhone">Số điện thoại</Label>
                <Input
                  id="guestPhone"
                  placeholder="0123456789"
                  value={formData.guestPhone}
                  disabled={!foundGuest}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, guestPhone: e.target.value }))
                  }
                  className="border-gray-300"
                />
              </div>

              <div>
                <Label htmlFor="guestEmail">Email</Label>
                <Input
                  id="guestEmail"
                  placeholder="abc@example.com"
                  value={formData.guestEmail}
                  disabled={!foundGuest}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, guestEmail: e.target.value }))
                  }
                  className="border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Room & Date Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Thông Tin Phòng & Thời Gian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roomType">Loại Phòng *</Label>
                <Select
                  value={
                    selectedRoomTypeId === null
                      ? "all"
                      : String(selectedRoomTypeId)
                  }
                  onValueChange={(value: string) => {
                    if (value === "all") {
                      setSelectedRoomTypeId(null);
                    } else {
                      const id = parseInt(value);
                      setSelectedRoomTypeId(isNaN(id) ? null : id);
                    }
                  }}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Chọn loại phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất Cả Loại Phòng</SelectItem>
                    {roomTypes.map((rt) => (
                      <SelectItem
                        key={rt.roomTypeId}
                        value={String(rt.roomTypeId)}
                      >
                        {rt.name} ({formatCurrency(rt.basePrice)} đ)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* roomNumber removed - selection below will choose room(s) */}
              <div>
                <Label>Ngày Nhận Phòng *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left border-gray-300 hover:bg-gray-50"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkInDate
                        ? format(checkInDate, "dd/MM/yyyy")
                        : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar
                      mode="single"
                      selected={checkInDate}
                      onSelect={setCheckInDate}
                      disabled={(date: Date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Ngày Trả Phòng *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left border-gray-300 hover:bg-gray-50"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOutDate
                        ? format(checkOutDate, "dd/MM/yyyy")
                        : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar
                      mode="single"
                      selected={checkOutDate}
                      onSelect={setCheckOutDate}
                      disabled={(date: Date) =>
                        !checkInDate || date <= checkInDate
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="numberOfGuests">
                  Số Lượng Khách (tối đa {totalMaxOccupancy || 1})
                </Label>
                <Select
                  value={formData.numberOfGuests}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, numberOfGuests: value })
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: Math.max(1, totalMaxOccupancy) }).map(
                      (_, i) => (
                        <SelectItem key={i} value={String(i + 1)}>
                          {i + 1} người
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Removed Payment & Special Requests: handeled in InvoiceManagement */}

          {/* Total Price */}
          {checkInDate && checkOutDate && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Số đêm:</span>
                <span className="font-semibold text-gray-800">
                  {Math.ceil(
                    (checkOutDate.getTime() - checkInDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  đêm
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-300">
                <span className="text-gray-800">Tổng Tiền:</span>
                <span className="text-2xl font-bold text-gray-800">
                  {formatCurrency(calculateTotal())} đ
                </span>
              </div>
            </div>
          )}

          {/* Available room selection */}
          <div>
            <h3 className="font-semibold text-gray-800">Chọn Phòng</h3>
            {selectedRoomObjects.length > 0 && (
              <div className="py-2">
                <div className="text-sm text-slate-600 mb-1">
                  Phòng đã chọn:
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedRoomObjects.map((r) => (
                    <div
                      key={r.roomId}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded"
                    >
                      <span className="font-medium">
                        {r.roomNumber} - {formatCurrency(r.roomType?.basePrice)}{" "}
                        đ
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRooms((prev) =>
                            prev.filter((id) => id !== r.roomId)
                          );
                          setSelectedRoomObjects((prev) =>
                            prev.filter((obj) => obj.roomId !== r.roomId)
                          );
                        }}
                        className="text-xs text-red-600"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Tổng sức chứa tối đa: {totalMaxOccupancy || 0} khách
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
              {availableRooms.map((r) => (
                <label
                  key={r.roomId}
                  className="p-2 border rounded flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedRooms.includes(r.roomId)}
                    onChange={() => {
                      if (selectedRooms.includes(r.roomId)) {
                        setSelectedRooms((prev) =>
                          prev.filter((id) => id !== r.roomId)
                        );
                        setSelectedRoomObjects((prev) =>
                          prev.filter((obj) => obj.roomId !== r.roomId)
                        );
                      } else {
                        setSelectedRooms((prev) => [...prev, r.roomId]);
                        setSelectedRoomObjects((prev) => [...prev, r]);
                      }
                    }}
                  />
                  <div className="text-sm">
                    <div className="font-medium">Phòng {r.roomNumber}</div>
                    <div className="text-xs text-slate-500">
                      {r.roomType?.name} -{" "}
                      {formatCurrency(r.roomType?.basePrice)} đ / đêm
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-gray-300 hover:bg-gray-100"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gray-700 hover:bg-gray-800 text-white"
            >
              Xác Nhận Đặt Phòng
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
