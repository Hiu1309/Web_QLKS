import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, UserPlus, Mail, Phone, MapPin, CreditCard, Flag } from 'lucide-react';
import { format } from 'date-fns@3.6.0';

interface AddGuestDialogProps {
  trigger?: React.ReactNode;
}

export function AddGuestDialog({ trigger }: AddGuestDialogProps) {
  const [open, setOpen] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idType: 'passport',
    idNumber: '',
    nationality: 'India',
    gender: 'male',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    vipStatus: 'regular',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Guest added:', {
      ...formData,
      dateOfBirth
    });
    setOpen(false);
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      idType: 'passport',
      idNumber: '',
      nationality: 'India',
      gender: 'male',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      vipStatus: 'regular',
      notes: ''
    });
    setDateOfBirth(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gray-700 hover:bg-gray-800 text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm Khách Hàng
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-800">Thêm Khách Hàng Mới</DialogTitle>
          <DialogDescription className="text-gray-600">
            Nhập thông tin chi tiết của khách hàng để thêm vào hệ thống
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Thông Tin Cá Nhân
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="firstName">Tên *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="border-gray-300 focus:border-gray-500"
                  placeholder="Văn A"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Họ *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="border-gray-300 focus:border-gray-500"
                  placeholder="Nguyễn"
                />
              </div>
              <div>
                <Label htmlFor="gender">Giới Tính *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ngày Sinh *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left border-gray-300 hover:bg-gray-50"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateOfBirth ? format(dateOfBirth, 'dd/MM/yyyy') : 'Chọn ngày sinh'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white" align="start">
                    <Calendar
                      mode="single"
                      selected={dateOfBirth}
                      onSelect={setDateOfBirth}
                      disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                      captionLayout="dropdown-buttons"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="nationality">Quốc Tịch *</Label>
                <Select value={formData.nationality} onValueChange={(value) => setFormData({ ...formData, nationality: value })}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">Ấn Độ</SelectItem>
                    <SelectItem value="Vietnam">Việt Nam</SelectItem>
                    <SelectItem value="USA">Hoa Kỳ</SelectItem>
                    <SelectItem value="UK">Anh</SelectItem>
                    <SelectItem value="China">Trung Quốc</SelectItem>
                    <SelectItem value="Japan">Nhật Bản</SelectItem>
                    <SelectItem value="Other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Thông Tin Liên Hệ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="pl-10 border-gray-300 focus:border-gray-500"
                    placeholder="example@email.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Số Điện Thoại *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="pl-10 border-gray-300 focus:border-gray-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Identification */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Giấy Tờ Tùy Thân
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="idType">Loại Giấy Tờ *</Label>
                <Select value={formData.idType} onValueChange={(value) => setFormData({ ...formData, idType: value })}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">Hộ Chiếu</SelectItem>
                    <SelectItem value="national-id">CMND/CCCD</SelectItem>
                    <SelectItem value="driving-license">Bằng Lái Xe</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="idNumber">Số Giấy Tờ *</Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  required
                  className="border-gray-300 focus:border-gray-500"
                  placeholder="001234567890"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Địa Chỉ
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="address">Địa Chỉ *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="border-gray-300 focus:border-gray-500"
                  placeholder="123 Đường ABC"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">Thành Phố *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="border-gray-300 focus:border-gray-500"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <Label htmlFor="state">Bang/Tỉnh *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                    className="border-gray-300 focus:border-gray-500"
                    placeholder="Maharashtra"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Mã Bưu Điện *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    required
                    className="border-gray-300 focus:border-gray-500"
                    placeholder="400001"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="country">Quốc Gia *</Label>
                <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">Ấn Độ</SelectItem>
                    <SelectItem value="Vietnam">Việt Nam</SelectItem>
                    <SelectItem value="USA">Hoa Kỳ</SelectItem>
                    <SelectItem value="UK">Anh</SelectItem>
                    <SelectItem value="Other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Thông Tin Bổ Sung
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vipStatus">Trạng Thái VIP</Label>
                <Select value={formData.vipStatus} onValueChange={(value) => setFormData({ ...formData, vipStatus: value })}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Thường</SelectItem>
                    <SelectItem value="silver">Bạc</SelectItem>
                    <SelectItem value="gold">Vàng</SelectItem>
                    <SelectItem value="platinum">Bạch Kim</SelectItem>
                    <SelectItem value="diamond">Kim Cương</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Ghi Chú</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="border-gray-300 focus:border-gray-500 h-24"
                  placeholder="Ghi chú đặc biệt về khách hàng..."
                />
              </div>
            </div>
          </div>

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
              Thêm Khách Hàng
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
