import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Users, 
  Bed, 
  DollarSign, 
  TrendingUp,
  LogIn,
  LogOut,
  Calendar,
  Star,
  ArrowUp,
  ArrowDown,
  Activity,
  Clock,
  MapPin
} from 'lucide-react';

// Mock data for dashboard
const stats = {
  totalRooms: 120,
  occupiedRooms: 85,
  availableRooms: 35,
  todayRevenue: 1025000,
  yesterdayRevenue: 915600,
  checkIns: 15,
  checkOuts: 12,
  occupancyRate: 71,
  averageRating: 4.8,
  totalGuests: 156,
  pendingCheckIns: 5,
  pendingCheckOuts: 3
};

const recentReservations = [
  { id: 1, guest: 'Raj Kumar Sharma', room: '101', checkIn: '2024-12-20', status: 'confirmed', amount: 19600, nights: 2 },
  { id: 2, guest: 'Priya Patel', room: '205', checkIn: '2024-12-20', status: 'checked-in', amount: 36800, nights: 3 },
  { id: 3, guest: 'Arjun Gupta', room: '312', checkIn: '2024-12-21', status: 'confirmed', amount: 14720, nights: 1 },
  { id: 4, guest: 'Ananya Iyer', room: '408', checkIn: '2024-12-21', status: 'pending', amount: 26176, nights: 2 },
  { id: 5, guest: 'Vikram Singh', room: '203', checkIn: '2024-12-22', status: 'confirmed', amount: 29440, nights: 2 },
];

