import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
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
} from './ui/alert-dialog';
import { Label } from './ui/label';
import { BookingDialog } from './BookingDialog';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type ReservationStatus = 'checked-in' | 'checked-out';

interface Reservation {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalAmount: number;
  status: ReservationStatus;
  bookingDate: string;
}

// Mock reservation data
const reservations: Reservation[] = [
  {
    id: 'RES001',
    guestName: 'Raj Kumar Sharma',
    email: 'raj.sharma@email.com',
    phone: '+91 98765 43210',
    roomNumber: '102',
    roomType: 'Standard',
    checkIn: '2024-12-20',
    checkOut: '2024-12-22',
    nights: 2,
    guests: 2,
    totalAmount: 19600,
    status: 'checked-in',
    bookingDate: '2024-12-15'
  },
  {
    id: 'RES002',
    guestName: 'Priya Patel',
    email: 'priya.patel@email.com',
    phone: '+91 87654 32109',
    roomNumber: '202',
    roomType: 'Suite',
    checkIn: '2024-12-21',
    checkOut: '2024-12-24',
    nights: 3,
    guests: 1,
    totalAmount: 73500,
    status: 'checked-in',
    bookingDate: '2024-12-18'
  },
  {
    id: 'RES003',
    guestName: 'Arjun Gupta',
    email: 'arjun.gupta@email.com',
    phone: '+91 76543 21098',
    roomNumber: '105',
    roomType: 'Deluxe',
    checkIn: '2024-12-19',
    checkOut: '2024-12-21',
    nights: 2,
    guests: 3,
    totalAmount: 29440,
    status: 'checked-out',
    bookingDate: '2024-12-10'
  },
  {
    id: 'RES004',
    guestName: 'Ananya Iyer',
    email: 'ananya.iyer@email.com',
    phone: '+91 65432 10987',
    roomNumber: '301',
    roomType: 'Suite',
    checkIn: '2024-12-23',
    checkOut: '2024-12-26',
    nights: 3,
    guests: 2,
    totalAmount: 73500,
    status: 'checked-in',
    bookingDate: '2024-12-19'
  },
  {
    id: 'RES005',
    guestName: 'Vikram Singh',
    email: 'vikram.singh@email.com',
    phone: '+91 54321 09876',
    roomNumber: '104',
    roomType: 'Deluxe',
    checkIn: '2024-12-22',
    checkOut: '2024-12-25',
    nights: 3,
    guests: 2,
    totalAmount: 44160,
    status: 'checked-in',
    bookingDate: '2024-12-17'
  },
  {
    id: 'RES006',
    guestName: 'Kavya Reddy',
    email: 'kavya.reddy@email.com',
    phone: '+91 43210 98765',
    roomNumber: '302',
    roomType: 'Presidential',
    checkIn: '2024-12-25',
    checkOut: '2024-12-28',
    nights: 3,
    guests: 4,
    totalAmount: 122700,
    status: 'checked-in',
    bookingDate: '2024-12-20'
  }
];

const statusColors = {
  'checked-in': 'bg-green-100 text-green-800',
  'checked-out': 'bg-gray-100 text-gray-800'
};

