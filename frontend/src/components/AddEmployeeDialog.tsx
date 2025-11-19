import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns@3.6.0';

interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  dateBirth: string;
  role: 'receptionist' | 'housekeeping' | 'manager';
}

interface AddEmployeeDialogProps {
  trigger?: React.ReactNode;
  employee?: Employee | null;
  onSave?: (employee: Employee) => void;
}

export function AddEmployeeDialog({ trigger, employee, onSave }: AddEmployeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    employee?.dateBirth ? new Date(employee.dateBirth) : undefined
  );
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    phone: employee?.phone || '',
    email: employee?.email || '',
    role: employee?.role || 'receptionist'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const employeeData: Employee = {
      id: employee?.id || `EMP${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      dateBirth: dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : '',
      role: formData.role as 'receptionist' | 'housekeeping' | 'manager'
    };

    console.log('Employee saved:', employeeData);
    if (onSave) {
      onSave(employeeData);
    }
    
    // Reset form
    setFormData({ name: '', phone: '', email: '', role: 'receptionist' });
    setDateOfBirth(undefined);
    setOpen(false);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'receptionist':
        return 'Lễ Tân';
      case 'housekeeping':
        return 'Nhân Viên Buồng Phòng';
      case 'manager':
        return 'Quản Lí';
      default:
        return role;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gray-700 hover:bg-gray-800 text-white">
            Thêm Nhân Viên
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-800">
            {employee ? 'Chỉnh Sửa Nhân Viên' : 'Thêm Nhân Viên Mới'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Điền thông tin nhân viên khách sạn HHA
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Họ và Tên *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="border-gray-300 focus:border-gray-500"
                placeholder="Nguyễn Văn A"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="border-gray-300 focus:border-gray-500"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Số Điện Thoại *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="border-gray-300 focus:border-gray-500"
                placeholder="+91 98765 43210"
              />
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
                    {dateOfBirth ? format(dateOfBirth, 'dd/MM/yyyy') : 'Chọn ngày'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white" align="start">
                  <Calendar
                    mode="single"
                    selected={dateOfBirth}
                    onSelect={setDateOfBirth}
                    disabled={(date) => date > new Date() || date < new Date('1940-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="role">Chức Vụ *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Chọn chức vụ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receptionist">Lễ Tân</SelectItem>
                  <SelectItem value="housekeeping">Nhân Viên Buồng Phòng</SelectItem>
                  <SelectItem value="manager">Quản Lí</SelectItem>
                </SelectContent>
              </Select>
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
              {employee ? 'Cập Nhật' : 'Thêm Nhân Viên'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
