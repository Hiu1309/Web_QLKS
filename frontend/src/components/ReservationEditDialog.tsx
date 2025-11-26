import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns@3.6.0";
import { toast } from "sonner";

interface Props {
  reservation: any;
  trigger?: React.ReactNode;
  onSave?: (updated: any) => void;
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export function ReservationEditDialog({ reservation, trigger, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>(undefined);
  const [departureDate, setDepartureDate] = useState<Date | undefined>(
    undefined
  );
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [numGuests, setNumGuests] = useState<number>(1);
  const [status, setStatus] = useState<string>("confirmed");

  useEffect(() => {
    if (!reservation) return;
    setGuestName(reservation.guest?.fullName || "");
    setGuestEmail(reservation.guest?.email || "");
    setGuestPhone(reservation.guest?.phone || "");
    setArrivalDate(
      reservation.arrivalDate ? new Date(reservation.arrivalDate) : undefined
    );
    setDepartureDate(
      reservation.departureDate
        ? new Date(reservation.departureDate)
        : undefined
    );
    setNumGuests(reservation.numGuests || 1);
    setStatus(reservation.status || "confirmed");
    setSelectedRooms(
      (reservation.reservationRooms || []).map((rr: any) => rr.room?.roomId)
    );
  }, [reservation]);

  useEffect(() => {
    fetch(`${API_BASE}/api/rooms`)
      .then((r) => r.json())
      .then((data) =>
        setAvailableRooms(
          data.filter(
            (r: any) =>
              r.status?.name === "Còn Trống" ||
              (reservation &&
                (reservation.reservationRooms || []).some(
                  (rr: any) => rr.room?.roomId === r.roomId
                ))
          )
        )
      )
      .catch(() => {});
  }, [reservation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservation) return;
    const payload = {
      ...reservation,
      guest: {
        ...reservation.guest,
        fullName: guestName,
        email: guestEmail,
        phone: guestPhone,
      },
      arrivalDate: arrivalDate
        ? arrivalDate.toISOString()
        : reservation.arrivalDate,
      departureDate: departureDate
        ? departureDate.toISOString()
        : reservation.departureDate,
      numGuests,
      reservationRooms: selectedRooms.map((id) => ({ room: { roomId: id } })),
    };

    try {
      const res = await fetch(
        `${API_BASE}/api/reservations/${reservation.reservationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Cập nhật thất bại");
      const updated = await res.json();
      toast.success("Cập nhật thành công");
      setOpen(false);
      onSave && onSave(updated);
    } catch (err) {
      toast.error("Cập nhật thất bại");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button size="sm">Sửa</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-white">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa đặt phòng</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Họ tên</Label>
              <Input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Số điện thoại</Label>
              <Input
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
              />
            </div>
            <div>
              <Label>Số khách</Label>
              <Select
                value={String(numGuests)}
                onValueChange={(v) => setNumGuests(parseInt(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Ngày đến</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full text-left">
                    {arrivalDate
                      ? format(arrivalDate, "dd/MM/yyyy")
                      : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={arrivalDate}
                    onSelect={setArrivalDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Ngày đi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full text-left">
                    {departureDate
                      ? format(departureDate, "dd/MM/yyyy")
                      : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={setDepartureDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label>Chọn phòng (có thể chọn nhiều)</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
              {availableRooms.map((r: any) => (
                <label
                  key={r.roomId}
                  className="p-2 border rounded flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedRooms.includes(r.roomId)}
                    onChange={() => {
                      if (selectedRooms.includes(r.roomId))
                        setSelectedRooms(
                          selectedRooms.filter((id) => id !== r.roomId)
                        );
                      else setSelectedRooms([...selectedRooms, r.roomId]);
                    }}
                  />
                  <div>
                    <div className="font-medium">Phòng {r.roomNumber}</div>
                    <div className="text-xs text-slate-500">
                      {r.roomType?.name} -{" "}
                      {r.roomType?.basePrice?.toLocaleString()}₫ / đêm
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" className="bg-gray-700 text-white">
              Lưu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
