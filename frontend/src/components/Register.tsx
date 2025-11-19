import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Diamond, UserPlus, Mail, Lock, User, Phone } from 'lucide-react';

interface RegisterProps {
  onRegister: (name: string, email: string, password: string, phone: string, role: string) => void;
  onSwitchToLogin: () => void;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'receptionist'
  });

  const [errors, setErrors] = useState({
    passwordMatch: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setErrors({ passwordMatch: 'Mật khẩu không khớp' });
      return;
    }
    
    setErrors({ passwordMatch: '' });
    onRegister(formData.name, formData.email, formData.password, formData.phone, formData.role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <Card className="w-full max-w-md bg-white shadow-2xl border-0 relative z-10">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gray-400 blur-md opacity-50 animate-pulse"></div>
              <div className="relative p-3 bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 rounded-xl shadow-lg">
                <Diamond className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl text-gray-800">Tạo Tài Khoản</CardTitle>
          <CardDescription className="text-gray-600">
            Đăng ký tài khoản quản lý khách sạn HHA
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">Họ và Tên *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="pl-10 border-gray-300 focus:border-gray-500"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="pl-10 border-gray-300 focus:border-gray-500"
                  placeholder="example@hha.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700">Số Điện Thoại *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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

            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-700">Chức Vụ *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receptionist">Lễ Tân</SelectItem>
                  <SelectItem value="housekeeping">Nhân Viên Buồng Phòng</SelectItem>
                  <SelectItem value="manager">Quản Lí</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Mật Khẩu *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="pl-10 border-gray-300 focus:border-gray-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">Xác Nhận Mật Khẩu *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  className="pl-10 border-gray-300 focus:border-gray-500"
                  placeholder="••••••••"
                />
              </div>
              {errors.passwordMatch && (
                <p className="text-sm text-red-600">{errors.passwordMatch}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white shadow-lg h-11"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Đăng Ký
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline"
              onClick={onSwitchToLogin}
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 h-11"
            >
              Đã Có Tài Khoản? Đăng Nhập
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
