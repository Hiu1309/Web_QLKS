import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarInitials } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Search, Plus, Eye, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { AddGuestDialog } from './AddGuestDialog';

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  totalStays: number;
  totalSpent: number;
  lastVisit: string;
  memberSince: string;
  vipStatus: 'none' | 'silver' | 'gold' | 'platinum';
  preferences: string[];
}

// Mock guest data
const guests: Guest[] = [
  {
    id: 'G001',
    name: 'Raj Kumar Sharma',
    email: 'raj.sharma@email.com',
    phone: '+91 98765 43210',
    address: '15/A, Sector 7, Koramangala',
    city: 'Bangalore',
    country: 'India',
    totalStays: 8,
    totalSpent: 196000,
    lastVisit: '2024-12-20',
    memberSince: '2022-03-15',
    vipStatus: 'gold',
    preferences: ['Non-smoking', 'High floor', 'King bed', 'Breakfast included']
  },
  {
    id: 'G002',
    name: 'Priya Patel',
    email: 'priya.patel@email.com',
    phone: '+91 87654 32109',
    address: '42, Bandra West, Linking Road',
    city: 'Mumbai',
    country: 'India',
    totalStays: 15,
    totalSpent: 367500,
    lastVisit: '2024-12-18',
    memberSince: '2021-07-22',
    vipStatus: 'platinum',
    preferences: ['Ocean view', 'Late checkout', 'Spa access', 'Pool access', 'Yoga sessions']
  },
  {
    id: 'G003',
    name: 'Arjun Gupta',
    email: 'arjun.gupta@email.com',
    phone: '+91 76543 21098',
    address: '28, CP Block, Rajouri Garden',
    city: 'New Delhi',
    country: 'India',
    totalStays: 3,
    totalSpent: 58800,
    lastVisit: '2024-12-19',
    memberSince: '2023-11-08',
    vipStatus: 'silver',
    preferences: ['Business center access', 'Early checkin', 'Breakfast buffet']
  },
  {
    id: 'G004',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@email.com',
    phone: '+91 65432 10987',
    address: '67, T. Nagar, Cathedral Road',
    city: 'Chennai',
    country: 'India',
    totalStays: 1,
    totalSpent: 36750,
    lastVisit: '2024-12-23',
    memberSince: '2024-12-01',
    vipStatus: 'none',
    preferences: ['Pool access', 'Spa services', 'Vegetarian meals']
  },
  {
    id: 'G005',
    name: 'Vikram Singh',
    email: 'vikram.singh@email.com',
    phone: '+91 54321 09876',
    address: '89, Satellite, S.G. Highway',
    city: 'Ahmedabad',
    country: 'India',
    totalStays: 6,
    totalSpent: 147000,
    lastVisit: '2024-12-21',
    memberSince: '2023-08-12',
    vipStatus: 'gold',
    preferences: ['Gym access', 'Room service', 'Continental breakfast', 'Airport pickup']
  },
  {
    id: 'G006',
    name: 'Kavya Reddy',
    email: 'kavya.reddy@email.com',
    phone: '+91 43210 98765',
    address: '123, Banjara Hills, Road No. 12',
    city: 'Hyderabad',
    country: 'India',
    totalStays: 4,
    totalSpent: 98000,
    lastVisit: '2024-12-19',
    memberSince: '2023-01-25',
    vipStatus: 'silver',
    preferences: ['Balcony view', 'Traditional Indian breakfast', 'Late checkout', 'Concierge service']
  }
];

const vipColors = {
  none: 'bg-gray-100 text-gray-800',
  silver: 'bg-gray-100 text-gray-800',
  gold: 'bg-yellow-100 text-yellow-800',
  platinum: 'bg-purple-100 text-purple-800'
};

