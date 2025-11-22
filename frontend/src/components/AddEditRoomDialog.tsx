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

  const [images, setImages] = useState<string[]>([]);

  // 🔥 Load images từ folder uploads/rooms
  useEffect(() => {
    if (open) {
      fetch("http://localhost:8080/api/uploads/images")
        .then((res) => res.json())
        .then((data: string[]) => setImages(data))
        .catch((err) => console.error("Cannot fetch images:", err));
    }
  }, [open]);

  // 🔥 Load dữ liệu khi mở dialog
  useEffect(() => {
    if (open) {
      if (room) {
        setFormData({
          roomId: room.roomId,
          roomNumber: room.roomNumber,
          roomType: { roomTypeId: room.roomType.roomTypeId },
          status: { statusId: room.status.statusId },
          floor: room.floor,
          bedCount: room.bedCount,
          maxOccupancy: room.maxOccupancy,
          image: room.image.trim(), // FIX newline từ DB
        });
      } else if (roomTypes.length > 0 && roomStatuses.length > 0) {
        const defaultType = roomTypes[0];
        const defaultStatus = roomStatuses[0];

        setFormData({
          roomNumber: "",
          roomType: { roomTypeId: defaultType.roomTypeId },
          status: { statusId: defaultStatus.statusId },
          floor: "",
          bedCount: defaultType.bedCount,
          maxOccupancy: defaultType.maxOccupancy,
          image: "",
        });
      }
    }
  }, [open, room, roomTypes, roomStatuses]);

  const handleRoomTypeChange = (roomTypeIdStr: string) => {
    const roomTypeId = parseInt(roomTypeIdStr);
    const selectedType = roomTypes.find((t) => t.roomTypeId === roomTypeId);

    if (selectedType) {
      setFormData({
        ...formData,
        roomType: { roomTypeId },
        bedCount: selectedType.bedCount,
        maxOccupancy: selectedType.maxOccupancy,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = room?.roomId ? "PUT" : "POST";
      const url = room?.roomId
        ? `http://localhost:8080/api/rooms/${room.roomId}`
        : "http://localhost:8080/api/rooms";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Lỗi khi lưu phòng");

      const json = await res.json();
      onSave(json);

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
              >
                <SelectTrigger>
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
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    status: { statusId: parseInt(v) },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roomStatuses.map((s) => (
                    <SelectItem key={s.statusId} value={s.statusId.toString()}>
                      {s.name}
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

          {/* Image Selector */}
          <div>
            <Label>Hình ảnh phòng *</Label>
            <Select
              value={formData.image}
              onValueChange={(value) =>
                setFormData({ ...formData, image: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {images.map((img) => (
                  <SelectItem key={img} value={`uploads/rooms/${img}`}>
                    {img}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {formData.image && (
              <img
                src={`http://localhost:8080/${formData.image}`}
                alt="Preview"
                className="mt-2 h-24 w-24 object-cover border"
              />
            )}
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
