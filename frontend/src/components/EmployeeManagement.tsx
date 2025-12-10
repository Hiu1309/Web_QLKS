import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
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
import { AddEditEmployeeDialog } from "./AddEditEmployeeDialog";
import { Search, Plus, Edit, Trash2, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface Employee {
  userId: number;
  username?: string;
  fullName: string;
  phone: string;
  email: string;
  dob: string;
  roleName: string;
  createdAt: string;
  password?: string;
}

const roleColors: Record<string, string> = {
  "Lễ tân": "bg-blue-100 text-blue-800",
  "Buồng phòng": "bg-green-100 text-green-800",
  "Quản lý": "bg-purple-100 text-purple-800",
};

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch employees from database
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/users");
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      toast.error("Không thể tải danh sách nhân viên");
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      (employee.username || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.userId.toString().includes(searchTerm) ||
      employee.phone?.includes(searchTerm);
    const matchesRole =
      roleFilter === "all" || employee.roleName === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleAddEmployee = (employee: Employee) => {
    fetchEmployees(); // Reload list after adding
  };

  const handleEditEmployee = (employee: Employee) => {
    fetchEmployees(); // Reload list after editing
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = async (userId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/users/${userId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete employee");
      toast.success("Đã xóa nhân viên thành công");
      fetchEmployees();
    } catch (error) {
      toast.error("Không thể xóa nhân viên");
      console.error("Error deleting employee:", error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const calculateAge = (dateString: string) => {
    if (!dateString) return "-";
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const roleStats = {
    total: employees.length,
    receptionist: employees.filter((emp) => emp.roleName === "Lễ tân").length,
    housekeeping: employees.filter((emp) => emp.roleName === "Buồng phòng")
      .length,
    manager: employees.filter((emp) => emp.roleName === "Quản lý").length,
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-700">Quản Lý Nhân Viên</h1>
          <p className="text-slate-600">
            Quản lý thông tin nhân viên khách sạn
          </p>
        </div>
        <AddEditEmployeeDialog
          trigger={
            <Button className="bg-gray-700 hover:bg-gray-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Thêm Nhân Viên
            </Button>
          }
          onSave={handleAddEmployee}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">
              Tổng Nhân Viên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700">
              {roleStats.total}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Lễ Tân</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {roleStats.receptionist}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">
              Buồng Phòng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {roleStats.housekeeping}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Quản Lí</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {roleStats.manager}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm theo tên, email, số điện thoại hoặc mã nhân viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white border-slate-200"
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[220px] bg-white border-slate-200">
            <SelectValue placeholder="Lọc theo chức vụ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất Cả Chức Vụ</SelectItem>
            <SelectItem value="Lễ tân">Lễ Tân</SelectItem>
            <SelectItem value="Buồng phòng">Buồng Phòng</SelectItem>
            <SelectItem value="Quản lý">Quản Lý</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employees Table */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-700">Danh Sách Nhân Viên</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-slate-600">Mã NV</TableHead>
                <TableHead className="text-slate-600">Tên Nhân Viên</TableHead>
                <TableHead className="text-slate-600">Số Điện Thoại</TableHead>
                <TableHead className="text-slate-600">Email</TableHead>
                <TableHead className="text-slate-600">Ngày Vào Làm</TableHead>
                <TableHead className="text-slate-600">Ngày Sinh</TableHead>
                <TableHead className="text-slate-600">Tuổi</TableHead>
                <TableHead className="text-slate-600">Chức Vụ</TableHead>
                <TableHead className="text-slate-600">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.userId} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-700">
                    {employee.userId}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-700">
                        {employee.fullName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {employee.phone || "-"}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {employee.email || "-"}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatDate(employee.createdAt)}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatDate(employee.dob)}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {calculateAge(employee.dob)} tuổi
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        roleColors[employee.roleName] ||
                        "bg-gray-100 text-gray-800"
                      }
                    >
                      {employee.roleName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <AddEditEmployeeDialog
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-300 hover:bg-slate-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                        employee={employee}
                        onSave={handleEditEmployee}
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-slate-700">
                              Xác Nhận Xóa
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-600">
                              Bạn có chắc chắn muốn xóa nhân viên{" "}
                              <span className="font-semibold">
                                {employee.username}
                              </span>
                              ? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-slate-300">
                              Hủy
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteEmployee(employee.userId)
                              }
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-500">
            Không tìm thấy nhân viên nào phù hợp với tiêu chí của bạn.
          </p>
        </div>
      )}
    </div>
  );
}
