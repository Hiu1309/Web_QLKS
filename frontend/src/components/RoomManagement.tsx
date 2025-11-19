import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Search, Filter, Bed, Users, Wifi, Car, Bath, Mountain, Star, MapPin } from 'lucide-react';
import { BookingDialog } from './BookingDialog';

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

// Mock room data with images
const rooms: Room[] = [
  { 
    id: '1', 
    number: '101', 
    type: 'standard', 
    status: 'available', 
    price: 9800, 
    floor: 1,
    image: 'https://images.unsplash.com/photo-1626868449668-fb47a048d9cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb20lMjBiZWR8ZW58MXx8fHwxNzU5NzEyMjYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['Wifi', 'TV', 'Air Conditioning', 'Breakfast', 'Room Service'],
    capacity: 2,
    size: 25,
    view: 'City View'
  },
  { 
    id: '2', 
    number: '102', 
    type: 'standard', 
    status: 'occupied', 
    guest: 'Raj Kumar Sharma', 
    checkOut: '2024-12-22', 
    price: 9800, 
    floor: 1,
    image: 'https://images.unsplash.com/photo-1626868449668-fb47a048d9cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb20lMjBiZWR8ZW58MXx8fHwxNzU5NzEyMjYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['Wifi', 'TV', 'Air Conditioning', 'Breakfast', 'Laundry'],
    capacity: 2,
    size: 25,
    view: 'Garden View'
  },
  { 
    id: '3', 
    number: '103', 
    type: 'deluxe', 
    status: 'cleaning', 
    price: 14720, 
    floor: 1,
    image: 'https://images.unsplash.com/photo-1759264244746-140bbbc54e1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGRlbHV4ZSUyMHJvb20lMjBtb2Rlcm58ZW58MXx8fHwxNzU5NzU4OTM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['Wifi', 'TV', 'Mini Bar', 'Spa Services', 'Breakfast Buffet', 'Gym Access'],
    capacity: 3,
    size: 35,
    view: 'Spa View'
  },
  { 
    id: '4', 
    number: '201', 
    type: 'deluxe', 
    status: 'available', 
    price: 14720, 
    floor: 2,
    image: 'https://images.unsplash.com/photo-1759264244746-140bbbc54e1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGRlbHV4ZSUyMHJvb20lMjBtb2Rlcm58ZW58MXx8fHwxNzU5NzU4OTM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['Wifi', 'TV', 'Mini Bar', 'Balcony', 'Breakfast', 'Airport Pickup'],
    capacity: 3,
    size: 35,
    view: 'Restaurant View'
  },
  { 
    id: '5', 
    number: '202', 
    type: 'suite', 
    status: 'occupied', 
    guest: 'Priya Patel', 
    checkOut: '2024-12-21', 
    price: 24500, 
    floor: 2,
    image: 'https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHN1aXRlfGVufDF8fHx8MTc1OTgxMTIxOXww&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['Wifi', 'TV', 'Mini Bar', 'Jacuzzi', 'Pool Access', 'Spa Services', 'Butler Service'],
    capacity: 4,
    size: 50,
    view: 'Pool View'
  },
  { 
    id: '6', 
    number: '203', 
    type: 'standard', 
    status: 'maintenance', 
    price: 9800, 
    floor: 2,
    image: 'https://images.unsplash.com/photo-1626868449668-fb47a048d9cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb20lMjBiZWR8ZW58MXx8fHwxNzU5NzEyMjYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['Wifi', 'TV', 'Air Conditioning', 'Breakfast', 'Housekeeping'],
    capacity: 2,
    size: 25,
    view: 'City View'
  },
  { 
    id: '7', 
    number: '301', 
    type: 'suite', 
    status: 'available', 
    price: 24500, 
    floor: 3,
    image: 'https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHN1aXRlfGVufDF8fHx8MTc1OTgxMTIxOXww&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['Wifi', 'TV', 'Mini Bar', 'Jacuzzi', 'Concierge', 'Yoga Sessions', 'Fine Dining'],
    capacity: 4,
    size: 50,
    view: 'City Panoramic'
  },
  { 
    id: '8', 
    number: '302', 
    type: 'presidential', 
    status: 'available', 
    price: 40900, 
    floor: 3,
    image: 'https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHN1aXRlfGVufDF8fHx8MTc1OTgxMTIxOXww&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['Wifi', 'TV', 'Mini Bar', 'Jacuzzi', 'Private Butler', 'Terrace', 'Pool Access', 'Spa Services', 'Helicopter Transfer'],
    capacity: 6,
    size: 100,
    view: 'Panoramic City & Ocean'
  },
  { 
    id: '9', 
    number: '104', 
    type: 'deluxe', 
    status: 'available', 
    price: 14720, 
    floor: 1,
    image: 'https://images.unsplash.com/photo-1547064663-a07e03f25fca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHN3aW1taW5nJTIwcG9vbCUyMGx1eHVyeXxlbnwxfHx8fDE3NTk4MTEyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['Wifi', 'TV', 'Mini Bar', 'Pool Access', 'Breakfast Buffet', 'Fitness Center'],
    capacity: 3,
    size: 35,
    view: 'Pool & Garden View'
  },
  { 
    id: '10', 
    number: '105', 
    type: 'standard', 
    status: 'occupied', 
    guest: 'Arjun Gupta', 
    checkOut: '2024-12-23', 
    price: 9800, 
    floor: 1,
    image: 'https://images.unsplash.com/photo-1722477936580-84aa10762b0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGJyZWFrZmFzdCUyMGJ1ZmZldHxlbnwxfHx8fDE3NTk4MTEyMTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    amenities: ['Wifi', 'TV', 'Air Conditioning', 'Breakfast Buffet', 'Business Center'],
    capacity: 2,
    size: 25,
    view: 'Breakfast Area View'
  }
];

