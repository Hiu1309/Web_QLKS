import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
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
import {
  CalendarIcon,
  UserPlus,
  Mail,
  Phone,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  idType: string;
  idNumber: string;
  dob?: string;
  createdAt?: string;
}

interface AddEditGuestDialogProps {
  mode?: "add" | "edit";
  guest?: Guest;
  trigger?: React.ReactNode;
  onCreated?: (guest: any) => void;
  onUpdated?: (guest: Guest) => void;
  initial?: Partial<any>;
}

export function AddEditGuestDialog({
  mode = "add",
  guest,
  trigger,
  onCreated,
  onUpdated,
  initial,
}: AddEditGuestDialogProps) {
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    fullName: guest?.name || "",
    email: guest?.email || "",
    phone: guest?.phone || "",
    idType: guest?.idType || "CCCD",
    idNumber: guest?.idNumber || "",
  });

  // Reset form when dialog opens/closes or guest changes
  useEffect(() => {
    if (mode === "edit" && guest) {
      setFormData({
        fullName: guest.name,
        email: guest.email,
        phone: guest.phone,
        idType: guest.idType,
        idNumber: guest.idNumber,
      });
      // Parse YYYY-MM-DD to day, month, year
      if (guest.dob) {
        const [y, m, d] = guest.dob.split("-");
        setYear(y);
        setMonth(m);
        setDay(d);
      } else {
        setDay("");
        setMonth("");
        setYear("");
      }
    } else if (mode === "add") {
      setFormData({
        fullName: initial?.fullName || "",
        email: initial?.email || "",
        phone: initial?.phone || "",
        idType: initial?.idType || "CCCD",
        idNumber: initial?.idNumber || "",
      });
      setDay("");
      setMonth("");
      setYear("");
    }
  }, [guest, open, mode, initial]);

  const validateIdNumber = (idType: string, idNumber: string): string => {
    if (!idNumber) return "Mã giấy tờ bắt buộc";

    if (idType === "CCCD") {
      if (!/^\d{12}$/.test(idNumber)) {
        return "CCCD phải có đúng 12 chữ số";
      }
    } else if (idType === "Hộ chiếu") {
      if (!/^[A-Z]\d{7}$/.test(idNumber)) {
        return "Hộ chiếu phải có 1 chữ cái in hoa + 7 chữ số";
      }
    }
    return "";
  };

  const validatePhone = (phone: string): string => {
    if (!phone) return "Số điện thoại bắt buộc";

    const hasInvalidChars = !/^(\+)?[0-9]+$/.test(phone);
    if (hasInvalidChars) {
      return "Số điện thoại chỉ chứa chữ số";
    }

    const isValidFormat = /^(0[0-9]{9}|\+84[0-9]{9})$/.test(phone);
    if (!isValidFormat) {
      const digitsOnly = phone.replace(/\D/g, "");
      if (digitsOnly.length < 10) {
        return "Số điện thoại phải đủ 10 chữ số";
      }
      return "Số điện thoại không hợp lệ";
    }

    return "";
  };

  const validateEmail = (email: string): string => {
    if (!email) return "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Email không hợp lệ";
    }
    return "";
  };

  const validateDob = (d: string, m: string, y: string): string => {
    if (!d || !m || !y) {
      return "Ngày sinh là bắt buộc";
    }

    const dayNum = Number(d);
    const monthNum = Number(m);
    const yearNum = Number(y);

    if (
      Number.isNaN(dayNum) ||
      Number.isNaN(monthNum) ||
      Number.isNaN(yearNum)
    ) {
      return "Ngày sinh phải là số";
    }

    const currentYear = new Date().getFullYear();
    if (yearNum < 1900 || yearNum > currentYear) {
      return "Năm sinh không hợp lệ";
    }
    if (monthNum < 1 || monthNum > 12) {
      return "Tháng sinh không hợp lệ";
    }
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    if (dayNum < 1 || dayNum > daysInMonth) {
      return "Ngày sinh không hợp lệ";
    }

    const birthDate = new Date(yearNum, monthNum - 1, dayNum);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      return "Khách hàng phải từ 18 tuổi trở lên";
    }

    return "";
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Tên bắt buộc";
    }

    const phoneError = validatePhone(formData.phone.trim());
    if (phoneError) {
      newErrors.phone = phoneError;
    }

    const emailError = validateEmail(formData.email.trim());
    if (emailError) {
      newErrors.email = emailError;
    }

    const dobError = validateDob(day, month, year);
    if (dobError) {
      newErrors.dob = dobError;
    }

    if (!formData.idType) {
      newErrors.idType = "Loại giấy tờ bắt buộc";
    }
    if (!formData.idNumber.trim()) {
      newErrors.idNumber = "Mã giấy tờ bắt buộc";
    } else {
      const idValidationError = validateIdNumber(
        formData.idType,
        formData.idNumber
      );
      if (idValidationError) {
        newErrors.idNumber = idValidationError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim() || null,
      phone: formData.phone.trim(),
      dob: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
      idType: formData.idType,
      idNumber: formData.idNumber.trim(),
    };

    try {
      if (mode === "add") {
        const res = await fetch("http://localhost:8080/api/guests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Add guest failed");
        }
        const created = await res.json();
        onCreated && onCreated(created);
        setOpen(false);
        toast.success("Thêm khách hàng thành công!");

        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          idType: "CCCD",
          idNumber: "",
        });
        setDay("");
        setMonth("");
        setYear("");
        setErrors({});
      } else if (mode === "edit" && guest) {
        const res = await fetch(
          `http://localhost:8080/api/guests/${guest.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || "Update guest failed");
        }
        const updated = await res.json();
        onUpdated &&
          onUpdated({
            id: updated.guestId?.toString() ?? guest.id,
            name: updated.fullName || guest.name,
            email: updated.email || "",
            phone: updated.phone || "",
            dob: updated.dob || "",
            createdAt: updated.createdAt || "",
            idType: updated.idType || "",
            idNumber: updated.idNumber || "",
          });
        setOpen(false);
        toast.success("Cập nhật khách hàng thành công!");
      }
    } catch (err) {
      console.error(err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : mode === "add"
          ? "Thêm khách hàng thất bại"
          : "Cập nhật khách hàng thất bại";
      toast.error(errorMessage);
    }
  };

  // Format date from YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (dateStr: string): string => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Parse DD/MM/YYYY to YYYY-MM-DD for storage
  const parseDateForStorage = (dateStr: string): string => {
    if (!dateStr) return "";
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return dateStr;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ||
          (mode === "add" ? (
            <Button className="bg-gray-700 hover:bg-gray-800 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Thêm Khách Hàng
            </Button>
          ) : (
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              Chỉnh Sửa Hồ Sơ
            </Button>
          ))}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-800">
            {mode === "add"
              ? "Thêm Khách Hàng Mới"
              : "Chỉnh Sửa Hồ Sơ Khách Hàng"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-800">
              Tên Khách Hàng *
            </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className={`border-gray-300 focus:border-gray-500 ${
                errors.fullName ? "border-red-500" : ""
              }`}
              placeholder="Nguyễn Văn A"
            />
            {errors.fullName && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.fullName}
              </div>
            )}
          </div>

          {/* Email (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-800">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`pl-10 border-gray-300 focus:border-gray-500 ${
                  errors.email ? "border-red-500" : ""
                }`}
                placeholder="example@email.com"
              />
            </div>
            {errors.email && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.email}
              </div>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-800">
              Số Điện Thoại *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className={`pl-10 border-gray-300 focus:border-gray-500 ${
                  errors.phone ? "border-red-500" : ""
                }`}
                placeholder="0987654321"
              />
            </div>
            {errors.phone && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.phone}
              </div>
            )}
          </div>

          {/* Date of Birth - Ngày/Tháng/Năm */}
          <div className="space-y-2">
            <Label className="text-gray-800 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Ngày Sinh *
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <Input
                type="number"
                min="1"
                max="31"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="Ngày"
                className={`border-gray-300 focus:border-gray-500 ${
                  errors.dob ? "border-red-500" : ""
                }`}
              />
              <Input
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="Tháng"
                className={`border-gray-300 focus:border-gray-500 ${
                  errors.dob ? "border-red-500" : ""
                }`}
              />
              <Input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Năm"
                className={`border-gray-300 focus:border-gray-500 ${
                  errors.dob ? "border-red-500" : ""
                }`}
              />
            </div>
            {day && month && year && (
              <p className="text-xs text-gray-500">
                Ngày đã chọn: {day.padStart(2, "0")}/{month.padStart(2, "0")}/
                {year}
              </p>
            )}
            {errors.dob && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.dob}
              </div>
            )}
          </div>

          {/* ID Type */}
          <div className="space-y-2">
            <Label htmlFor="idType" className="text-gray-800">
              Loại Giấy Tờ Tùy Thân *
            </Label>
            <Select
              value={formData.idType}
              onValueChange={(value) =>
                setFormData({ ...formData, idType: value, idNumber: "" })
              }
            >
              <SelectTrigger
                className={`border-gray-300 ${
                  errors.idType ? "border-red-500" : ""
                }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CCCD">CCCD</SelectItem>
                <SelectItem value="Hộ chiếu">Hộ Chiếu</SelectItem>
              </SelectContent>
            </Select>
            {errors.idType && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.idType}
              </div>
            )}
          </div>

          {/* ID Number */}
          <div className="space-y-2">
            <Label htmlFor="idNumber" className="text-gray-800">
              Mã Giấy Tờ *
            </Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="idNumber"
                value={formData.idNumber}
                onChange={(e) =>
                  setFormData({ ...formData, idNumber: e.target.value })
                }
                className={`pl-10 border-gray-300 focus:border-gray-500 ${
                  errors.idNumber ? "border-red-500" : ""
                }`}
                placeholder={
                  formData.idType === "Hộ chiếu" ? "A1234567" : "001234567890"
                }
              />
            </div>
            {errors.idNumber && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.idNumber}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setErrors({});
              }}
              className="flex-1 border-gray-300 hover:bg-gray-100"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className={`flex-1 text-white ${
                mode === "add"
                  ? "bg-gray-700 hover:bg-gray-800"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {mode === "add" ? "Thêm Khách Hàng" : "Cập Nhật"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
