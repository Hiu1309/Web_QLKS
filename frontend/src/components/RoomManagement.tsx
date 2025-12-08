// RoomManagement.tsx
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
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Search, Bed, Users, Bath, MapPin, Edit, Trash2 } from "lucide-react";
import { AddEditRoomDialog } from "./AddEditRoomDialog";
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
import { toast } from "sonner";

interface Room {
  roomId: number;
  roomNumber: string;
  roomTypeName: string;
  price: number;
  statusName: string;
  floor: string;
  bedCount: number;
  maxOccupancy: number;
  image: string;
}

// Mapping trạng thái sang màu và nhãn
const statusColors: Record<string, string> = {
  "Còn Trống": "#22c55e",
  "Đã đặt": "#0ea5e9",
  "Đã nhận phòng": "#ef4444",
  "Đang bảo trì": "#facc15",
  "Dọn dẹp": "#6b7280",
  "Đã trả phòng": "#fba119ff",
};

const statusLabels: Record<string, string> = {
  "Còn Trống": "Còn Trống",
  "Đã đặt": "Đã đặt",
  "Đã nhận phòng": "Đã Nhận",
  "Đang bảo trì": "Bảo Trì",
  "Dọn dẹp": "Dọn Dẹp",
  "Đã trả phòng": "Đã Trả",
};

// Chuẩn hóa dữ liệu từ backend
const mapRoomData = (r: any) => ({
  ...r,
  image: r.image?.trim(),
  roomTypeName: r.roomType?.name || "",
  price: r.roomType?.basePrice || r.price || 0,
  bedCount: r.roomType?.bedCount ?? r.bedCount ?? 0,
  maxOccupancy: r.roomType?.maxOccupancy ?? r.maxOccupancy ?? 0,
  statusName: r.status?.name || "",
});

