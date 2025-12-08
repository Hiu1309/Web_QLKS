import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Search, Eye, Mail, Phone, Users, IdCard } from "lucide-react";
import { AddEditGuestDialog } from "./AddEditGuestDialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { StayHistoryDialog } from "./StayHistoryDialog";

const API_BASE =
  ((import.meta as any).env?.VITE_API_BASE as string) ||
  (import.meta as any).env?.VITE_API ||
  "http://localhost:8080";

interface ApiGuest {
  guestId: number;
  fullName: string;
  email: string;
  phone: string;
  dob?: string;
  idType: string;
  idNumber: string;
  createdAt?: string;
}

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

const formatIdDisplay = (idType?: string, idNumber?: string) => {
  const normalized = (idType || "").toLowerCase();
  let label = "Giấy tờ";
  if (normalized.includes("cccd")) {
    label = "CCCD";
  } else if (normalized.includes("hộ chiếu")) {
    label = "Hộ chiếu";
  } else if (idType) {
    label = idType;
  }

  if (!idNumber) return `${label}: -`;
  return `${label}: ${idNumber}`;
};

export function GuestManagement() {
  const [guestsList, setGuestsList] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/guests`);
      if (!res.ok) throw new Error("Failed to fetch guests");
      const data: ApiGuest[] = await res.json();
      const mapped: Guest[] = (data || []).map((guest) => ({
        id: guest.guestId?.toString() ?? "",
        name: guest.fullName || "Khách lẻ",
        email: guest.email || "",
        phone: guest.phone || "",
        dob: guest.dob || "",
        createdAt: guest.createdAt || "",
        idType: guest.idType || "",
        idNumber: guest.idNumber || "",
      }));
      setGuestsList(mapped);
    } catch (err) {
      console.error("Failed to load guests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const filteredGuests = useMemo(() => {
    return guestsList.filter((guest) => {
      const matchesSearch =
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.phone.includes(searchTerm);

      return matchesSearch;
    });
  }, [guestsList, searchTerm]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN");
    } catch {
      return "-";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* HEADER */}
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src="http://localhost:8080/uploads/guests-header.jpg"
          alt="Hotel guests"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-800/60 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 via-white to-gray-400"></div>
        <div className="absolute inset-0 flex items-center justify-start p-6">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              Quản lý khách hàng
            </h1>
            <p className="text-lg opacity-90 text-white/80">
              Theo dõi hồ sơ khách và thông tin liên hệ để phục vụ tốt hơn
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                <Users className="h-5 w-5 text-white" />
                <span className="font-semibold text-white">
                  {guestsList.length}
                </span>
                <span className="text-sm opacity-80 text-white">
                  Khách Hàng
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 -mt-16 relative z-10">
        <Card className="shadow-sm bg-white border-gray-200">
          <CardContent className="flex flex-col sm:flex-row gap-4 items-center justify-between p-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm khách theo tên, email hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 bg-white"
              />
            </div>
            <AddEditGuestDialog
              mode="add"
              onCreated={() => {
                fetchGuests();
              }}
            />
          </CardContent>
        </Card>

        {/* Guest Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-slate-500 col-span-full">
              Đang tải khách hàng...
            </p>
          ) : filteredGuests.length > 0 ? (
            filteredGuests.map((guest) => (
              <Card
                key={guest.id}
                className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="bg-slate-200">
                        <AvatarFallback className="text-slate-700">
                          {getInitials(guest.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg text-slate-700">
                          {guest.name}
                        </CardTitle>
                        <p className="text-sm text-slate-500">ID: {guest.id}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <IdCard className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">
                        {formatIdDisplay(guest.idType, guest.idNumber)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">
                        {guest.phone || "-"}
                      </span>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full border-slate-300 hover:bg-slate-50"
                        onClick={() => setSelectedGuest(guest)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Xem Chi Tiết
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-white">
                      <DialogHeader>
                        <DialogTitle className="text-slate-700">
                          Hồ Sơ Khách Hàng
                        </DialogTitle>
                      </DialogHeader>
                      {selectedGuest && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 bg-slate-200">
                              <AvatarFallback className="text-slate-700">
                                {getInitials(selectedGuest.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-slate-700 font-semibold">
                                {selectedGuest.name}
                              </h3>
                              <p className="text-slate-500 text-sm">
                                ID Khách: {selectedGuest.id}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label className="text-slate-600">
                                Thông Tin Cá Nhân
                              </Label>
                              <div className="mt-2 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-500">ID:</span>
                                  <span className="text-slate-600 font-medium">
                                    {selectedGuest.id}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-500">
                                    Ngày sinh:
                                  </span>
                                  <span className="text-slate-600 font-medium">
                                    {formatDate(selectedGuest.dob)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-500">
                                    Ngày tạo:
                                  </span>
                                  <span className="text-slate-600 font-medium">
                                    {formatDate(selectedGuest.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label className="text-slate-600">
                                Thông Tin Liên Hệ
                              </Label>
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-slate-400" />
                                  <span className="text-sm text-slate-600">
                                    {selectedGuest.email || "-"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-slate-400" />
                                  <span className="text-sm text-slate-600">
                                    {selectedGuest.phone || "-"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <Label className="text-slate-600">
                                Giấy Tờ Tùy Thân
                              </Label>
                              <div className="mt-2">
                                <p className="text-sm text-slate-600">
                                  {formatIdDisplay(
                                    selectedGuest.idType,
                                    selectedGuest.idNumber
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4">
                            {selectedGuest && (
                              <AddEditGuestDialog
                                mode="edit"
                                guest={selectedGuest}
                                onUpdated={(updatedGuest) => {
                                  setSelectedGuest(updatedGuest);
                                  fetchGuests();
                                }}
                              />
                            )}
                            {selectedGuest && (
                              <StayHistoryDialog guestId={selectedGuest.id} />
                            )}
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200 col-span-full">
              <p className="text-slate-500">
                Không tìm thấy khách hàng nào phù hợp với tiêu chí tìm kiếm.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GuestManagement;
