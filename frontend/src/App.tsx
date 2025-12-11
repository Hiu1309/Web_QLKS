import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { RoomManagement } from "./components/RoomManagement";
import { ReservationManagement } from "./components/ReservationManagement";
import { InvoiceManagement } from "./components/InvoiceManagement";
import { GuestManagement } from "./components/GuestManagement";
import { ServicesManagement } from "./components/ServicesManagement";
import { EmployeeManagement } from "./components/EmployeeManagement";
import { Login } from "./components/Login";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

export type ViewType =
  | "dashboard"
  | "rooms"
  | "reservations"
  | "invoices"
  | "guests"
  | "services"
  | "employees";

interface User {
  userId: number;
  username: string;
  name: string;
  email: string;
  role: string;
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const currentView = location.pathname.split('/')[1] as ViewType || 'dashboard';

  const handleViewChange = (view: ViewType) => {
    navigate(`/${view}`);
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentUser({
          userId: data.user.userId,
          username: data.user.username,
          name: data.user.fullName || data.user.username,
          email: data.user.email || "",
          role: data.user.roleName,
        });
        setIsAuthenticated(true);

        // Navigate based on role
        const roleName = data.user.roleName?.toLowerCase();
        if (roleName === "lễ tân" || roleName === "receptionist") {
          navigate("/reservations");
        } else if (roleName === "buồng phòng" || roleName === "housekeeping") {
          navigate("/rooms");
        } else {
          navigate("/dashboard");
        }

        toast.success(
          `Chào mừng ${data.user.fullName || data.user.username}!`,
          {
            description: `Đăng nhập thành công`,
          }
        );
      } else {
        toast.error("Đăng nhập thất bại", {
          description: data.message,
        });
      }
    } catch (error) {
      toast.error("Lỗi kết nối", {
        description: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    navigate("/login");
    toast.info("Đã đăng xuất", {
      description: "Hẹn gặp lại bạn!",
    });
  };

  // Show authentication screens if not logged in
  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      {location.pathname === '/login' ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="flex flex-col min-h-screen bg-white">
          <Header
            currentView={currentView}
            onViewChange={handleViewChange}
            onLogout={handleLogout}
            currentUser={currentUser || undefined}
          />
          <main className="flex-1">
            <Routes>
              <Route path="/dashboard" element={<Dashboard onNavigate={handleViewChange} />} />
              <Route path="/rooms" element={<RoomManagement />} />
              <Route path="/reservations" element={<ReservationManagement currentUser={currentUser || undefined} />} />
              <Route path="/invoices" element={<InvoiceManagement />} />
              <Route path="/guests" element={<GuestManagement />} />
              <Route path="/services" element={<ServicesManagement />} />
              <Route path="/employees" element={<EmployeeManagement />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      )}
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