export function GuestManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.phone.includes(searchTerm);
    
    return matchesSearch;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-800">Quản Lý Khách Hàng</h1>
          <p className="text-gray-600">Quản lý hồ sơ và sở thích của khách</p>
        </div>
        <AddGuestDialog />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Tìm kiếm khách theo tên, email hoặc số điện thoại..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white border-slate-200"
        />
      </div>

      {/* Guest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGuests.map((guest) => (
          <Card key={guest.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="bg-slate-200">
                    <AvatarFallback className="text-slate-700">{getInitials(guest.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg text-slate-700">{guest.name}</CardTitle>
                    <p className="text-sm text-slate-500">ID: {guest.id}</p>
                  </div>
                </div>
                <Badge className={vipColors[guest.vipStatus]}>
                  {guest.vipStatus === 'none' ? 'Thường' :
                   guest.vipStatus === 'silver' ? 'BẠC' :
                   guest.vipStatus === 'gold' ? 'VÀNG' :
                   'BẠCH KIM'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="truncate text-slate-600">{guest.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{guest.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">{guest.city}, {guest.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">Lần cuối: {guest.lastVisit}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-t border-slate-200">
                <div className="text-center">
                  <p className="text-sm text-slate-500">Tổng Lưu Trú</p>
                  <p className="font-semibold text-slate-700">{guest.totalStays}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-500">Tổng Chi Tiêu</p>
                  <p className="font-semibold text-emerald-600">₹{guest.totalSpent.toLocaleString()}</p>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-300 hover:bg-slate-50"
                    onClick={() => setSelectedGuest(guest)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Xem Chi Tiết
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-white">
                  <DialogHeader>
                    <DialogTitle className="text-slate-700">Hồ Sơ Khách Hàng</DialogTitle>
                  </DialogHeader>
                  {selectedGuest && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 bg-slate-200">
                          <AvatarFallback className="text-slate-700">
                            {getInitials(selectedGuest.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-slate-700">{selectedGuest.name}</h3>
                          <p className="text-slate-500">ID Khách: {selectedGuest.id}</p>
                          <Badge className={`mt-1 ${vipColors[selectedGuest.vipStatus]}`}>
                            {selectedGuest.vipStatus === 'none' ? 'Thường' :
                             selectedGuest.vipStatus === 'silver' ? 'BẠC' :
                             selectedGuest.vipStatus === 'gold' ? 'VÀNG' :
                             'BẠCH KIM'}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-slate-600">Thông Tin Liên Hệ</Label>
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-slate-400" />
                                <span className="text-sm text-slate-600">{selectedGuest.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-slate-400" />
                                <span className="text-sm text-slate-600">{selectedGuest.phone}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="text-slate-600">Địa Chỉ</Label>
                            <div className="mt-2">
                              <p className="text-sm text-slate-600">{selectedGuest.address}</p>
                              <p className="text-sm text-slate-600">{selectedGuest.city}, {selectedGuest.country}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-slate-600">Thống Kê Khách Hàng</Label>
                            <div className="mt-2 space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-slate-600">Tổng Lưu Trú:</span>
                                <span className="text-sm font-medium text-slate-700">{selectedGuest.totalStays}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-slate-600">Tổng Chi Tiêu:</span>
                                <span className="text-sm font-medium text-emerald-600">₹{selectedGuest.totalSpent.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-slate-600">Thành Viên Từ:</span>
                                <span className="text-sm font-medium text-slate-700">{selectedGuest.memberSince}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-slate-600">Lần Cuối:</span>
                                <span className="text-sm font-medium text-slate-700">{selectedGuest.lastVisit}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-slate-600">Sở Thích</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedGuest.preferences.map((preference, index) => (
                            <Badge key={index} variant="outline" className="border-slate-300 text-slate-600">
                              {preference}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">Chỉnh Sửa Hồ Sơ</Button>
                        <Button variant="outline" className="flex-1 border-slate-300">Xem Đặt Phòng</Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGuests.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-500">Không tìm thấy khách hàng nào phù hợp với tiêu chí tìm kiếm.</p>
        </div>
      )}
    </div>
  );
}