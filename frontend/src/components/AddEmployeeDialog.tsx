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
  userId: number;
  fullName: string;
  username?: string;
  phone: string;
  email: string;
  dob: string;
  roleName: string;
  createdAt: string;
  password?: string;
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
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    phone: "",
    email: "",
    role: "receptionist",
  });

  // Load employee data when dialog opens
  useEffect(() => {
    if (open && employee) {
      // Editing mode - load existing employee data
      const roleMap: Record<string, string> = {
        "Lễ tân": "receptionist",
        "Buồng phòng": "housekeeping",
        "Quản lý": "manager",
      };
      setFormData({
        name: employee.fullName || "",
        username: employee.username || "",
        password: employee.password || "",
        phone: employee.phone || "",
        email: employee.email || "",
        role: roleMap[employee.roleName] || "receptionist",
      });
      setDateOfBirth(employee.dob ? new Date(employee.dob) : undefined);
    } else if (open && !employee) {
      // Adding mode - reset form
      setFormData({
        name: "",
        username: "",
        password: "",
        phone: "",
        email: "",
        role: "receptionist",
      });
      setDateOfBirth(undefined);
    }
  }, [open, employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedPassword = formData.password.trim();

    // Validation: Check empty fields
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập họ và tên");
      return;
    }

    // Only validate username and password when adding new employee
    if (!employee) {
      if (!formData.username.trim()) {
        toast.error("Vui lòng nhập tên đăng nhập");
        return;
      }
      if (!trimmedPassword) {
        toast.error("Vui lòng nhập mật khẩu");
        return;
      }
      // Validation: Password length
      if (trimmedPassword.length < 6) {
        toast.error("Mật khẩu phải có ít nhất 6 ký tự");
        return;
      }
    } else if (trimmedPassword && trimmedPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
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

    // Validation: Age must be 18+
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    const actualAge =
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
        ? age - 1
        : age;

    if (actualAge < 18) {
      toast.error("Nhân viên phải từ 18 tuổi trở lên");
      return;
    }

    // Map role to role_id
    const roleIdMap: Record<string, number> = {
      receptionist: 2, // Lễ tân
      housekeeping: 3, // Buồng phòng
      manager: 1, // Quản lý
    };

    const userData: any = {
      fullName: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      dob: dateOfBirth ? format(dateOfBirth, "yyyy-MM-dd") : null,
      role: {
        roleId: roleIdMap[formData.role],
      },
    };

    // Only include username and password when adding new employee
    if (!employee) {
      userData.username = formData.username.trim();
      userData.password = trimmedPassword;
    } else if (trimmedPassword) {
      userData.password = trimmedPassword;
    }

    try {
      const url = employee
        ? `http://localhost:8080/api/users/${employee.userId}`
        : "http://localhost:8080/api/users";
      const method = employee ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
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
        const errorMessage =
          errorData.error ||
          errorData.message ||
          errorData.trace ||
          errorText ||
          "";
        console.log("Final error message:", errorMessage);

        // Check for duplicate username (case insensitive)
        if (
          errorMessage.toLowerCase().includes("duplicate entry") &&
          errorMessage.toLowerCase().includes("username")
        ) {
          throw new Error(
            "Tên đăng nhập đã tồn tại. Vui lòng chọn tên đăng nhập khác."
          );
        }

        // Check for duplicate email (case insensitive)
        if (
          errorMessage.toLowerCase().includes("duplicate entry") &&
          errorMessage.toLowerCase().includes("email")
        ) {
          throw new Error(
            "Email đã được sử dụng. Vui lòng sử dụng email khác."
          );
        }

        // Check for duplicate phone (case insensitive)
        if (
          errorMessage.toLowerCase().includes("duplicate entry") &&
          errorMessage.toLowerCase().includes("phone")
        ) {
          throw new Error(
            "Số điện thoại đã được sử dụng. Vui lòng sử dụng số điện thoại khác."
          );
        }

        throw new Error("Không thể thêm nhân viên");
      }

      const newUser = await response.json();
      toast.success(
        employee
          ? "Đã cập nhật nhân viên thành công"
          : "Đã thêm nhân viên thành công"
      );

      if (onSave) {
        onSave(newUser);
      }

      // Reset form
      setFormData({
        name: "",
        username: "",
        password: "",
        phone: "",
        email: "",
        role: "receptionist",
      });
      setDateOfBirth(undefined);
      setOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
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
                required={!employee}
                minLength={3}
                pattern="[a-zA-Z0-9_]+"
                title="Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới"
                className="border-gray-300 focus:border-gray-500"
                placeholder="username"
                disabled={!!employee}
              />
            </div>

            <div>
              <Label htmlFor="password">
                {employee ? "Mật Khẩu *" : "Mật Khẩu * (tối thiểu 6 ký tự)"}
              </Label>
              <Input
                id="password"
                type={employee ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!employee}
                minLength={6}
                className="border-gray-300 focus:border-gray-500"
                placeholder={employee ? "" : "••••••••"}
                autoComplete={employee ? "off" : "new-password"}
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

            <div className="space-y-2">
              <Label
                htmlFor="dob"
                className="text-gray-800 flex items-center gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                Ngày Sinh *
              </Label>
              <div className="relative">
                <Input
                  id="dob"
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={
                    dateOfBirth ? dateOfBirth.toISOString().split("T")[0] : ""
                  }
                  onChange={(e) => {
                    if (e.target.value) {
                      setDateOfBirth(new Date(e.target.value));
                    }
                  }}
                  className="pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="role">Chức Vụ *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: string) =>
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
