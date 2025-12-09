import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import {
  CreditCard,
  Wallet,
  Printer,
  CheckCircle2,
  DollarSign,
  QrCode,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { handlePrintInvoice } from "./InvoicePrinter";

interface Service {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface Invoice {
  id: string;
  reservationId: string;
  guestName: string;
  phone: string;
  roomNumber: string;
  roomType: string;
  roomPrice: number;
  nights: number;
  checkIn: string;
  checkOut: string;
  idType?: string;
  idNumber?: string;
  paymentMethod: string;
  status: string;
  isPaid: boolean;
  createdByUser: string;
}

const API_BASE =
  ((import.meta as any).env?.VITE_API_BASE as string) ||
  (import.meta as any).env?.VITE_API ||
  "http://localhost:8080";

const formatIdDisplay = (idType?: string, idNumber?: string) => {
  const normalized = (idType || "").toLowerCase();
  let label = "Giấy tờ";
  if (
    normalized.includes("cccd") ||
    normalized.includes("cmnd") ||
    normalized.includes("national")
  ) {
    label = "CCCD";
  } else if (normalized.includes("passport")) {
    label = "Hộ chiếu";
  } else if (idType) {
    label = idType;
  }

  if (!idNumber) return `${label}: -`;
  return `${label}: ${idNumber}`;
};

interface PaymentDialogProps {
  invoice: Invoice;
  availableServices: Service[];
  onPaymentComplete: (
    invoiceId: string,
    totalAmount: number,
    paymentMethod: string,
    services: Service[]
  ) => void;
  trigger?: React.ReactNode;
}

export function PaymentDialog({
  invoice,
  availableServices,
  onPaymentComplete,
  trigger,
}: PaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [cashReceived, setCashReceived] = useState<string>("");

  const roomTotal = invoice.roomPrice * invoice.nights;
  const servicesTotal = selectedServices.reduce(
    (sum, service) => sum + service.price,
    0
  );
  const grandTotal = roomTotal + servicesTotal;
  const change = cashReceived
    ? Math.max(0, parseFloat(cashReceived) - grandTotal)
    : 0;

  const handleServiceToggle = (service: Service, checked: boolean) => {
    if (checked) {
      setSelectedServices([...selectedServices, service]);
    } else {
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
    }
  };

  const handlePayment = async () => {
    if (
      paymentMethod === "cash" &&
      (!cashReceived || parseFloat(cashReceived) < grandTotal)
    ) {
      toast.error("Số tiền không đủ!", {
        description: "Vui lòng nhập số tiền lớn hơn hoặc bằng tổng tiền.",
      });
      return;
    }

    try {
      // 1. Cập nhật status và payment method của invoice
      const updateResponse = await fetch(
        `${API_BASE}/api/invoices/${invoice.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Đã thanh toán",
            paymentMethod:
              paymentMethod === "cash" ? "Tiền mặt" : "Chuyển khoản",
            balance: grandTotal,
            currency: "VND",
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Cập nhật hóa đơn thất bại");
      }

      // 2. Nếu có dịch vụ được chọn, thêm vào invoice_item
      if (selectedServices.length > 0) {
        for (const service of selectedServices) {
          // Cắt prefix "SRV" từ service.id để lấy itemId
          // service.id format: "SRV1", "SRV2", etc. → lấy phần số
          const itemId = service.id.startsWith("SRV")
            ? service.id.substring(3)
            : service.id;
          console.log(
            `Service ID: ${service.id}, Item ID: ${itemId}, Name: ${service.name}`
          );
          const itemResponse = await fetch(
            `${API_BASE}/api/invoices/${invoice.id}/services/${itemId}?amount=${service.price}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!itemResponse.ok) {
            console.warn(
              `Lỗi thêm dịch vụ ${service.name}: ${itemResponse.status}`
            );
          }
        }
      }

      onPaymentComplete(
        invoice.id,
        grandTotal,
        paymentMethod,
        selectedServices
      );
      setOpen(false);
      toast.success("Thanh toán thành công!", {
        description: `Đã thanh toán ${grandTotal.toLocaleString(
          "vi-VN"
        )} đ bằng ${paymentMethod === "cash" ? "tiền mặt" : "chuyển khoản"}.`,
      });
    } catch (error) {
      console.error("Lỗi thanh toán:", error);
      toast.error("Lỗi thanh toán!", {
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại",
      });
    }
  };

  const handlePrintBill = () => {
    // In hóa đơn chi tiết thay vì window.print()
    handlePrintInvoice({
      invoice,
      services: selectedServices,
      roomTotal: invoice.roomPrice * invoice.nights,
      servicesTotal: selectedServices.reduce(
        (sum, service) => sum + service.price,
        0
      ),
      grandTotal,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Thanh Toán</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            Thanh Toán Hóa Đơn
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Invoice Information */}
            <Card className="border-2 border-gray-200">
              <CardContent className="p-5">
                <h3 className="font-semibold text-lg mb-4">
                  Thông Tin Hóa Đơn
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã hóa đơn:</span>
                    <span className="font-medium">{invoice.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Khách hàng:</span>
                    <span className="font-medium">{invoice.guestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giấy tờ</span>
                    <span className="font-medium">
                      {formatIdDisplay(invoice.idType, invoice.idNumber)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phòng:</span>
                    <span className="font-medium">
                      {invoice.roomNumber} ({invoice.roomType})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nhận phòng:</span>
                    <span className="font-medium">{invoice.checkIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trả phòng:</span>
                    <span className="font-medium">{invoice.checkOut}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số đêm:</span>
                    <span className="font-medium">{invoice.nights} đêm</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services Selection */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Dịch Vụ Sử Dụng</h3>
              <div className="border rounded-lg p-4 max-h-80 overflow-y-auto space-y-3 bg-gray-50">
                {availableServices.map((service) => {
                  const isSelected = selectedServices.some(
                    (s) => s.id === service.id
                  );
                  return (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={service.id}
                          checked={isSelected}
                          onCheckedChange={(checked: boolean) =>
                            handleServiceToggle(service, checked)
                          }
                        />
                        <Label
                          htmlFor={service.id}
                          className="cursor-pointer flex-1"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {service.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {service.category}
                            </p>
                          </div>
                        </Label>
                      </div>
                      <Badge variant="outline" className="font-semibold">
                        {service.price.toLocaleString("vi-VN")} đ
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — MOVED PAYMENT SUMMARY HERE */}
          <div className="space-y-6">
            {/* --- CHI TIẾT THANH TOÁN --- */}
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold text-lg mb-4">
                  Chi Tiết Thanh Toán
                </h3>

                <div className="space-y-2">
                  {/* Room Details */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tên phòng:</span>
                    <span className="font-medium text-gray-900">
                      {invoice.roomType} - {invoice.roomNumber}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giá/đêm:</span>
                    <span className="font-medium text-gray-900">
                      {invoice.roomPrice.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Số đêm:</span>
                    <span className="font-medium text-gray-900">
                      {invoice.nights} đêm
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-gray-700">Tiền phòng:</span>
                    <span className="text-gray-900">
                      {roomTotal.toLocaleString("vi-VN")} đ
                    </span>
                  </div>

                  {selectedServices.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      <div className="flex justify-between text-sm font-medium mb-2">
                        <span className="text-gray-700">Dịch vụ:</span>
                        <span className="text-gray-900">
                          {servicesTotal.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                      <div className="space-y-1 pl-4">
                        {selectedServices.map((service) => (
                          <div
                            key={service.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-600">
                              • {service.name}
                            </span>
                            <span className="text-gray-600">
                              {service.price.toLocaleString("vi-VN")} đ
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <Separator className="my-3" />

                  <div className="flex justify-between items-center pt-2 ">
                    <span className="font-bold text-lg text-gray-900">
                      Tổng Cộng
                    </span>
                    <span className="font-bold text-2xl text-blue-900">
                      {grandTotal.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* --- PAYMENT METHODS BELOW SUMMARY --- */}
            <div>
              <h3 className="font-semibold text-lg mb-3">
                Phương Thức Thanh Toán
              </h3>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <div className="space-y-3">
                  {/* Cash */}
                  <div className="border-2 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label
                        htmlFor="cash"
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Wallet className="h-5 w-5 text-green-700" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Tiền Mặt</p>
                          <p className="text-xs text-gray-500">
                            Thanh toán trực tiếp tại quầy
                          </p>
                        </div>
                      </Label>
                    </div>

                    {paymentMethod === "cash" && (
                      <div className="space-y-3 mt-4 pt-4 border-t">
                        <Label htmlFor="cash-received">
                          Tiền khách đưa (đ)
                        </Label>
                        <Input
                          id="cash-received"
                          type="number"
                          value={cashReceived}
                          onChange={(e) => setCashReceived(e.target.value)}
                          placeholder="Nhập số tiền khách đưa"
                          className="text-lg"
                        />

                        {cashReceived && (
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex justify-between mb-2">
                              <span className="text-sm text-blue-800">
                                Tổng tiền:
                              </span>
                              <span className="font-semibold text-blue-900">
                                {grandTotal.toLocaleString("vi-VN")} đ
                              </span>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm text-blue-800">
                                Tiền nhận:
                              </span>
                              <span className="font-semibold text-blue-900">
                                {parseFloat(cashReceived).toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                đ
                              </span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-blue-900">
                                Tiền thối:
                              </span>
                              <span className="font-bold text-xl text-blue-900">
                                {change.toLocaleString("vi-VN")} đ
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bank Transfer */}
                  <div className="border-2 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <RadioGroupItem value="transfer" id="transfer" />
                      <Label
                        htmlFor="transfer"
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CreditCard className="h-5 w-5 text-blue-700" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Chuyển Khoản
                          </p>
                          <p className="text-xs text-gray-500">
                            Quét mã QR để thanh toán
                          </p>
                        </div>
                      </Label>
                    </div>

                    {paymentMethod === "transfer" && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex flex-col items-center p-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
                          <ImageWithFallback
                            src="http://localhost:8080/uploads/qr_code.jpg"
                            alt="QR Code Payment"
                            className="w-48 h-48 object-cover rounded-lg mb-3"
                          />
                          <p className="text-sm text-gray-600 mb-2">
                            Quét mã QR để thanh toán
                          </p>
                          <p className="font-bold text-lg text-gray-900">
                            {grandTotal.toLocaleString("vi-VN")} đ
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col gap-3 pt-4 max-w-sm mx-auto w-full">
              <Button
                className="w-full bg-gray-900 hover:bg-gray-800 h-12"
                onClick={handlePayment}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Xác Nhận Thanh Toán
              </Button>
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={handlePrintBill}
              >
                <Printer className="h-5 w-5 mr-2" />
                In Hóa Đơn
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