export function ReservationManagement() {
  const [reservationsList, setReservationsList] = useState(reservations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const handleCheckout = (reservationId: string) => {
    setReservationsList(reservationsList.map(res => 
      res.id === reservationId ? { ...res, status: 'checked-out' as ReservationStatus } : res
    ));
    toast.success('Trả phòng thành công!');
  };

  const handleDelete = (reservationId: string) => {
    setReservationsList(reservationsList.filter(res => res.id !== reservationId));
    toast.success('Đã xóa đặt phòng!');
  };

  const filteredReservations = reservationsList.filter(reservation => {
    const matchesSearch = reservation.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-700">Đặt Phòng</h1>
          <p className="text-slate-600">Quản lý tất cả đặt phòng khách sạn</p>
        </div>
        <BookingDialog 
          trigger={
            <Button className="bg-gray-700 hover:bg-gray-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Đặt Phòng Mới
            </Button>
          }
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm theo tên khách, email hoặc mã đặt phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-slate-200"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white border-slate-200">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất Cả Trạng Thái</SelectItem>
            <SelectItem value="checked-in">Đã Nhận Phòng</SelectItem>
            <SelectItem value="checked-out">Đã Trả Phòng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reservations Table */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-700">Đặt Phòng Gần Đây</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-600">Mã Đặt Phòng</TableHead>
                <TableHead className="text-slate-600">Khách Hàng</TableHead>
                <TableHead className="text-slate-600">Phòng</TableHead>
                <TableHead className="text-slate-600">Nhận Phòng</TableHead>
                <TableHead className="text-slate-600">Trả Phòng</TableHead>
                <TableHead className="text-slate-600">Đêm</TableHead>
                <TableHead className="text-slate-600">Trạng Thái</TableHead>
                <TableHead className="text-slate-600">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-700">{reservation.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-700">{reservation.guestName}</p>
                      <p className="text-sm text-slate-500">{reservation.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-700">#{reservation.roomNumber}</p>
                      <p className="text-sm text-slate-500">{reservation.roomType}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{reservation.checkIn}</TableCell>
                  <TableCell className="text-slate-600">{reservation.checkOut}</TableCell>
                  <TableCell className="text-slate-600">{reservation.nights}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[reservation.status]}>
                      {reservation.status === 'checked-in' ? 'Đã Nhận Phòng' :
                       reservation.status === 'checked-out' ? 'Đã Trả Phòng' :
                       ''}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedReservation(reservation)}
                            className="border-slate-300 hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-white">
                          <DialogHeader>
                            <DialogTitle className="text-slate-700">Chi Tiết Đặt Phòng</DialogTitle>
                          </DialogHeader>
                          {selectedReservation && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <Label className="text-slate-600">Mã Đặt Phòng</Label>
                                  <p className="font-medium text-slate-700">{selectedReservation.id}</p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">Trạng Thái</Label>
                                  <Badge className={`mt-1 ${statusColors[selectedReservation.status]}`}>
                                    {selectedReservation.status === 'checked-in' ? 'Đã Nhận Phòng' :
                                     selectedReservation.status === 'checked-out' ? 'Đã Trả Phòng' :
                                     ''}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-slate-600">Khách Hàng</Label>
                                  <p className="font-medium text-slate-700">{selectedReservation.guestName}</p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">Điện Thoại</Label>
                                  <p className="font-medium text-slate-700">{selectedReservation.phone}</p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">Phòng</Label>
                                  <p className="font-medium text-slate-700">#{selectedReservation.roomNumber} ({selectedReservation.roomType})</p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">Số Khách</Label>
                                  <p className="font-medium text-slate-700">{selectedReservation.guests}</p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">Nhận Phòng</Label>
                                  <p className="font-medium text-slate-700">{selectedReservation.checkIn}</p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">Trả Phòng</Label>
                                  <p className="font-medium text-slate-700">{selectedReservation.checkOut}</p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">Thời Gian</Label>
                                  <p className="font-medium text-slate-700">{selectedReservation.nights} đêm</p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">Tổng Tiền</Label>
                                  <p className="font-medium text-emerald-600">₹{selectedReservation.totalAmount.toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 pt-4">
                                {selectedReservation.status === 'checked-in' && (
                                  <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleCheckout(selectedReservation.id)}>Trả Phòng</Button>
                                )}
                                <Button size="sm" variant="outline" className="flex-1 border-slate-300" onClick={() => handleDelete(selectedReservation.id)}>Xóa</Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" className="border-slate-300 hover:bg-slate-50">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredReservations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-500">Không tìm thấy đặt phòng nào phù hợp với tiêu chí của bạn.</p>
        </div>
      )}
    </div>
  );
}