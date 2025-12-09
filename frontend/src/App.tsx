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
import { toast } from "sonner@2.0.3";

export type ViewType =
  | "dashboard"
  | "rooms"
  | "reservations"
  | "invoices"
  | "guests"
  | "services"
  | "employees";

interface User {
  name: string;
  email: string;
  role: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (email: string, password: string) => {
    // In production, validate against backend API
    if (email && password) {
      setCurrentUser({
        name: email.split('@')[0],
        email: email,
        role: "user",
      });
      setIsAuthenticated(true);
      toast.success(`Chào mừng!`, {
        description: `Đăng nhập thành công`,
      });
    } else {
      toast.error("Đăng nhập thất bại", {
        description: "Email hoặc mật khẩu không đúng",
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
        return <Dashboard />;
      case "rooms":
        return <RoomManagement />;
      case "reservations":
        return <ReservationManagement />;
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
        <Login
          onLogin={handleLogin}
        />
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