export function RoomManagement() {
  const [roomsList, setRoomsList] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [roomStatuses, setRoomStatuses] = useState<any[]>([]);

  // Fetch rooms
  const fetchRooms = () => {
    fetch("http://localhost:8080/api/rooms")
      .then((res) => res.json())
      .then((data) => setRoomsList(data.map(mapRoomData)))
      .catch(() => toast.error("Không tải được dữ liệu phòng từ server!"));
  };

  // Listen for a global 'roomsUpdated' event to refresh rooms
  useEffect(() => {
    const handler = () => fetchRooms();
    window.addEventListener("roomsUpdated", handler);
    return () => window.removeEventListener("roomsUpdated", handler);
  }, []);

  // Fetch room types & statuses
  const fetchRoomMeta = () => {
    fetch("http://localhost:8080/api/room-types")
      .then((res) => res.json())
      .then((data) => setRoomTypes(data))
      .catch(() => toast.error("Không tải được danh sách loại phòng"));

    fetch("http://localhost:8080/api/room-statuses")
      .then((res) => res.json())
      .then((data) => setRoomStatuses(data))
      .catch(() => toast.error("Không tải được danh sách trạng thái"));
  };

  useEffect(() => {
    fetchRooms();
    fetchRoomMeta();
  }, []);

  // Delete room
  const handleDeleteRoom = async (roomId: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/rooms/${roomId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Xóa thất bại");
      setRoomsList((prev) => prev.filter((room) => room.roomId !== roomId));
      toast.success("Xóa phòng thành công!");
    } catch {
      toast.error("Xóa phòng thất bại!");
    }
  };

  // Filter & Search
  const filteredRooms = roomsList.filter((room) => {
    const matchesSearch = room.roomNumber
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || room.statusName === statusFilter;
    const matchesType =
      typeFilter === "all" || room.roomTypeName === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const uniqueRoomTypes = Array.from(
    new Set(roomsList.map((r) => r.roomTypeName))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* HEADER */}
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src="http://localhost:8080/uploads/rooms/header.jpg"
          alt="Hotel service"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-800/50 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 via-white to-gray-400"></div>
        <div className="absolute inset-0 flex items-center justify-start p-6">
          <div className="text-white max-w-2xl animate-fadeIn">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              Quản lý phòng
            </h1>
            <p className="text-xl opacity-90 text-white/80">
              Giám sát và quản lý tất cả các phòng khách sạn HHA
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1">
                <Bed className="h-5 w-5" />
                <span className="font-semibold">{roomsList.length}</span>
                <span className="text-sm opacity-80">Tổng Phòng</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-5 w-5" />
                <span className="font-semibold">
                  {roomsList.filter((r) => r.statusName === "Còn Trống").length}
                </span>
                <span className="text-sm opacity-80">Còn Trống</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-5 w-5" />
                <span className="font-semibold">
                  {roomsList.filter((r) => r.statusName === "Đã đặt").length}
                </span>
                <span className="text-sm opacity-80">Đã đặt</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER + Add Room */}
      <div className="p-6 space-y-6 -mt-16 relative z-10">
        <Card className="shadow-sm bg-white border-gray-200">
          <CardContent className="flex flex-col sm:flex-row gap-4 items-center justify-between p-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm theo số phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 bg-white"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-white border-gray-300">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {Object.keys(statusLabels).map((key) => (
                  <SelectItem key={`status-${key}`} value={key}>
                    {statusLabels[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] bg-white border-gray-300">
                <SelectValue placeholder="Loại phòng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {uniqueRoomTypes.map((type) => (
                  <SelectItem key={`type-${type}`} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <AddEditRoomDialog
              roomTypes={roomTypes}
              roomStatuses={roomStatuses}
              onSave={(savedRoom) => {
                if (savedRoom && !savedRoom.image) {
                  savedRoom.image = savedRoom.image || "";
                }

                const status = roomStatuses.find(
                  (s) => s.statusId === savedRoom.status.statusId
                );

                const mappedRoom = {
                  ...mapRoomData(savedRoom),
                  statusName: status?.name || "",
                };

                setRoomsList((prev) =>
                  prev.some((r) => r.roomId === mappedRoom.roomId)
                    ? prev.map((r) =>
                        r.roomId === mappedRoom.roomId ? mappedRoom : r
                      )
                    : [...prev, mappedRoom]
                );
              }}
            />
          </CardContent>
        </Card>

        {/* ROOMS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <Card
              key={room.roomId}
              className="relative overflow-hidden group bg-white"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={`http://localhost:8080/${room.image}`}
                  alt={`Room ${room.roomNumber}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span
                    style={{
                      backgroundColor: "#e5e7eb",
                      color: "#111",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "0.25rem",
                      fontWeight: 500,
                      fontSize: "0.75rem",
                    }}
                  >
                    {room.roomTypeName}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      boxShadow: "0 0 4px rgba(0,0,0,0.3)",
                      backgroundColor: statusColors[room.statusName] || "#ccc",
                    }}
                  />
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-slate-800">
                  Phòng {room.roomNumber}
                </CardTitle>
                <p className="text-lg font-semibold text-gray-800">
                  {room.price?.toLocaleString("vi-VN")}₫ / đêm
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Tầng {room.floor}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {room.maxOccupancy} khách
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-3 w-3" /> {room.bedCount} giường
                  </span>
                </div>
              </CardHeader>

              {/* Badge trạng thái */}
              <CardContent className="flex justify-center pb-2">
                <span
                  style={{
                    backgroundColor: statusColors[room.statusName] || "#ccc",
                    color: "#fff",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                  }}
                >
                  {statusLabels[room.statusName] || room.statusName}
                </span>
              </CardContent>

              {/* Sửa/Xóa */}
              <CardContent className="flex justify-center gap-2 pt-2">
                <AddEditRoomDialog
                  room={room}
                  roomTypes={roomTypes}
                  roomStatuses={roomStatuses}
                  onSave={(savedRoom) => {
                    if (savedRoom && !savedRoom.image) {
                      savedRoom.image = savedRoom.image || "";
                    }

                    const status = roomStatuses.find(
                      (s) => s.statusId === savedRoom.status.statusId
                    );

                    const mappedRoom = {
                      ...mapRoomData(savedRoom),
                      statusName: status?.name || "",
                    };

                    setRoomsList((prev) =>
                      prev.map((r) =>
                        r.roomId === mappedRoom.roomId ? mappedRoom : r
                      )
                    );
                  }}
                  trigger={
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                  }
                />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận xóa phòng</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa phòng {room.roomNumber}? Hành
                        động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteRoom(room.roomId)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}

          {filteredRooms.length === 0 && (
            <Card className="py-12 bg-white border-gray-200">
              <CardContent className="text-center">
                <p className="text-gray-500">Không tìm thấy phòng nào.</p>
                <Button
                  variant="outline"
                  className="mt-4 border-gray-300 hover:bg-gray-100"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                >
                  Xóa Bộ Lọc
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
