import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Diamond,
  LogIn,
  Mail,
  Lock,
} from "lucide-react";

interface LoginProps {
  onLogin: (email: string, password: string) => void;
}

export function Login({
  onLogin,
}: LoginProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(formData.email, formData.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex gap-6 w-full max-w-5xl relative z-10 justify-center">
        {/* Login Form Card */}
        <Card className="w-full max-w-md bg-white shadow-2xl border-0">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gray-400 blur-md opacity-50 animate-pulse"></div>
                <div className="relative p-3 bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 rounded-xl shadow-lg">
                  <Diamond className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl text-gray-800">
              Chào Mừng Trở Lại
            </CardTitle>
            <CardDescription className="text-gray-600">
              Đăng nhập vào hệ thống quản lý khách sạn HHA
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-gray-700"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    required
                    className="pl-10 border-gray-300 focus:border-gray-500"
                    placeholder="example@hha.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-gray-700"
                >
                  Mật Khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password: e.target.value,
                      })
                    }
                    required
                    className="pl-10 border-gray-300 focus:border-gray-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                  />
                  Ghi nhớ đăng nhập
                </label>
                <a
                  href="#"
                  className="text-gray-700 hover:text-gray-900 hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white shadow-lg h-11"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Đăng Nhập
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}