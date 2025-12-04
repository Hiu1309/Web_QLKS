import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { PaymentDialog } from "./PaymentDialog";
import { Search, Eye, CreditCard, CheckCircle } from "lucide-react";

interface Invoice {
  id: string;
  reservationId: string;
  guestName: string;
  email: string;
  phone: string;
  roomNumber: string;
  roomType: string;
  roomPrice: number;
  nights: number;
  checkIn: string;
  checkOut: string;
  isPaid: boolean;
}

// Mock invoice data (from checked-out reservations)
const invoices: Invoice[] = [
  {
    id: "INV001",
    reservationId: "RES003",
    guestName: "Arjun Gupta",
    email: "arjun.gupta@email.com",
    phone: "+91 76543 21098",
    roomNumber: "105",
    roomType: "Deluxe",
    roomPrice: 14720,
    nights: 2,
    checkIn: "2024-12-19",
    checkOut: "2024-12-21",
    isPaid: false,
  },
  {
    id: "INV002",
    reservationId: "RES007",
    guestName: "Meera Sharma",
    email: "meera.sharma@email.com",
    phone: "+91 98765 12345",
    roomNumber: "201",
    roomType: "Deluxe",
    roomPrice: 14720,
    nights: 3,
    checkIn: "2024-12-15",
    checkOut: "2024-12-18",
    isPaid: true,
  },
  {
    id: "INV003",
    reservationId: "RES008",
    guestName: "Rohan Patel",
    email: "rohan.patel@email.com",
    phone: "+91 87654 23456",
    roomNumber: "103",
    roomType: "Standard",
    roomPrice: 9800,
    nights: 1,
    checkIn: "2024-12-18",
    checkOut: "2024-12-19",
    isPaid: false,
  },
];

// Mock services data
const availableServices = [
  { id: "SRV001", name: "Giặt là", price: 500, category: "Dịch vụ phòng" },
  { id: "SRV002", name: "Spa & Massage", price: 2500, category: "Chăm sóc" },
  { id: "SRV003", name: "Bữa sáng buffet", price: 800, category: "Ăn uống" },
  {
    id: "SRV004",
    name: "Dọn phòng bổ sung",
    price: 300,
    category: "Dịch vụ phòng",
  },
  { id: "SRV005", name: "Mini bar", price: 1200, category: "Ăn uống" },
  {
    id: "SRV006",
    name: "Đưa đón sân bay",
    price: 1500,
    category: "Vận chuyển",
  },
  { id: "SRV007", name: "Thuê xe", price: 3000, category: "Vận chuyển" },
  { id: "SRV008", name: "Room service", price: 600, category: "Ăn uống" },
];

export function InvoiceManagement() {
  const [invoicesList, setInvoicesList] = useState(invoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const handlePaymentComplete = (
    invoiceId: string,
    totalAmount: number,
    paymentMethod: string,
    services: any[]
  ) => {
    setInvoicesList(
      invoicesList.map((inv) =>
        inv.id === invoiceId ? { ...inv, isPaid: true } : inv
      )
    );

    console.log("Tổng tiền:", totalAmount);
    console.log("Phương thức:", paymentMethod);
    console.log("Dịch vụ:", services);
  };

  const filteredInvoices = invoicesList.filter(
    (invoice) =>
      invoice.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-700">Hóa Đơn</h1>
          <p className="text-slate-600">
            Quản lý hóa đơn thanh toán của khách sạn
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Tìm kiếm theo tên khách, mã hóa đơn hoặc số phòng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white border-slate-200"
        />
      </div>

      {/* Invoices Table */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-700">Danh Sách Hóa Đơn</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-600">Mã Hóa Đơn</TableHead>
                <TableHead className="text-slate-600">Khách Hàng</TableHead>
                <TableHead className="text-slate-600">Phòng</TableHead>
                <TableHead className="text-slate-600">Giá Phòng</TableHead>
                <TableHead className="text-slate-600">Đêm</TableHead>
                <TableHead className="text-slate-600">Tổng</TableHead>
                <TableHead className="text-slate-600">Trạng Thái</TableHead>
                <TableHead className="text-slate-600">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-700">
                    {invoice.id}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-700">
                        {invoice.guestName}
                      </p>
                      <p className="text-sm text-slate-500">{invoice.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-700">
                        {invoice.roomNumber}
                      </p>
                      <p className="text-sm text-slate-500">
                        {invoice.roomType}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {invoice.roomPrice.toLocaleString("vi-VN")} đ
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {invoice.nights}
                  </TableCell>
                  <TableCell className="font-medium text-emerald-600">
                    {(invoice.roomPrice * invoice.nights).toLocaleString(
                      "vi-VN"
                    )}{" "}
                    đ
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        invoice.isPaid
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {invoice.isPaid ? "Đã Thanh Toán" : "Chờ Thanh Toán"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice)}
                            className="border-slate-300 hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-white">
                          <DialogHeader>
                            <DialogTitle className="text-slate-700">
                              Chi Tiết Hóa Đơn
                            </DialogTitle>
                          </DialogHeader>
                          {selectedInvoice && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <Label className="text-slate-600">
                                    Mã Hóa Đơn
                                  </Label>
                                  <p className="font-medium text-slate-700">
                                    {selectedInvoice.id}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">
                                    Trạng Thái
                                  </Label>
                                  <Badge
                                    className={`mt-1 ${
                                      selectedInvoice.isPaid
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {selectedInvoice.isPaid
                                      ? "Đã Thanh Toán"
                                      : "Chờ Thanh Toán"}
                                  </Badge>
                                </div>
                                <div>
                                  <Label className="text-slate-600">
                                    Khách Hàng
                                  </Label>
                                  <p className="font-medium text-slate-700">
                                    {selectedInvoice.guestName}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">
                                    Điện Thoại
                                  </Label>
                                  <p className="font-medium text-slate-700">
                                    {selectedInvoice.phone}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">
                                    Phòng
                                  </Label>
                                  <p className="font-medium text-slate-700">
                                    {selectedInvoice.roomNumber} (
                                    {selectedInvoice.roomType})
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">
                                    Giá Phòng/Đêm
                                  </Label>
                                  <p className="font-medium text-slate-700">
                                    {selectedInvoice.roomPrice.toLocaleString(
                                      "vi-VN"
                                    )}{" "}
                                    đ
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">
                                    Nhận Phòng
                                  </Label>
                                  <p className="font-medium text-slate-700">
                                    {selectedInvoice.checkIn}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">
                                    Trả Phòng
                                  </Label>
                                  <p className="font-medium text-slate-700">
                                    {selectedInvoice.checkOut}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">
                                    Số Đêm
                                  </Label>
                                  <p className="font-medium text-slate-700">
                                    {selectedInvoice.nights} đêm
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-slate-600">
                                    Tổng Tiền Phòng
                                  </Label>
                                  <p className="font-medium text-emerald-600">
                                    ₹
                                    {(
                                      selectedInvoice.roomPrice *
                                      selectedInvoice.nights
                                    ).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {!invoice.isPaid && (
                        <PaymentDialog
                          invoice={invoice}
                          availableServices={availableServices}
                          onPaymentComplete={handlePaymentComplete}
                          trigger={
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Thanh Toán
                            </Button>
                          }
                        />
                      )}

                      {invoice.isPaid && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-300 text-green-700 hover:bg-green-50"
                          disabled
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Đã Thanh Toán
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-500">
            Không tìm thấy hóa đơn nào phù hợp với tiêu chí của bạn.
          </p>
        </div>
      )}
    </div>
  );
}
