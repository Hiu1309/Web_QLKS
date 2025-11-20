import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { Plus } from 'lucide-react';

type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning';
type RoomType = 'standard' | 'deluxe' | 'suite' | 'presidential';

interface Room {
  id: string;
  number: string;
  type: RoomType;
  status: RoomStatus;
  guest?: string;
  checkOut?: string;
  price: number;
  floor: number;
  image: string;
  amenities: string[];
  capacity: number;
  size: number;
  view: string;
}

interface AddEditRoomDialogProps {
  room?: Room;
  onSave: (room: Partial<Room>) => void;
  trigger?: React.ReactNode;
}

export function AddEditRoomDialog({ room, onSave, trigger }: AddEditRoomDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    type: 'standard' as RoomType,
    status: 'available' as RoomStatus,
    price: '',
    floor: '',
    capacity: '',
    size: '',
    view: '',
    amenities: '',
    image: 'https://images.unsplash.com/photo-1626868449668-fb47a048d9cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb20lMjBiZWR8ZW58MXx8fHwxNzU5NzEyMjYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  });

  useEffect(() => {
    if (room && open) {
      setFormData({
        number: room.number,
        type: room.type,
        status: room.status,
        price: room.price.toString(),
        floor: room.floor.toString(),
        capacity: room.capacity.toString(),
        size: room.size.toString(),
        view: room.view,
        amenities: room.amenities.join(', '),
        image: room.image,
      });
    } else if (!room && open) {
      setFormData({
        number: '',
        type: 'standard',
        status: 'available',
        price: '',
        floor: '',
        capacity: '',
        size: '',
        view: '',
        amenities: '',
        image: 'https://images.unsplash.com/photo-1626868449668-fb47a048d9cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb20lMjBiZWR8ZW58MXx8fHwxNzU5NzEyMjYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      });
    }
  }, [room, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amenitiesArray = formData.amenities
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    const roomData: Partial<Room> = {
      number: formData.number,
      type: formData.type,
      status: formData.status,
      price: parseInt(formData.price),
      floor: parseInt(formData.floor),
      capacity: parseInt(formData.capacity),
      size: parseInt(formData.size),
      view: formData.view,
      amenities: amenitiesArray,
      image: formData.image,
    };

    if (room) {
      roomData.id = room.id;
    }

    onSave(roomData);
    setOpen(false);
    
    toast.success(
      room ? 'Cập nhật phòng thành công!' : 'Thêm phòng mới thành công!',
      {
        description: `Phòng ${formData.number} đã được ${room ? 'cập nhật' : 'thêm vào hệ thống'}.`
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gray-900 hover:bg-gray-800 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Thêm Phòng Mới
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{room ? 'Chỉnh Sửa Phòng' : 'Thêm Phòng Mới'}</DialogTitle>
          <DialogDescription>
            {room
              ? 'Cập nhật thông tin chi tiết của phòng.'
              : 'Nhập thông tin chi tiết cho phòng mới.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Số Phòng *</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="VD: 101"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Tầng *</Label>
                <Input
                  id="floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="VD: 1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Loại Phòng *</Label>
                <Select value={formData.type} onValueChange={(value: RoomType) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="deluxe">Deluxe</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                    <SelectItem value="presidential">Presidential</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng Thái *</Label>
                <Select value={formData.status} onValueChange={(value: RoomStatus) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Còn Trống</SelectItem>
                    <SelectItem value="occupied">Đang Dùng</SelectItem>
                    <SelectItem value="maintenance">Bảo Trì</SelectItem>
                    <SelectItem value="cleaning">Dọn Dẹp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Giá (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="9800"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Sức Chứa *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="2"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Diện Tích (m²) *</Label>
                <Input
                  id="size"
                  type="number"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="25"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="view">Hướng Nhìn *</Label>
              <Input
                id="view"
                value={formData.view}
                onChange={(e) => setFormData({ ...formData, view: e.target.value })}
                placeholder="VD: City View, Ocean View"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Tiện Nghi *</Label>
              <Textarea
                id="amenities"
                value={formData.amenities}
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                placeholder="Nhập các tiện nghi cách nhau bằng dấu phẩy. VD: Wifi, TV, Mini Bar, Balcony"
                required
                rows={3}
              />
              <p className="text-xs text-gray-500">Các tiện nghi phân cách bằng dấu phẩy</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL Hình Ảnh</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
              />
              <p className="text-xs text-gray-500">Link hình ảnh của phòng</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" className="bg-gray-900 hover:bg-gray-800">
              {room ? 'Cập Nhật' : 'Thêm Phòng'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
