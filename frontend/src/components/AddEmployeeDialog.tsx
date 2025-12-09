import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  dateBirth: string;
  role: "receptionist" | "housekeeping" | "manager";
}

interface AddEmployeeDialogProps {
  trigger?: React.ReactNode;
  employee?: Employee | null;
  onSave?: (employee: Employee) => void;
}

export function AddEmployeeDialog({
  trigger,
  employee,
  onSave,
}: AddEmployeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    employee?.dateBirth ? new Date(employee.dateBirth) : undefined
  );
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    username: "",
    password: "",
    phone: employee?.phone || "",
    email: employee?.email || "",
    role: employee?.role || "receptionist",
  });

  // Reset form when dialog closes or when it's for adding new employee
  useEffect(() => {
    if (!open || !employee) {
      setFormData({
        name: employee?.name || "",
        username: "",
        password: "",
        phone: employee?.phone || "",
        email: employee?.email || "",
        role: employee?.role || "receptionist",
      });
      setDateOfBirth(employee?.dateBirth ? new Date(employee.dateBirth) : undefined);
    }
  }, [open, employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: Check empty fields
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập họ và tên");
      return;
    }
    if (!formData.username.trim()) {
      toast.error("Vui lòng nhập tên đăng nhập");
      return;
    }
    if (!formData.password.trim()) {
      toast.error("Vui lòng nhập mật khẩu");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }
    if (!dateOfBirth) {
      toast.error("Vui lòng chọn ngày sinh");
      return;
    }

    // Validation: Password length
    if (formData.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    // Validation: Age must be 18+
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate()) ? age - 1 : age;
    
    if (actualAge < 18) {
      toast.error("Nhân viên phải từ 18 tuổi trở lên");
      return;
    }

    // Map role to role_id
    const roleIdMap: Record<string, number> = {
      receptionist: 2,  // Lễ tân
      housekeeping: 3,  // Buồng phòng
      manager: 1,       // Quản lý
    };

    const userData = {
      username: formData.username.trim(),
      password: formData.password.trim(),
      fullName: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      dob: dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : null,
      role: {
        roleId: roleIdMap[formData.role]
      }
    };

    try {
      const response = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response text:", errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.log("Parsed error data:", errorData);
        } catch {
          errorData = { message: errorText };
        }
        
        // Get error message from various possible fields
        const errorMessage = errorData.error || errorData.message || errorData.trace || errorText || "";
        console.log("Final error message:", errorMessage);
        
        // Check for duplicate username (case insensitive)
        if (errorMessage.toLowerCase().includes("duplicate entry") && errorMessage.toLowerCase().includes("username")) {
          throw new Error("Tên đăng nhập đã tồn tại. Vui lòng chọn tên đăng nhập khác.");
        }
        
        // Check for duplicate email (case insensitive)
        if (errorMessage.toLowerCase().includes("duplicate entry") && errorMessage.toLowerCase().includes("email")) {
          throw new Error("Email đã được sử dụng. Vui lòng sử dụng email khác.");
        }
        
        // Check for duplicate phone (case insensitive)
        if (errorMessage.toLowerCase().includes("duplicate entry") && errorMessage.toLowerCase().includes("phone")) {
          throw new Error("Số điện thoại đã được sử dụng. Vui lòng sử dụng số điện thoại khác.");
        }
        
        throw new Error("Không thể thêm nhân viên");
      }

      const newUser = await response.json();
      toast.success("Đã thêm nhân viên thành công");
      
      if (onSave) {
        onSave(newUser);
      }

      // Reset form
      setFormData({ name: "", username: "", password: "", phone: "", email: "", role: "receptionist" });
      setDateOfBirth(undefined);
      setOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      toast.error(errorMessage);
      console.error("Error adding employee:", error);
    }
  };

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
            {employee ? "Chỉnh Sửa Nhân Viên" : "Thêm Nhân Viên Mới"}
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
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                minLength={2}
                className="border-gray-300 focus:border-gray-500"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div>
              <Label htmlFor="username">Tên Đăng Nhập *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                minLength={3}
                pattern="[a-zA-Z0-9_]+"
                title="Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới"
                className="border-gray-300 focus:border-gray-500"
                placeholder="username"
              />
            </div>

            <div>
              <Label htmlFor="password">Mật Khẩu * (tối thiểu 6 ký tự)</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={6}
                className="border-gray-300 focus:border-gray-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                pattern="[0-9]{10,11}"
                title="Số điện thoại phải có 10-11 chữ số"
                className="border-gray-300 focus:border-gray-500"
                placeholder="0912345678"
              />
            </div>

            <div>
              <Label>Ngày Sinh * (từ 18 tuổi trở lên)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left border-gray-300 hover:bg-gray-50"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateOfBirth
                      ? format(dateOfBirth, "dd/MM/yyyy")
                      : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white" align="start">
                  <div className="p-3">
                    <div className="flex gap-2 mb-3">
                      <Select
                        value={dateOfBirth ? dateOfBirth.getMonth().toString() : "0"}
                        onValueChange={(value) => {
                          const newDate = dateOfBirth ? new Date(dateOfBirth) : new Date();
                          newDate.setMonth(parseInt(value));
                          setDateOfBirth(newDate);
                        }}
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Tháng 1</SelectItem>
                          <SelectItem value="1">Tháng 2</SelectItem>
                          <SelectItem value="2">Tháng 3</SelectItem>
                          <SelectItem value="3">Tháng 4</SelectItem>
                          <SelectItem value="4">Tháng 5</SelectItem>
                          <SelectItem value="5">Tháng 6</SelectItem>
                          <SelectItem value="6">Tháng 7</SelectItem>
                          <SelectItem value="7">Tháng 8</SelectItem>
                          <SelectItem value="8">Tháng 9</SelectItem>
                          <SelectItem value="9">Tháng 10</SelectItem>
                          <SelectItem value="10">Tháng 11</SelectItem>
                          <SelectItem value="11">Tháng 12</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={dateOfBirth ? dateOfBirth.getFullYear().toString() : new Date().getFullYear().toString()}
                        onValueChange={(value) => {
                          const newDate = dateOfBirth ? new Date(dateOfBirth) : new Date();
                          newDate.setFullYear(parseInt(value));
                          setDateOfBirth(newDate);
                        }}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]" position="popper">
                          {Array.from({ length: 84 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Calendar
                      mode="single"
                      selected={dateOfBirth}
                      onSelect={setDateOfBirth}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1940-01-01")
                      }
                      month={dateOfBirth}
                      onMonthChange={setDateOfBirth}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="role">Chức Vụ *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Chọn chức vụ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receptionist">Lễ Tân</SelectItem>
                  <SelectItem value="housekeeping">
                    Nhân Viên Buồng Phòng
                  </SelectItem>
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
              {employee ? "Cập Nhật" : "Thêm Nhân Viên"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
