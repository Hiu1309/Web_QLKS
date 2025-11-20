import { useState } from "react";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { RoomManagement } from "./components/RoomManagement";
import { ReservationManagement } from "./components/ReservationManagement";
import { InvoiceManagement } from "./components/InvoiceManagement";
import { GuestManagement } from "./components/GuestManagement";
import { ServicesManagement } from "./components/ServicesManagement";
import { EmployeeManagement } from "./components/EmployeeManagement";
import { Login, testAccounts } from "./components/Login";
import { Register } from "./components/Register";
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

type AuthView = "login" | "register";

interface User {
  name: string;
  email: string;
  role: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [authView, setAuthView] = useState<AuthView>("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (email: string, password: string) => {
    // Validate against test accounts
    const account = testAccounts.find(
      (acc) => acc.email === email && acc.password === password
    );

    if (account) {
      setCurrentUser({
        name: account.name,
        email: account.email,
        role: account.role,
      });
      setIsAuthenticated(true);
      toast.success(`Chào mừng ${account.name}!`, {
        description: `Đăng nhập thành công với vai trò ${account.label}`,
      });
    } else {
      toast.error("Đăng nhập thất bại", {
        description: "Email hoặc mật khẩu không đúng",
      });
    }
  };

  const handleRegister = (
    name: string,
    email: string,
    password: string,
    phone: string,
    role: string
  ) => {
    // Mock register - in production, send to backend
    console.log("Register:", { name, email, password, phone, role });
    setCurrentUser({
      name: name,
      email: email,
      role: role,
    });
    setIsAuthenticated(true);
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
        {authView === "login" ? (
          <Login
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthView("register")}
          />
        ) : (
          <Register
            onRegister={handleRegister}
            onSwitchToLogin={() => setAuthView("login")}
          />
        )}
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
