import { useState } from "react";
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

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
          setCurrentView("reservations");
        } else if (roleName === "buồng phòng" || roleName === "housekeeping") {
          setCurrentView("rooms");
        } else {
          setCurrentView("dashboard");
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
    setCurrentView("dashboard");
    toast.info("Đã đăng xuất", {
      description: "Hẹn gặp lại bạn!",
    });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentView} />;
      case "rooms":
        return <RoomManagement />;
      case "reservations":
        return <ReservationManagement currentUser={currentUser || undefined} />;
      case "invoices":
        return <InvoiceManagement />;
      case "guests":
        return <GuestManagement />;
      case "services":
        return <ServicesManagement />;
      case "employees":
        return <EmployeeManagement />;
      default:
        return <Dashboard />;
    }
  };

  // Show authentication screens if not logged in
  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-white">
        <Header
          currentView={currentView}
          onViewChange={setCurrentView}
          onLogout={handleLogout}
          currentUser={currentUser || undefined}
        />
        <main className="flex-1">{renderCurrentView()}</main>
      </div>
      <Toaster />
    </>
  );
}
