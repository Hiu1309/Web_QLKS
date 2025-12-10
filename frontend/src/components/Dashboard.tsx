import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Users,
  Bed,
  DollarSign,
  TrendingUp,
  LogIn,
  LogOut,
  Calendar,
  ArrowUp,
  ArrowDown,
  Activity,
  Clock,
  MapPin,
  Receipt,
} from "lucide-react";

const API_BASE =
  ((import.meta as any).env?.VITE_API_BASE as string) ||
  (import.meta as any).env?.VITE_API ||
  "http://localhost:8080";

interface DashboardProps {
  onNavigate?: (
    view:
      | "dashboard"
      | "rooms"
      | "reservations"
      | "invoices"
      | "guests"
      | "services"
      | "employees"
  ) => void;
}

interface DashboardStats {
  onNavigate?: (
    view:
      | "dashboard"
      | "rooms"
      | "reservations"
      | "invoices"
      | "guests"
      | "services"
      | "employees"
  ) => void;
}

interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  bookedRooms: number;
  maintenanceRooms: number;
  cleaningRooms: number;
  totalGuests: number;
  checkIns: number;
  checkOuts: number;
  pendingCheckIns: number;
  pendingCheckOuts: number;
  occupancyRate: number;
  todayRevenue: number;
  yesterdayRevenue: number;
  averageDailyRate: number;
  averageRating?: number | null;
  currency?: string;
  invoicesToday: number;
  monthRevenue?: number;
  yearRevenue?: number;
  topRoom?: UsageHighlight | null;
  topService?: UsageHighlight | null;
}

interface UsageHighlight {
  name: string;
  count: number;
  image?: string | null;
}

interface RecentReservation {
  id: number;
  guestName: string;
  rooms?: string[];
  arrivalDate?: string;
  departureDate?: string;
  status?: string;
  totalAmount?: number;
  nights?: number;
}

interface DashboardResponse {
  stats: DashboardStats;
  recentReservations: RecentReservation[];
}

interface RoomStatusCounts {
  available: number;
  booked: number;
  occupied: number;
  maintenance: number;
  cleaning: number;
  checkedOut: number;
  total: number;
}

const quickActions = [
  {
    title: "Đặt phòng mới",
    icon: Calendar,
    color:
      "bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600",
    action: "reservation",
  },
  {
    title: "Nhận khách",
    icon: LogIn,
    color:
      "bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500",
    action: "checkin",
  },
  {
    title: "Dịch vụ phòng",
    icon: Bed,
    color:
      "bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700",
    action: "service",
  },
  {
    title: "Xem báo cáo",
    icon: Activity,
    color:
      "bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800",
    action: "reports",
  },
];

const STATUS_STYLE_MAP: Record<string, { label: string; className: string }> = {
  confirmed: {
    label: "Đã xác nhận",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
  },
  booking: {
    label: "Đã xác nhận",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
  },
  "checked-in": {
    label: "Đã nhận phòng",
    className:
      "bg-green-100 text-green-700 hover:bg-green-200 border-green-200",
  },
  pending: {
    label: "Chờ xử lý",
    className:
      "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200",
  },
  completed: {
    label: "Đã trả phòng",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
  },
  "checked-out": {
    label: "Đã trả phòng",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200",
  },
};

const getStatusStyle = (status?: string) => {
  if (!status) {
    return {
      label: "Không xác định",
      className: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
    };
  }
  const normalized = status.trim().toLowerCase();
  return (
    STATUS_STYLE_MAP[normalized] || {
      label: status,
      className: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200",
    }
  );
};

const ROOM_STATUS_COLORS: Record<string, string> = {
  "Còn Trống": "#22c55e",
  "Đã đặt": "#0ea5e9",
  "Đã nhận phòng": "#ef4444",
  "Đang bảo trì": "#facc15",
  "Dọn dẹp": "#6b7280",
  "Đã trả phòng": "#fba119ff",
};

const ROOM_STATUS_KEY_MAP: Record<string, keyof RoomStatusCounts> = {
  "còn trống": "available",
  "đã đặt": "booked",
  "đã nhận phòng": "occupied",
  "đang bảo trì": "maintenance",
  "dọn dẹp": "cleaning",
  "đã trả phòng": "checkedOut",
};

