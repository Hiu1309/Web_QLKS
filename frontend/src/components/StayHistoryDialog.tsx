import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { CalendarDays, BedDouble, Loader2 } from "lucide-react";

const API_BASE =
  ((import.meta as any).env?.VITE_API_BASE as string) ||
  (import.meta as any).env?.VITE_API ||
  "http://localhost:8080";

interface RawStay {
  stayId: number;
  guest?: {
    guestId: number;
  };
  room?: {
    roomName?: string;
    name?: string;
    roomNumber?: string;
  };
  checkinTime?: string;
  checkoutTime?: string;
  status?: string;
}

export interface Stay {
  stayId: number;
  roomName: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
}

interface StayHistoryDialogProps {
  guestId: string;
  trigger?: React.ReactNode;
}

const statusLabels: Record<string, string> = {
  "checked-in": "Đang lưu trú",
  "check-in": "Đang lưu trú",
  "checked-out": "Đã trả phòng",
  "check-out": "Đã trả phòng",
  completed: "Hoàn thành",
  booking: "Đang đặt",
};

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
}

function mapStay(data: RawStay): Stay {
  const roomName =
    data.room?.roomName ||
    data.room?.name ||
    data.room?.roomNumber ||
    "Không rõ";
  const status = data.status ? statusLabels[data.status] || data.status : "-";

  return {
    stayId: data.stayId,
    roomName,
    checkIn: data.checkinTime,
    checkOut: data.checkoutTime,
    status,
  };
}

function getStatusPill(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("hoàn")) {
    return "bg-emerald-50 text-emerald-600 border border-emerald-100";
  }
  if (normalized.includes("lưu trú")) {
    return "bg-blue-50 text-blue-600 border border-blue-100";
  }
  if (normalized.includes("trả phòng")) {
    return "bg-slate-50 text-slate-600 border border-slate-100";
  }
  if (normalized.includes("đặt")) {
    return "bg-amber-50 text-amber-600 border border-amber-100";
  }
  return "bg-gray-50 text-gray-600 border border-gray-100";
}

export function StayHistoryDialog({
  guestId,
  trigger,
}: StayHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stays, setStays] = useState<Stay[]>([]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    async function loadStays() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/stays/guest/${guestId}`);
        if (!res.ok)
          throw new Error(`Failed to fetch stays for guest ${guestId}`);
        const data: RawStay[] = await res.json();
        if (!cancelled) {
          setStays((data || []).map(mapStay));
        }
      } catch (err) {
        console.error("Failed to load stays", err);
        if (!cancelled) setStays([]);
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
        ) : stays.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            Không có lịch sử lưu trú nào.
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white/70 divide-y divide-gray-100">
            {stays.map((stay) => (
              <div
                key={stay.stayId}
                className="grid grid-cols-1 gap-2 px-3 py-2 text-sm text-gray-700 sm:grid-cols-[150px_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-50 p-1.5">
                    <BedDouble className="h-4 w-4 text-blue-500" />
                  </span>
                  <span className="font-semibold text-gray-800 leading-tight">
                    {stay.roomName}
                  </span>
                </div>
                <div className="text-xs text-gray-500 sm:text-sm">
                  <span className="font-medium text-gray-400">Nhận:</span>
                  <span className="ml-1 text-gray-700">
                    {formatDateTime(stay.checkIn)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 sm:text-sm">
                  <span className="font-medium text-gray-400">Trả:</span>
                  <span className="ml-1 text-gray-700">
                    {formatDateTime(stay.checkOut)}
                  </span>
                </div>
                <span
                  className={`inline-block justify-self-start sm:justify-self-end rounded-full px-2.5 py-1 text-xs font-semibold leading-none ${getStatusPill(
                    stay.status
                  )}`}
                >
                  {stay.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default StayHistoryDialog;
