import { 
  LayoutDashboard, 
  Bed, 
  Calendar, 
  Users, 
  Diamond,
  User,
  Coffee,
  Sparkles,
  UserCog,
  LogOut,
  FileText
} from 'lucide-react';
import { Button } from './ui/button';
import { ViewType } from '../App';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
  currentUser?: { name: string; email: string; role: string };
}

const menuItems = [
  { id: 'dashboard' as ViewType, label: 'Tổng quan', icon: LayoutDashboard, roles: ['Quản lý'] },
  { id: 'rooms' as ViewType, label: 'Phòng', icon: Bed, roles: ['Quản lý', 'Buồng phòng'] },
  { id: 'reservations' as ViewType, label: 'Đặt phòng', icon: Calendar, roles: ['Quản lý', 'Lễ tân'] },
  { id: 'invoices' as ViewType, label: 'Hóa đơn', icon: FileText, roles: ['Quản lý', 'Lễ tân'] },
  { id: 'guests' as ViewType, label: 'Khách hàng', icon: Users, roles: ['Quản lý', 'Lễ tân'] },
  { id: 'services' as ViewType, label: 'Dịch vụ', icon: Sparkles, roles: ['Quản lý', 'Buồng phòng'] },
  { id: 'employees' as ViewType, label: 'Nhân viên', icon: UserCog, roles: ['Quản lý'] },
];

export function Sidebar({ currentView, onViewChange, onLogout, currentUser }: SidebarProps) {
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

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item => 
    !item.roles || !currentUser || item.roles.includes(currentUser.role)
  );

  return (
    <div className="w-72 bg-gradient-to-b from-gray-800 via-gray-700 to-gray-800 border-r border-gray-600 shadow-2xl p-6 relative overflow-hidden flex flex-col">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
      
      {/* Logo Section */}
      <div className="flex items-center gap-3 mb-10 relative animate-fadeIn">
        <div className="relative">
          <div className="absolute inset-0 bg-gray-400 blur-md opacity-50 animate-pulse-accent"></div>
          <div className="relative p-2.5 bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 rounded-xl shadow-lg">
            <Diamond className="h-7 w-7 text-white animate-float" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent tracking-wide">
            HHA
          </h1>
          <p className="text-xs text-gray-400 tracking-widest uppercase">Sang trọng & Tiện nghi</p>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="space-y-1.5">
        {visibleMenuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <div 
              key={item.id}
              className="animate-slideInRight"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 h-12 transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-white text-gray-800 shadow-lg shadow-gray-900/30 scale-105' 
                    : 'hover:bg-gray-600 text-white/80 hover:text-white hover:scale-105'
                }`}
                onClick={() => onViewChange(item.id)}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/20 to-transparent animate-shimmer"></div>
                )}
                <Icon className={`h-5 w-5 transition-all duration-300 ${
                  isActive ? 'text-gray-700' : 'text-gray-300 group-hover:scale-110'
                }`} />
                <span className={`font-medium transition-all duration-300 ${
                  isActive ? 'text-gray-800' : ''
                }`}>
                  {item.label}
                </span>
                {!isActive && (
                  <div className="absolute right-2 w-1 h-0 bg-white group-hover:h-6 transition-all duration-300 rounded-full"></div>
                )}
              </Button>
            </div>
          );
        })}
      </nav>
      
      {/* User Info & Logout */}
      <div className="mt-auto pt-8 space-y-4">
        {/* User Profile Card */}
        {currentUser && (
          <div className="relative p-4 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border border-gray-500 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
            <div className="relative flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{currentUser.name}</p>
                <p className="text-gray-400 text-xs truncate">{getRoleLabel(currentUser.role)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Card */}
        <div className="relative p-4 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border border-gray-500 shadow-xl overflow-hidden group hover:shadow-gray-900/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-gray-300" />
              <div className="text-sm text-gray-300 font-medium">Nổi bật hôm nay</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Lấp đầy</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-12 bg-gray-600 rounded-full overflow-hidden">
                    <div className="h-full w-[71%] bg-gradient-to-r from-white to-gray-300 rounded-full"></div>
                  </div>
                  <span className="text-sm font-semibold text-white">71%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-xs">Doanh thu</span>
                <span className="text-sm font-semibold text-white">₹10.2L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start gap-3 h-12 text-white/80 hover:text-white hover:bg-red-600/20 border border-red-500/30 hover:border-red-500 transition-all duration-300 group"
        >
          <LogOut className="h-5 w-5 text-red-400 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Đăng Xuất</span>
        </Button>
      </div>
    </div>
  );
}