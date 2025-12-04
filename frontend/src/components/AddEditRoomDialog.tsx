import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface RoomType {
  roomTypeId: number;
  name: string;
  basePrice: number;
  bedCount: number;
  maxOccupancy: number;
}

interface RoomStatus {
  statusId: number;
  name: string;
}

interface Room {
  roomId?: number;
  roomNumber: string;
  roomType: { roomTypeId: number };
  status: { statusId: number };
  floor: string;
  bedCount: number;
  maxOccupancy: number;
  image: string;
}

interface AddEditRoomDialogProps {
  room?: Room;
  roomTypes: RoomType[];
  roomStatuses: RoomStatus[];
  onSave: (room: Room) => void;
  trigger?: React.ReactNode;
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  "còn trống": ["còn trống", "dọn dẹp", "đang bảo trì"],
  "đã trả phòng": ["đã trả phòng", "còn trống", "dọn dẹp", "đang bảo trì"],
  "đang bảo trì": ["đang bảo trì", "dọn dẹp", "còn trống"],
  "dọn dẹp": ["dọn dẹp", "đang bảo trì", "còn trống"],
  "đã đặt": ["đã đặt"],
  "đã nhận phòng": ["đã nhận phòng"],
  "đã nhận": ["đã nhận"],
};

const LOCKED_STATUS_KEYS = new Set(["đã đặt", "đã nhận phòng", "đã nhận"]);

const normalizeImagePath = (value?: string | null) => {
  if (!value) return "";

  let trimmed = value.trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      trimmed = url.pathname;
    } catch {
      trimmed = trimmed.replace(/^https?:\/\//i, "");
    }
  }

  trimmed = trimmed.replace(/^static\//, "");
  trimmed = trimmed.replace(/^\/+/, "");

  if (trimmed.startsWith("uploads/")) {
    return trimmed;
  }

  const filename = trimmed.split("/").pop() ?? "";
  if (!filename) return "";

  return `uploads/rooms/${filename}`;
};

const sanitizeStatusName = (value?: string | null) => {
  if (!value) return "";
  return value.trim();
};

const statusKey = (value?: string | null) =>
  sanitizeStatusName(value).toLowerCase();
