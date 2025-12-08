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

interface AddGuestDialogProps {
  trigger?: React.ReactNode;
  onCreated?: (guest: any) => void;
  initial?: Partial<any>;
}

export function AddGuestDialog({
  trigger,
  onCreated,
  initial,
}: AddGuestDialogProps) {
  const [open, setOpen] = useState(false);
  const [dob, setDob] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    idType: "CCCD",
    idNumber: "",
  });

  // populate from initial
  useEffect(() => {
    if (!initial) return;
    setFormData((prev) => ({
      ...prev,
      fullName: initial.fullName || prev.fullName,
      email: initial.email || prev.email,
      phone: initial.phone || prev.phone,
      idType: initial.idType || prev.idType,
      idNumber: initial.idNumber || prev.idNumber,
    }));
  }, [initial]);

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

  const validateDob = (dobString: string): string => {
    if (!dobString) {
      return "Ngày sinh là bắt buộc";
    }

    const birthDate = new Date(dobString);
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

    const dobError = validateDob(dob);
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
      dob: dob,
      idType: formData.idType,
      idNumber: formData.idNumber.trim(),
    };

    try {
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
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Thêm khách hàng thất bại"
      );
    }

    setFormData({
      fullName: "",
      email: "",
      phone: "",
      idType: "CCCD",
      idNumber: "",
    });
    setDob("");
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gray-700 hover:bg-gray-800 text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm Khách Hàng
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-800">
            Thêm Khách Hàng Mới
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

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label
              htmlFor="dob"
              className="text-gray-800 flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              Ngày Sinh *
            </Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dob ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
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
              className="flex-1 bg-gray-700 hover:bg-gray-800 text-white"
            >
              Thêm Khách Hàng
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
