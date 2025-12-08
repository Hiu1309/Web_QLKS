import {
  LayoutDashboard,
  Bed,
  Calendar,
  Users,
  Diamond,
  Sparkles,
  UserCog,
  LogOut,
  User,
  ChevronDown,
  Receipt,
} from "lucide-react";
import { Button } from "./ui/button";
import { ViewType } from "../App";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
  currentUser?: { name: string; email: string; role: string };
}

const menuItems = [
  { id: "dashboard" as ViewType, label: "Tổng quan", icon: LayoutDashboard },
  { id: "rooms" as ViewType, label: "Phòng", icon: Bed },
  { id: "reservations" as ViewType, label: "Đặt phòng", icon: Calendar },
  { id: "invoices" as ViewType, label: "Hóa đơn", icon: Receipt },
  { id: "guests" as ViewType, label: "Khách hàng", icon: Users },
  { id: "services" as ViewType, label: "Dịch vụ", icon: Sparkles },
  { id: "employees" as ViewType, label: "Nhân viên", icon: UserCog },
];

export function Header({
  currentView,
  onViewChange,
  onLogout,
  currentUser,
}: HeaderProps) {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "receptionist":
        return "Lễ Tân";
      case "housekeeping":
        return "Nhân Viên Buồng Phòng";
      case "manager":
        return "Quản Lí";
      default:
        return role;
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-3 hover:opacity-70 transition-opacity cursor-pointer"
          >
            <div className="p-2.5 bg-gray-900 rounded-xl">
              <Diamond className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col -space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">HHA</h1>
              <p className="text-xs text-gray-500">Quản Lý Khách Sạn</p>
            </div>
          </button>

          {/* Navigation Menu */}
          <nav className="flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`gap-2 h-10 px-4 transition-all ${
                    isActive
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  onClick={() => onViewChange(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* User Dropdown */}
            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2 h-10 px-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <div className="p-1.5 bg-gray-100 rounded-lg">
                      <User className="h-4 w-4 text-gray-700" />
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {currentUser.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getRoleLabel(currentUser.role)}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{currentUser.name}</p>
                      <p className="text-xs text-gray-500">
                        {currentUser.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        {getRoleLabel(currentUser.role)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onLogout}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng Xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