export function AddEditRoomDialog({
  room,
  roomTypes,
  roomStatuses,
  onSave,
  trigger,
}: AddEditRoomDialogProps) {
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState<Room>({
    roomNumber: "",
    roomType: { roomTypeId: 0 },
    status: { statusId: 0 },
    floor: "",
    bedCount: 1,
    maxOccupancy: 1,
    image: "",
  });

  const lockedByStatusId = room ? [2, 7].includes(room.status.statusId) : false;

  const currentStatus = roomStatuses.find(
    (status) => status.statusId === formData.status.statusId
  );
  const currentStatusKey = statusKey(currentStatus?.name);
  const allowedStatusKeys =
    room && currentStatusKey && STATUS_TRANSITIONS[currentStatusKey]
      ? STATUS_TRANSITIONS[currentStatusKey]
      : roomStatuses.map((status) => statusKey(status.name));
  const selectableStatusesRaw = roomStatuses.filter((status) =>
    allowedStatusKeys.includes(statusKey(status.name))
  );
  const selectableStatuses =
    room && selectableStatusesRaw.length > 0
      ? selectableStatusesRaw
      : roomStatuses;
  const statusSelectDisabled =
    (room && LOCKED_STATUS_KEYS.has(currentStatusKey)) || lockedByStatusId;
  const roomTypeSelectDisabled = lockedByStatusId;
  let statusOptions: RoomStatus[] =
    selectableStatuses.length > 0 ? selectableStatuses : roomStatuses;
  if (statusSelectDisabled && currentStatus) {
    statusOptions = [currentStatus];
  }

  // Load dữ liệu khi mở dialog
  useEffect(() => {
    if (!open) return;

    // Xử lý formData cho chế độ edit
    if (room) {
      const normalizedImage = normalizeImagePath(room.image);
      setFormData({
        roomId: room.roomId,
        roomNumber: room.roomNumber,
        roomType: { roomTypeId: room.roomType.roomTypeId },
        status: { statusId: room.status.statusId },
        floor: room.floor,
        bedCount: room.bedCount,
        maxOccupancy: room.maxOccupancy,
        image: normalizedImage,
      });
      return;
    }

    // Mới thêm phòng
    if (roomTypes.length === 0 || roomStatuses.length === 0) {
      return;
    }

    const defaultType = roomTypes[0];
    const preferredStatus =
      roomStatuses.find((status) => status.name === "Còn Trống") ||
      roomStatuses[0];

    setFormData({
      roomNumber: "",
      roomType: { roomTypeId: defaultType.roomTypeId },
      status: { statusId: preferredStatus?.statusId ?? 0 },
      floor: "",
      bedCount: defaultType.bedCount,
      maxOccupancy: defaultType.maxOccupancy,
      image: "uploads/rooms/",
    });
  }, [open, room, roomTypes, roomStatuses]);

  const statusOptionIds = statusOptions
    .map((status) => status.statusId)
    .join(",");

  useEffect(() => {
    if (!open) return;
    if (statusOptions.length === 0) return;

    const statusExists = statusOptions.some(
      (status) => status.statusId === formData.status.statusId
    );

    if (!statusExists) {
      setFormData((prev) => ({
        ...prev,
        status: { statusId: statusOptions[0].statusId },
      }));
    }
  }, [open, statusOptionIds, statusOptions.length, formData.status.statusId]);

  const handleRoomTypeChange = (roomTypeIdStr: string) => {
    if (roomTypeSelectDisabled) return;
    const roomTypeId = parseInt(roomTypeIdStr, 10);
    const selectedType = roomTypes.find((t) => t.roomTypeId === roomTypeId);

    if (selectedType) {
      setFormData((prev) => ({
        ...prev,
        roomType: { roomTypeId },
        bedCount: selectedType.bedCount,
        maxOccupancy: selectedType.maxOccupancy,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.image) {
        toast.error("Vui lòng chọn hình ảnh phòng");
        return;
      }

      const method = room?.roomId ? "PUT" : "POST";
      const url = room?.roomId
        ? `http://localhost:8080/api/rooms/${room.roomId}`
        : "http://localhost:8080/api/rooms";

      const payload = {
        ...formData,
        image: normalizeImagePath(formData.image),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Lỗi khi lưu phòng");

      const json = await res.json();
      onSave({ ...json, image: payload.image });

      toast.success(
        room ? "Cập nhật phòng thành công!" : "Thêm phòng thành công!"
      );
      setOpen(false);
    } catch (err) {
      toast.error("Không thể lưu phòng");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gray-900 hover:bg-gray-800 text-white">
            <Plus className="h-4 w-4 mr-2" /> Thêm Phòng Mới
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {room ? "Chỉnh Sửa Phòng" : "Thêm Phòng Mới"}
          </DialogTitle>
          <DialogDescription>
            {room ? "Cập nhật thông tin phòng" : "Nhập thông tin phòng mới"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Room Number + Floor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Số phòng *</Label>
              <Input
                required
                value={formData.roomNumber}
                onChange={(e) =>
                  setFormData({ ...formData, roomNumber: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Tầng *</Label>
              <Input
                required
                value={formData.floor}
                onChange={(e) =>
                  setFormData({ ...formData, floor: e.target.value })
                }
              />
            </div>
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Loại phòng *</Label>
              <Select
                value={formData.roomType.roomTypeId.toString()}
                onValueChange={handleRoomTypeChange}
                disabled={roomTypeSelectDisabled}
              >
                <SelectTrigger disabled={roomTypeSelectDisabled}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((t) => (
                    <SelectItem
                      key={t.roomTypeId}
                      value={t.roomTypeId.toString()}
                    >
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Trạng thái *</Label>
              <Select
                value={formData.status.statusId.toString()}
                onValueChange={(v) => {
                  if (statusSelectDisabled) return;
                  setFormData((prev) => ({
                    ...prev,
                    status: { statusId: parseInt(v, 10) },
                  }));
                }}
                disabled={statusSelectDisabled}
              >
                <SelectTrigger disabled={statusSelectDisabled}>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem
                      key={status.statusId}
                      value={status.statusId.toString()}
                      disabled={statusSelectDisabled}
                    >
                      {sanitizeStatusName(status.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bed + Occupancy + Price */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Số giường</Label>
              <Input disabled value={formData.bedCount} />
            </div>

            <div>
              <Label>Sức chứa</Label>
              <Input disabled value={formData.maxOccupancy} />
            </div>

            <div>
              <Label>Giá / đêm</Label>
              <Input
                disabled
                value={
                  roomTypes.find(
                    (t) => t.roomTypeId === formData.roomType.roomTypeId
                  )?.basePrice || 0
                }
              />
            </div>
          </div>

          {/* Image Input */}
          <div>
            <Label>Hình ảnh phòng *</Label>
            <Input
              required
              value={formData.image}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, image: e.target.value }))
              }
              placeholder="uploads/rooms/image.jpg"
              className="border-gray-300 focus:border-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ví dụ: uploads/rooms/deluxe-room.jpg
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" className="bg-gray-900 hover:bg-gray-800">
              {room ? "Cập nhật" : "Thêm phòng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