const statusColors = {
  available: 'bg-gray-600',
  occupied: 'bg-gray-800',
  maintenance: 'bg-gray-500',
  cleaning: 'bg-gray-700'
};

const statusLabels = {
  available: 'Còn Trống',
  occupied: 'Đang Dùng',
  maintenance: 'Bảo Trì',
  cleaning: 'Dọn Dẹp'
};

const typeColors = {
  standard: 'bg-gray-100 text-gray-700 border border-gray-300',
  deluxe: 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 border border-gray-400',
  suite: 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900 border border-gray-500',
  presidential: 'bg-gradient-to-br from-gray-700 to-gray-800 text-white border border-gray-600'
};

export function RoomManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.guest?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesType = typeFilter === 'all' || room.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1677129666186-d29eba893fe3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGNvbmNpZXJnZSUyMHNlcnZpY2V8ZW58MXx8fHwxNzU3OTU4NzE4fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Hotel service"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-800/50 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 via-white to-gray-400"></div>
        <div className="absolute inset-0 flex items-center justify-start p-6 animate-fadeIn">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">Quản lý phòng</h1>
            <p className="text-xl opacity-90 text-white/80">Giám sát và quản lý tất cả các phòng khách sạn HHA</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1">
                <Bed className="h-5 w-5" />
                <span className="font-semibold">{rooms.length}</span>
                <span className="text-sm opacity-80">Tổng Phòng</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-5 w-5" />
                <span className="font-semibold">{rooms.filter(r => r.status === 'available').length}</span>
                <span className="text-sm opacity-80">Còn Trống</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 -mt-16 relative z-10">
        {/* Filters */}
        <Card className="shadow-sm bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo số phòng hoặc tên khách..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-gray-500 bg-white"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-white border-gray-300">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất Cả Trạng Thái</SelectItem>
                  <SelectItem value="available">Còn Trống</SelectItem>
                  <SelectItem value="occupied">Đang Dùng</SelectItem>
                  <SelectItem value="maintenance">Bảo Trì</SelectItem>
                  <SelectItem value="cleaning">Dọn Dẹp</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] bg-white border-gray-300">
                  <SelectValue placeholder="Lọc theo loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất Cả Loại</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="deluxe">Deluxe</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                  <SelectItem value="presidential">Presidential</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group bg-white">
              {/* Room Image */}
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={room.image}
                  alt={`Room ${room.number}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <Badge className={`${typeColors[room.type]} border-0`}>
                    {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <div className={`w-3 h-3 rounded-full ${statusColors[room.status]} shadow-lg`}></div>
                </div>
                {room.status === 'available' && (
                  <div className="absolute bottom-3 right-3">
                    <Badge className="bg-gray-600 text-white hover:bg-gray-700">
                      Còn Trống
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-800">Phòng {room.number}</CardTitle>
                  <div className="text-right">
                    <div className="text-slate-800">₹{room.price.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">mỗi đêm</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Tầng {room.floor}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {room.capacity} khách
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-3 w-3" />
                    {room.size}m²
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">{room.view}</p>
                  <div className="flex flex-wrap gap-1">
                    {room.amenities.slice(0, 3).map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {room.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{room.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                {room.guest && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-800">{room.guest}</p>
                    <p className="text-sm text-blue-600">Check-out: {room.checkOut}</p>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  {room.status === 'available' && (
                    <BookingDialog 
                      roomNumber={room.number}
                      roomType={room.type}
                      roomPrice={room.price}
                      trigger={
                        <Button size="sm" className="flex-1 bg-gray-700 hover:bg-gray-800 text-white">
                          Đặt Ngay
                        </Button>
                      }
                    />
                  )}
                  {room.status === 'occupied' && (
                    <Button size="sm" variant="outline" className="flex-1 border-gray-400 text-gray-700 hover:bg-gray-100">
                      Trả Phòng
                    </Button>
                  )}
                  {room.status === 'cleaning' && (
                    <Button size="sm" variant="outline" className="flex-1 border-gray-400 text-gray-700 hover:bg-gray-100">
                      Đã Dọn
                    </Button>
                  )}
                  {room.status === 'maintenance' && (
                    <Button size="sm" variant="outline" className="flex-1 border-gray-400 text-gray-700 hover:bg-gray-100">
                      Đã Sửa
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="px-3 hover:bg-gray-100">
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <Card className="py-12 bg-white border-gray-200">
            <CardContent className="text-center">
              <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không tìm thấy phòng nào phù hợp với tiêu chí của bạn.</p>
              <Button variant="outline" className="mt-4 border-gray-300 hover:bg-gray-100" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}>
                Xóa Bộ Lọc
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}