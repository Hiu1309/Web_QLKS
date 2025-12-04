import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Utensils, Sparkles, Edit, Trash2, CheckCircle } from "lucide-react";
import { AddEditServiceDialog } from "./AddEditServiceDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface ItemType {
  itemTypeId: number;
  typeName: string;
}

interface Service {
  itemId: number;
  itemName: string;
  price: number;
  status: string;
  image?: string;
  itemType?: ItemType;
}

export function ServicesManagement() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/api/items")
      .then((res) => res.json())
      .then((data: Service[]) => {
        setServicesList(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading services:", err);
        setServicesList([]);
        setLoading(false);
      });
  }, []);

  const filteredServices = servicesList.filter(
    (service) =>
      selectedCategory === "all" || service.status === selectedCategory
  );

  const handleDelete = (itemId: number, itemName: string) => {
    // Dialog handled via AlertDialog component
    fetch(`http://localhost:8080/api/items/${itemId}`, {
      method: "DELETE",
    })
      .then(() => {
        setServicesList(servicesList.filter((s) => s.itemId !== itemId));
      })
      .catch((err) => console.error("Error deleting service:", err));
  };

  const categories = ["all", "Còn hoạt động", "Ngưng hoạt động"];

  const categoryLabels = {
    all: "Tất Cả",
    "Còn hoạt động": "Còn Hoạt Động",
    "Ngưng hoạt động": "Ngưng Hoạt Động",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src="http://localhost:8080/uploads/services/header.jpg"
          alt="Dịch vụ khách sạn"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-800/50 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 via-white to-gray-400"></div>
        <div className="absolute inset-0 flex items-center justify-start p-6">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              Quản Lý Dịch Vụ
            </h1>
            <p className="text-xl opacity-90 text-white/80">
              Quản lý dịch vụ và tiện ích khách sạn
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                <CheckCircle className="h-5 w-5 text-white" />
                <span className="font-semibold">{servicesList.length}</span>
                <span className="text-sm opacity-80">Dịch Vụ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 -mt-16 relative z-10">
        {/* Category Filters */}
        <Card className="shadow-sm bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-800">Trạng Thái Dịch Vụ</h2>
              <AddEditServiceDialog
                onSave={(newService) => {
                  setServicesList([...servicesList, newService]);
                }}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center gap-2 ${
                    selectedCategory === category
                      ? "bg-gray-700 hover:bg-gray-800 text-white"
                      : "border-gray-300 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Đang tải dữ liệu dịch vụ...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card
                key={service.itemId}
                className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group bg-white border-gray-200"
              >
                {/* Service Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  {service.image ? (
                    <ImageWithFallback
                      src={`http://localhost:8080/${service.image}`}
                      alt={service.itemName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Sparkles className="h-12 w-12 text-gray-400" />
                  )}
                  <div className="absolute top-3 left-3">
                    <span
                      style={{
                        backgroundColor: "#e5e7eb",
                        color: "#111",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "0.25rem",
                        fontWeight: 500,
                        fontSize: "0.75rem",
                      }}
                    >
                      {service.itemType?.typeName || "Dịch Vụ"}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        boxShadow: "0 0 4px rgba(0,0,0,0.3)",
                        backgroundColor:
                          service.status === "Còn hoạt động"
                            ? "#22c55e"
                            : "#ef4444",
                      }}
                    ></div>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-slate-800">
                    {service.itemName}
                  </CardTitle>
                  <p className="text-lg font-semibold text-gray-800 mt-1">
                    {service.price.toLocaleString("vi-VN")}₫
                  </p>
                </CardHeader>

                <CardContent className="flex justify-center pb-2">
                  <span
                    style={{
                      backgroundColor:
                        service.status === "Còn hoạt động"
                          ? "#22c55e"
                          : "#ef4444",
                      color: "#fff",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.375rem",
                      fontWeight: 500,
                      fontSize: "0.875rem",
                    }}
                  >
                    {service.status === "Còn hoạt động"
                      ? "Còn Hoạt Động"
                      : "Ngưng Hoạt Động"}
                  </span>
                </CardContent>

                <CardContent className="flex justify-center gap-2 pt-2">
                  <AddEditServiceDialog
                    service={service}
                    trigger={
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    }
                    onSave={(updatedService) => {
                      setServicesList(
                        servicesList.map((s) =>
                          s.itemId === service.itemId ? updatedService : s
                        )
                      );
                    }}
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Xác nhận xóa dịch vụ
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn xóa dịch vụ "{service.itemName}
                          "? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDelete(service.itemId, service.itemName)
                          }
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Xóa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredServices.length === 0 && (
          <Card className="py-12 bg-white border-gray-200">
            <CardContent className="text-center">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Không tìm thấy dịch vụ nào trong danh mục này.
              </p>
              <Button
                variant="outline"
                className="mt-4 border-gray-300 hover:bg-gray-100"
                onClick={() => setSelectedCategory("all")}
              >
                Xem Tất Cả Dịch Vụ
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
