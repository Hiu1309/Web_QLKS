import { useState } from "react";
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
import { AddEmployeeDialog } from "./AddEmployeeDialog";
import { Search, Plus, Edit, Trash2, UserCheck } from "lucide-react";

type EmployeeRole = "receptionist" | "housekeeping" | "manager";

interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  dateBirth: string;
  role: EmployeeRole;
}

// Mock employee data
const initialEmployees: Employee[] = [
  {
    id: "1",
    name: "Trần Văn A",
    phone: "098765 43210",
    email: "raj.sharma@hha.com",
    dateBirth: "1990-05-15",
    role: "manager",
  },
  {
    id: "2",
    name: "Nguyễn Thị B",
    phone: "087654 32109",
    email: "priya.patel@hha.com",
    dateBirth: "1995-08-22",
    role: "receptionist",
  },
  {
    id: "3",
    name: "Nguyễn Văn C",
    phone: "076543 21098",
    email: "arjun.gupta@hha.com",
    dateBirth: "1992-03-10",
    role: "receptionist",
  },
  {
    id: "4",
    name: "Nguyễn Thị D",
    phone: "065432 10987",
    email: "ananya.iyer@hha.com",
    dateBirth: "1993-11-28",
    role: "housekeeping",
  },
  {
    id: "5",
    name: "Trần Văn E",
    phone: "054321 09876",
    email: "vikram.singh@hha.com",
    dateBirth: "1994-07-05",
    role: "housekeeping",
  },
  {
    id: "6",
    name: "Lê Thị F",
    phone: "043210 98765",
    email: "kavya.reddy@hha.com",
    dateBirth: "1991-12-18",
    role: "housekeeping",
  },
  {
    id: "7",
    name: "Võ Văn G",
    phone: "032109 87654",
    email: "amit.desai@hha.com",
    dateBirth: "1989-04-30",
    role: "manager",
  },
];

const roleColors = {
  receptionist: "bg-blue-100 text-blue-800",
  housekeeping: "bg-green-100 text-green-800",
  manager: "bg-purple-100 text-purple-800",
};

const getRoleLabel = (role: EmployeeRole) => {
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

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone.includes(searchTerm);
    const matchesRole = roleFilter === "all" || employee.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleAddEmployee = (employee: Employee) => {
    setEmployees([...employees, employee]);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEmployees(
      employees.map((emp) => (emp.id === employee.id ? employee : emp))
    );
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const calculateAge = (dateString: string) => {
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
    receptionist: employees.filter((emp) => emp.role === "receptionist").length,
    housekeeping: employees.filter((emp) => emp.role === "housekeeping").length,
    manager: employees.filter((emp) => emp.role === "manager").length,
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-slate-700">Quản Lý Nhân Viên</h1>
          <p className="text-slate-600">
            Quản lý thông tin nhân viên khách sạn
          </p>
        </div>
        <AddEmployeeDialog
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
            <SelectItem value="receptionist">Lễ Tân</SelectItem>
            <SelectItem value="housekeeping">Nhân Viên Buồng Phòng</SelectItem>
            <SelectItem value="manager">Quản Lí</SelectItem>
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
                <TableHead className="text-slate-600">Ngày Sinh</TableHead>
                <TableHead className="text-slate-600">Tuổi</TableHead>
                <TableHead className="text-slate-600">Chức Vụ</TableHead>
                <TableHead className="text-slate-600">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-700">
                    {employee.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-slate-700">
                        {employee.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {employee.phone}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {employee.email}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {formatDate(employee.dateBirth)}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {calculateAge(employee.dateBirth)} tuổi
                  </TableCell>
                  <TableCell>
                    <Badge className={roleColors[employee.role]}>
                      {getRoleLabel(employee.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <AddEmployeeDialog
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
                                {employee.name}
                              </span>
                              ? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-slate-300">
                              Hủy
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteEmployee(employee.id)}
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
