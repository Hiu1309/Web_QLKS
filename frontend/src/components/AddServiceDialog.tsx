import { useState } from "react";
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
import { Plus, Sparkles, DollarSign, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface AddServiceDialogProps {
  trigger?: React.ReactNode;
  onCreated?: (service: any) => void;
}

export function AddServiceDialog({
  trigger,
  onCreated,
}: AddServiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    itemName: "",
    price: "",
    status: "Còn hoạt động",
    image: "uploads/services/",
    itemTypeId: "1",
  });

  const [itemTypes, setItemTypes] = useState([
    { itemTypeId: 1, typeName: "Tiện ích" },
    { itemTypeId: 2, typeName: "Sức khỏe" },
    { itemTypeId: 3, typeName: "Ăn uống" },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.itemName || !formData.price) {
      toast.error("Vui lòng nhập tên dịch vụ và giá");
      return;
    }

    try {
      const payload = {
        itemName: formData.itemName,
        price: parseFloat(formData.price),
        status: formData.status,
        image: formData.image || null,
        itemType: {
          itemTypeId: parseInt(formData.itemTypeId),
        },
      };

      const res = await fetch("http://localhost:8080/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Add service failed");

      const data = await res.json();
      toast.success("Thêm dịch vụ thành công!");
      onCreated && onCreated(data);
      setOpen(false);
      setFormData({
        itemName: "",
        price: "",
        status: "Còn hoạt động",
        image: "uploads/services/",
        itemTypeId: "1",
      });
    } catch (err) {
      console.error(err);
      toast.error("Thêm dịch vụ thất bại!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gray-700 hover:bg-gray-800 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Thêm Dịch Vụ
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-800">
            Thêm Dịch Vụ Mới
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Tạo dịch vụ mới để cung cấp cho khách hàng
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Thông Tin Cơ Bản */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Thông Tin Cơ Bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemName">Tên Dịch Vụ *</Label>
                <Input
                  id="itemName"
                  value={formData.itemName}
                  onChange={(e) =>
                    setFormData({ ...formData, itemName: e.target.value })
                  }
                  required
                  className="border-gray-300 focus:border-gray-500"
                  placeholder=""
                />
              </div>
              <div>
                <Label htmlFor="itemTypeId">Loại Dịch Vụ *</Label>
                <Select
                  value={formData.itemTypeId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, itemTypeId: value })
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {itemTypes.map((type) => (
                      <SelectItem
                        key={type.itemTypeId}
                        value={type.itemTypeId.toString()}
                      >
                        {type.typeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Giá & Trạng Thái */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Giá & Trạng Thái
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Giá (VNĐ) *</Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                    className="pr-8 border-gray-300 focus:border-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0"
                    min="0"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₫
                  </span>
                </div>
              </div>
              <div>
                <Label htmlFor="status">Trạng Thái *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Còn hoạt động">Còn Hoạt Động</SelectItem>
                    <SelectItem value="Ngưng hoạt động">
                      Ngưng Hoạt Động
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Hình Ảnh */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Hình Ảnh
            </h3>
            <div>
              <Label htmlFor="image">Đường Dẫn Hình Ảnh</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                className="border-gray-300 focus:border-gray-500"
                placeholder="uploads/services/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ví dụ: uploads/services/massage.jpg
              </p>
            </div>
          </div>

          {/* Nút Hành Động */}
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
              Thêm Dịch Vụ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