const quickActions = [
  { title: 'Đặt phòng mới', icon: Calendar, color: 'bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600', action: 'reservation' },
  { title: 'Nhận khách', icon: LogIn, color: 'bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500', action: 'checkin' },
  { title: 'Dịch vụ phòng', icon: Bed, color: 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700', action: 'service' },
  { title: 'Xem báo cáo', icon: Activity, color: 'bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800', action: 'reports' },
];

const revenueGrowth = ((stats.todayRevenue - stats.yesterdayRevenue) / stats.yesterdayRevenue * 100).toFixed(1);

export function Dashboard() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section with Background Image */}
      <div className="relative h-96 overflow-hidden bg-gray-900">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1744782996368-dc5b7e697f4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU5NzgzMTQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Sảnh khách sạn sang trọng"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-gray-900/60"></div>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="text-white max-w-2xl">
              <h1 className="text-5xl font-bold mb-4 text-white">
                Chào mừng đến HHA
              </h1>
              <p className="text-xl text-gray-200 mb-8">Nơi sang trọng gặp gỡ hoàn hảo</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20">
                  <Star className="h-6 w-6 text-white fill-current" />
                  <div>
                    <div className="font-bold text-white text-lg">{stats.averageRating}</div>
                    <div className="text-sm text-gray-200">Đánh giá</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20">
                  <Users className="h-6 w-6 text-white" />
                  <div>
                    <div className="font-bold text-white text-lg">{stats.totalGuests}</div>
                    <div className="text-sm text-gray-200">Khách</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Interactive Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tỷ lệ lấp đầy</CardTitle>
              <div className="p-2.5 bg-gray-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-3 text-gray-900">{stats.occupancyRate}%</div>
              <Progress value={stats.occupancyRate} className="h-2 bg-gray-100" />
              <p className="text-xs text-gray-500 mt-3">
                {stats.occupiedRooms} trong {stats.totalRooms} phòng đang sử dụng
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-gray-900 text-white hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-100">Doanh thu hôm nay</CardTitle>
              <div className="p-2.5 bg-white/10 rounded-lg backdrop-blur-sm">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-3 text-white">₹{(stats.todayRevenue / 1000).toFixed(1)}L</div>
              <div className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">+{revenueGrowth}%</span>
                <span className="text-xs text-gray-300">so với hôm qua</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Nhận phòng hôm nay</CardTitle>
              <div className="p-2.5 bg-gray-100 rounded-lg">
                <LogIn className="h-5 w-5 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-3 text-gray-900">{stats.checkIns}</div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{stats.pendingCheckIns} khách chờ nhận phòng</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Trả phòng hôm nay</CardTitle>
              <div className="p-2.5 bg-gray-100 rounded-lg">
                <LogOut className="h-5 w-5 text-gray-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-3 text-gray-900">{stats.checkOuts}</div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{stats.pendingCheckOuts} khách chờ trả phòng</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button 
                  key={action.title} 
                  className="bg-gray-900 hover:bg-gray-800 text-white border-0 h-28 text-left justify-start shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <span className="font-semibold block text-base">{action.title}</span>
                      <span className="text-xs text-gray-300">Nhấn để tiếp tục</span>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Enhanced Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room Status with Visual Progress */}
          <Card className="lg:col-span-1 border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <div className="p-2 bg-gray-900 rounded-lg">
                  <Bed className="h-4 w-4 text-white" />
                </div>
                Tổng quan trạng thái phòng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">Trống</span>
                  </div>
                  <span className="font-bold text-gray-900">{stats.availableRooms}</span>
                </div>
                <Progress value={(stats.availableRooms / stats.totalRooms) * 100} className="h-2 bg-gray-100" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">Đang sử dụng</span>
                  </div>
                  <span className="font-bold text-gray-900">{stats.occupiedRooms}</span>
                </div>
                <Progress value={(stats.occupiedRooms / stats.totalRooms) * 100} className="h-2 bg-gray-100" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">Bảo trì</span>
                  </div>
                  <span className="font-bold text-gray-900">8</span>
                </div>
                <Progress value={(8 / stats.totalRooms) * 100} className="h-2 bg-gray-100" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-medium text-gray-700">Đang dọn dẹp</span>
                  </div>
                  <span className="font-bold text-gray-900">12</span>
                </div>
                <Progress value={(12 / stats.totalRooms) * 100} className="h-2 bg-gray-100" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Reservations with Images */}
          <Card className="lg:col-span-2 border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <div className="p-2 bg-gray-900 rounded-lg">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                Đặt phòng gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReservations.map((reservation) => (
                  <div key={reservation.id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all group">
                    <div className="relative">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1731336478850-6bce7235e320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJvb20lMjBsdXh1cnklMjBiZWR8ZW58MXx8fHwxNzU3OTYxMzgxfDA&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="Phòng khách sạn"
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {reservation.room}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">{reservation.guest}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              Phòng {reservation.room}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              {reservation.checkIn}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              {reservation.nights} đêm
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900 mb-1">₹{reservation.amount.toLocaleString()}</p>
                          <Badge 
                            className={`${
                              reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200' :
                              reservation.status === 'checked-in' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' : 
                              reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200' :
                              'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                            }`}
                          >
                            {reservation.status === 'confirmed' ? 'Đã xác nhận' : 
                             reservation.status === 'checked-in' ? 'Đã nhận phòng' :
                             reservation.status === 'pending' ? 'Chờ xử lý' : reservation.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button variant="outline" className="w-full hover:bg-gray-50 border-gray-300 text-gray-700">
                  Xem tất cả đặt phòng
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <div className="p-2 bg-gray-900 rounded-lg">
                <Activity className="h-4 w-4 text-white" />
              </div>
              Hiệu suất hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                <div className="text-3xl font-bold text-gray-900 mb-3">{stats.averageRating}</div>
                <div className="flex justify-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.floor(stats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 font-medium">Đánh giá khách hàng</p>
              </div>
              
              <div className="text-center p-6 bg-gray-900 rounded-xl text-white hover:bg-gray-800 transition-all">
                <div className="text-3xl font-bold mb-3">{((stats.occupiedRooms / stats.totalRooms) * 100).toFixed(0)}%</div>
                <p className="text-sm text-gray-200 mb-3 font-medium">Lấp đầy</p>
                <Progress value={(stats.occupiedRooms / stats.totalRooms) * 100} className="h-2 bg-white/20" />
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                <div className="text-3xl font-bold text-gray-900 mb-3">₹{Math.round(stats.todayRevenue / stats.occupiedRooms).toLocaleString()}</div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Doanh thu TB</p>
                <p className="text-xs text-gray-500">mỗi phòng đang dùng</p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
                <div className="text-3xl font-bold text-gray-900 mb-3">{stats.totalGuests}</div>
                <p className="text-sm text-gray-600 mb-2 font-medium">Tổng khách</p>
                <p className="text-xs text-gray-500">hiện tại trong khách sạn</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}