const INITIAL_ROOM_STATUS_COUNTS: RoomStatusCounts = {
  available: 0,
  booked: 0,
  occupied: 0,
  maintenance: 0,
  cleaning: 0,
  checkedOut: 0,
  total: 0,
};

const formatDateVi = (value?: string) => {
  if (!value) return "--";
  const normalized = value.length >= 10 ? value.slice(0, 10) : value;
  const parts = normalized.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("vi-VN");
  } catch {
    return value;
  }
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomStatusCounts, setRoomStatusCounts] = useState<RoomStatusCounts>(
    INITIAL_ROOM_STATUS_COUNTS
  );
  const [roomImageMap, setRoomImageMap] = useState<Record<string, string>>({});

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/dashboard`);
      if (!res.ok) {
        throw new Error("Failed to load dashboard data");
      }
      const payload: DashboardResponse = await res.json();
      setData(payload);
    } catch (err) {
      console.error("Failed to fetch dashboard overview", err);
      setError("Không thể tải dữ liệu thống kê.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const fetchRoomStatusSummary = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/rooms`);
      if (!res.ok) {
        throw new Error("Failed to load rooms");
      }
      const rooms = await res.json();
      const counts: RoomStatusCounts = {
        available: 0,
        booked: 0,
        occupied: 0,
        maintenance: 0,
        cleaning: 0,
        checkedOut: 0,
        total: 0,
      };
      const images: Record<string, string> = {};
      (rooms || []).forEach((room: any) => {
        const rawStatus = (room?.status?.name || room?.statusName || "")
          .toString()
          .trim()
          .toLowerCase();
        const key = ROOM_STATUS_KEY_MAP[rawStatus];
        counts.total += 1;
        if (key) {
          counts[key] += 1;
        }
        const roomNumber = (room?.roomNumber || room?.room_number || "")
          .toString()
          .trim();
        if (roomNumber && !images[roomNumber]) {
          const rawImage =
            (room?.image && room.image.toString().trim()) ||
            (room?.roomType?.image && room.roomType.image.toString().trim()) ||
            "";
          if (rawImage) {
            images[roomNumber] = rawImage;
          }
        }
      });
      setRoomStatusCounts(counts);
      setRoomImageMap(images);
    } catch (err) {
      console.error("Failed to fetch room statuses", err);
      setRoomStatusCounts(INITIAL_ROOM_STATUS_COUNTS);
      setRoomImageMap({});
    }
  }, []);

  useEffect(() => {
    fetchRoomStatusSummary();
  }, [fetchRoomStatusSummary]);

  useEffect(() => {
    const handleRoomsUpdated = () => {
      fetchRoomStatusSummary();
    };
    window.addEventListener("roomsUpdated", handleRoomsUpdated);
    return () => window.removeEventListener("roomsUpdated", handleRoomsUpdated);
  }, [fetchRoomStatusSummary]);

  const stats = data?.stats;
  const recentReservations = data?.recentReservations ?? [];

  const currencyFormatter = useMemo(() => {
    if (!stats?.currency) return null;
    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: stats.currency,
        maximumFractionDigits: 0,
      });
    } catch (err) {
      console.warn("Currency format fallback", err);
      return null;
    }
  }, [stats?.currency]);

  const formatCurrency = useCallback(
    (value: number) => {
      const safeValue = Number.isFinite(value) ? value : 0;
      if (currencyFormatter) {
        return currencyFormatter.format(safeValue);
      }
      return `${safeValue.toLocaleString("vi-VN")} ₫`;
    },
    [currencyFormatter]
  );

  const revenueGrowth = useMemo(() => {
    if (!stats) return 0;
    const today = Number(stats.todayRevenue ?? 0);
    const yesterday = Number(stats.yesterdayRevenue ?? 0);
    if (yesterday === 0) {
      return today > 0 ? 100 : 0;
    }
    const diff = ((today - yesterday) / yesterday) * 100;
    return Number(diff.toFixed(1));
  }, [stats]);

  const totalRooms = roomStatusCounts.total || stats?.totalRooms || 0;
  const availableRooms = roomStatusCounts.available;
  const occupiedRooms = roomStatusCounts.occupied;
  const maintenanceRooms = roomStatusCounts.maintenance;
  const cleaningRooms = roomStatusCounts.cleaning;
  const bookedRooms = roomStatusCounts.booked;
  const checkedOutRooms = roomStatusCounts.checkedOut;
  const activeRooms = occupiedRooms + bookedRooms;
  const invoicesToday = stats?.invoicesToday ?? 0;
  const checkInsToday = stats?.checkIns ?? 0;
  const checkOutsToday = stats?.checkOuts ?? 0;
  const pendingCheckIns = stats?.pendingCheckIns ?? 0;
  const pendingCheckOuts = stats?.pendingCheckOuts ?? 0;
  const totalGuests = stats?.totalGuests ?? 0;
  const occupancyRateValue = stats ? Number(stats.occupancyRate ?? 0) : 0;
  const occupancyRateLabel = stats ? `${occupancyRateValue.toFixed(1)}%` : "--";
  const todayRevenueLabel = formatCurrency(Number(stats?.todayRevenue ?? 0));
  const monthRevenueLabel = formatCurrency(Number(stats?.monthRevenue ?? 0));
  const yearRevenueLabel = formatCurrency(Number(stats?.yearRevenue ?? 0));
  const averageDailyRateLabel = formatCurrency(
    Number(stats?.averageDailyRate ?? 0)
  );
  const share = useCallback(
    (count: number) => {
      if (!totalRooms) return 0;
      const ratio = (count / totalRooms) * 100;
      if (!Number.isFinite(ratio)) {
        return 0;
      }
      return Math.min(100, Math.max(0, ratio));
    },
    [totalRooms]
  );

  const revenuePositive = revenueGrowth >= 0;
  const revenueTrendLabel = `${revenuePositive ? "+" : "-"}${Math.abs(
    revenueGrowth
  ).toFixed(1)}%`;

  const topRoom = stats?.topRoom ?? null;
  const topService = stats?.topService ?? null;

  const resolveRoomImage = useCallback(
    (roomNumber: string) => {
      const raw = roomImageMap[roomNumber];
      if (!raw) return null;
      if (/^https?:\/\//i.test(raw)) return raw;
      const normalizedBase = API_BASE.replace(/\/+$/, "");
      const normalizedPath = raw.replace(/^\/+/, "");
      return `${normalizedBase}/${normalizedPath}`;
    },
    [roomImageMap]
  );

  const roomStatusSummary = useMemo(
    () => [
      {
        key: "available",
        label: "Còn Trống",
        count: availableRooms,
        color: ROOM_STATUS_COLORS["Còn Trống"],
      },
      {
        key: "booked",
        label: "Đã đặt",
        count: bookedRooms,
        color: ROOM_STATUS_COLORS["Đã đặt"],
      },
      {
        key: "occupied",
        label: "Đã nhận phòng",
        count: occupiedRooms,
        color: ROOM_STATUS_COLORS["Đã nhận phòng"],
      },
      {
        key: "maintenance",
        label: "Đang bảo trì",
        count: maintenanceRooms,
        color: ROOM_STATUS_COLORS["Đang bảo trì"],
      },
      {
        key: "cleaning",
        label: "Dọn dẹp",
        count: cleaningRooms,
        color: ROOM_STATUS_COLORS["Dọn dẹp"],
      },
      {
        key: "checked-out",
        label: "Đã trả phòng",
        count: checkedOutRooms,
        color: ROOM_STATUS_COLORS["Đã trả phòng"],
      },
    ],
    [
      availableRooms,
      bookedRooms,
      occupiedRooms,
      maintenanceRooms,
      cleaningRooms,
      checkedOutRooms,
    ]
  );

  return (
    <div className="bg-gray-50">
      {/* Hero Section with Background Image */}
      <div className="relative h-64 overflow-hidden bg-gray-900">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1744782996368-dc5b7e697f4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU5NzgzMTQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Sảnh khách sạn sang trọng"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-gray-900/60"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="text-white max-w-2xl">
              <h1 className="text-5xl font-bold mb-4 text-white">
                Chào mừng đến HHA
              </h1>
              <p className="text-xl text-gray-200 mb-8">
                Nơi sang trọng gặp gỡ hoàn hảo
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm px-5 py-3 rounded-lg border border-white/20">
                  <TrendingUp className="h-5 w-5 text-white" />
                  <div>
                    <div className="font-semibold text-white text-lg">
                      {occupancyRateLabel}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-gray-200/80">
                      Tỷ lệ lấp đầy
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm px-5 py-3 rounded-lg border border-white/20">
                  <Receipt className="h-5 w-5 text-white" />
                  <div>
                    <div className="font-semibold text-white text-lg">
                      {invoicesToday}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-gray-200/80">
                      Hóa đơn hôm nay
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm px-5 py-3 rounded-lg border border-white/20">
                  <Users className="h-5 w-5 text-white" />
                  <div>
                    <div className="font-semibold text-white text-lg">
                      {totalGuests}
                    </div>
                    <div className="text-xs uppercase tracking-wide text-gray-200/80">
                      Khách hiện tại
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboard}
              disabled={loading}
            >
              Thử lại
            </Button>
          </div>
        )}

        {/* Interactive Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tỷ lệ lấp đầy
              </CardTitle>
              <div className="p-2.5 bg-gray-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-3 text-gray-900">
                {occupancyRateLabel}
              </div>
              <Progress
                value={occupancyRateValue}
                className="h-2 bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-3">
                {occupiedRooms} trong {totalRooms} phòng đang sử dụng
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-gray-900 text-white hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-100">
                Doanh thu hôm nay
              </CardTitle>
              <div className="p-2.5 bg-white/10 rounded-lg backdrop-blur-sm">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-3 text-white">
                {todayRevenueLabel}
              </div>
              <div className="flex items-center gap-2">
                {revenuePositive ? (
                  <ArrowUp className="h-4 w-4 text-green-400" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-400" />
                )}
                <span
                  className={`text-sm font-medium ${
                    revenuePositive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {revenueTrendLabel}
                </span>
                <span className="text-xs text-gray-300">so với hôm qua</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Nhận phòng hôm nay
              </CardTitle>
              <div className="p-2.5 bg-gray-100 rounded-lg">
                <LogIn className="h-5 w-5 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-3 text-gray-900">
                {checkInsToday}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {pendingCheckIns} khách chờ nhận phòng
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Trả phòng hôm nay
              </CardTitle>
              <div className="p-2.5 bg-gray-100 rounded-lg">
                <LogOut className="h-5 w-5 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-3 text-gray-900">
                {checkOutsToday}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {pendingCheckOuts} khách chờ trả phòng
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <div className="p-2 bg-gray-900 rounded-lg">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              Doanh thu theo thời gian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[{
                label: "Hôm nay",
                value: todayRevenueLabel,
                description: "Doanh thu trong ngày"
              }, {
                label: "Tháng này",
                value: monthRevenueLabel,
                description: "Tổng doanh thu tháng hiện tại"
              }, {
                label: "Năm nay",
                value: yearRevenueLabel,
                description: "Tổng doanh thu trong năm"
              }].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-6 hover:border-gray-300 transition-all"
                >
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 font-semibold">
                    {item.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs text-gray-500 mt-2">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <div className="p-2 bg-gray-900 rounded-lg">
                <Bed className="h-4 w-4 text-white" />
              </div>
              Hoạt động nổi bật
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 hover:border-gray-300 transition-all">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 font-semibold">
                  Phòng được đặt nhiều nhất
                </p>
                <p className="text-xl font-bold text-gray-900 mb-1">
                  {topRoom?.name ? `Phòng ${topRoom.name}` : "Chưa có dữ liệu"}
                </p>
                <p className="text-sm text-gray-600">
                  {topRoom && topRoom.count !== undefined
                    ? `${topRoom.count} lượt đặt`
                    : "Chưa ghi nhận lượt đặt nào"}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 hover:border-gray-300 transition-all">
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 font-semibold">
                  Dịch vụ dùng nhiều nhất
                </p>
                <p className="text-xl font-bold text-gray-900 mb-1">
                  {topService?.name || "Chưa có dữ liệu"}
                </p>
                <p className="text-sm text-gray-600">
                  {topService && topService.count !== undefined
                    ? `${topService.count} lượt sử dụng`
                    : "Chưa ghi nhận lượt sử dụng nào"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room Status with Visual Progress */}
          <Card className="lg:col-span-1 border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <div className="p-2 bg-gray-900 rounded-lg">
                  <Bed className="h-4 w-4 text-white" />
                </div>
                Trạng thái phòng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-5">
                {roomStatusSummary.map((status) => (
                  <div key={status.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: status.color }}
                        ></div>
                        <span className="font-medium text-gray-700">
                          {status.label}
                        </span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {status.count}
                      </span>
                    </div>
                    <Progress
                      value={share(status.count)}
                      className="h-2 bg-gray-100"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reservations with Images */}
          <Card className="lg:col-span-2 border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <div className="p-2 bg-gray-900 rounded-lg">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                Đặt phòng gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReservations.length > 0 ? (
                  recentReservations.map((reservation) => {
                    const rooms = reservation.rooms ?? [];
                    const mainRoom = rooms[0] ?? "--";
                    const extraCount =
                      rooms.length > 1 ? `+${rooms.length - 1}` : "";
                    const badgeText = `${mainRoom}${extraCount}`.trim();
                    const statusStyle = getStatusStyle(reservation.status);
                    const roomImageSrc =
                      rooms.length > 0
                        ? resolveRoomImage(mainRoom) || null
                        : null;

                    return (
                      <div
                        key={reservation.id}
                        className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all group"
                      >
                        <div className="relative">
                          <ImageWithFallback
                            src={
                              roomImageSrc ||
                              "https://images.unsplash.com/photo-1731336478850-6bce7235e320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJvb20lMjBsdXh1cnklMjBiZWR8ZW58MXx8fHwxNzU3OTYxMzgxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                            }
                            alt="Phòng khách sạn"
                            className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <div className="absolute -top-2 -right-2 min-w-7 min-h-7 px-2 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {badgeText}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">
                                {reservation.guestName}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-gray-400" />
                                  {rooms.length
                                    ? `Phòng ${rooms.join(", ")}`
                                    : "Chưa gán phòng"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  {formatDateVi(reservation.arrivalDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  {reservation.nights
                                    ? `${reservation.nights} đêm`
                                    : "--"}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-gray-900 mb-1">
                                {formatCurrency(
                                  Number(reservation.totalAmount ?? 0)
                                )}
                              </p>
                              <Badge className={statusStyle.className}>
                                {statusStyle.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-500">
                    {loading
                      ? "Đang tải dữ liệu đặt phòng gần đây..."
                      : "Chưa có đặt phòng gần đây."}
                  </div>
                )}
              </div>
              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full hover:bg-gray-50 border-gray-300 text-gray-700"
                  onClick={() => onNavigate?.("reservations")}
                >
                  Xem tất cả đặt phòng
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <div className="p-2 bg-gray-900 rounded-lg">
                <Activity className="h-4 w-4 text-white" />
              </div>
              Hiệu suất hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-900/5 text-gray-900">
                  <Receipt className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {invoicesToday}
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Hóa đơn tạo hôm nay
                </p>
              </div>

              <div className="text-center p-6 bg-gray-900 rounded-xl text-white hover:bg-gray-800 transition-all">
                <div className="text-3xl font-bold mb-3">
                  {occupancyRateLabel}
                </div>
                <p className="text-sm text-gray-200 mb-3 font-medium">
                  Lấp đầy
                </p>
                <Progress
                  value={share(activeRooms)}
                  className="h-2 bg-white/20"
                />
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                <div className="text-3xl font-bold text-gray-900 mb-3">
                  {averageDailyRateLabel}
                </div>
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Doanh thu TB
                </p>
                <p className="text-xs text-gray-500">mỗi phòng đang dùng</p>
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                <div className="text-3xl font-bold text-gray-900 mb-3">
                  {totalGuests}
                </div>
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Tổng khách
                </p>
                <p className="text-xs text-gray-500">
                  hiện tại trong khách sạn
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
