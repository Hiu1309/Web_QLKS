import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Textarea } from './ui/textarea';
import { CalendarIcon, Users, Bed, CreditCard } from 'lucide-react';
import { format } from 'date-fns@3.6.0';

interface BookingDialogProps {
  trigger?: React.ReactNode;
  roomNumber?: string;
  roomType?: string;
  roomPrice?: number;
}

export function BookingDialog({ trigger, roomNumber, roomType, roomPrice }: BookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestId: '',
    numberOfGuests: '1',
    roomNumber: roomNumber || '',
    roomType: roomType || 'standard',
    specialRequests: '',
    paymentMethod: 'credit-card'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking submitted:', {
      ...formData,
      checkInDate,
      checkOutDate,
      totalPrice: calculateTotal()
    });
    setOpen(false);
  };

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate || !roomPrice) return 0;
    const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    return days * roomPrice;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gray-700 hover:bg-gray-800 text-white">
            Đặt Phòng
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-800">Đặt Phòng Mới</DialogTitle>
          <DialogDescription className="text-gray-600">
            Điền thông tin để đặt phòng tại khách sạn HHA
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Guest Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Thông Tin Khách Hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guestName">Họ và Tên *</Label>
                <Input
                  id="guestName"
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  required
                  className="border-gray-300 focus:border-gray-500"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <Label htmlFor="guestEmail">Email *</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={formData.guestEmail}
                  onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                  required
                  className="border-gray-300 focus:border-gray-500"
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <Label htmlFor="guestPhone">Số Điện Thoại *</Label>
                <Input
                  id="guestPhone"
                  type="tel"
                  value={formData.guestPhone}
                  onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                  required
                  className="border-gray-300 focus:border-gray-500"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <Label htmlFor="guestId">CMND/CCCD *</Label>
                <Input
                  id="guestId"
                  value={formData.guestId}
                  onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
                  required
                  className="border-gray-300 focus:border-gray-500"
                  placeholder="001234567890"
                />
              </div>
            </div>
          </div>

          {/* Room & Date Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Thông Tin Phòng & Thời Gian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roomType">Loại Phòng *</Label>
                <Select value={formData.roomType} onValueChange={(value) => setFormData({ ...formData, roomType: value })}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Chọn loại phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (₹9,800/đêm)</SelectItem>
                    <SelectItem value="deluxe">Deluxe (₹14,720/đêm)</SelectItem>
                    <SelectItem value="suite">Suite (₹24,500/đêm)</SelectItem>
                    <SelectItem value="presidential">Presidential (₹40,900/đêm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="roomNumber">Số Phòng (tùy chọn)</Label>
                <Input
                  id="roomNumber"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="border-gray-300 focus:border-gray-500"
                  placeholder="Để trống để tự động chọn"
                />
              </div>
              <div>
                <Label>Ngày Nhận Phòng *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left border-gray-300 hover:bg-gray-50"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkInDate ? format(checkInDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar
                      mode="single"
                      selected={checkInDate}
                      onSelect={setCheckInDate}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Ngày Trả Phòng *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left border-gray-300 hover:bg-gray-50"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {checkOutDate ? format(checkOutDate, 'dd/MM/yyyy') : 'Chọn ngày'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar
                      mode="single"
                      selected={checkOutDate}
                      onSelect={setCheckOutDate}
                      disabled={(date) => !checkInDate || date <= checkInDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="numberOfGuests">Số Lượng Khách *</Label>
                <Select value={formData.numberOfGuests} onValueChange={(value) => setFormData({ ...formData, numberOfGuests: value })}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 người</SelectItem>
                    <SelectItem value="2">2 người</SelectItem>
                    <SelectItem value="3">3 người</SelectItem>
                    <SelectItem value="4">4 người</SelectItem>
                    <SelectItem value="5">5+ người</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Payment & Special Requests */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Thanh Toán & Yêu Cầu Đặc Biệt
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="paymentMethod">Phương Thức Thanh Toán *</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit-card">Thẻ Tín Dụng</SelectItem>
                    <SelectItem value="debit-card">Thẻ Ghi Nợ</SelectItem>
                    <SelectItem value="cash">Tiền Mặt</SelectItem>
                    <SelectItem value="bank-transfer">Chuyển Khoản</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="specialRequests">Yêu Cầu Đặc Biệt (tùy chọn)</Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="border-gray-300 focus:border-gray-500 h-20"
                  placeholder="Ví dụ: Tầng cao, giường đôi, gần thang máy..."
                />
              </div>
            </div>
          </div>

          {/* Total Price */}
          {checkInDate && checkOutDate && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Số đêm:</span>
                <span className="font-semibold text-gray-800">
                  {Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))} đêm
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-300">
                <span className="text-gray-800">Tổng Tiền:</span>
                <span className="text-2xl font-bold text-gray-800">
                  ₹{calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-gray-300 hover:bg-gray-100"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gray-700 hover:bg-gray-800 text-white"
            >
              Xác Nhận Đặt Phòng
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
