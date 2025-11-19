import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Coffee, 
  Waves, 
  Dumbbell, 
  Car, 
  Wifi, 
  Utensils,
  Sparkles,
  Calendar,
  Users,
  Clock,
  Star,
  CheckCircle,
  Plus
} from 'lucide-react';
import { AddServiceDialog } from './AddServiceDialog';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'dining' | 'wellness' | 'transport' | 'amenities';
  image: string;
  duration?: string;
  capacity?: number;
  rating: number;
  availability: 'available' | 'limited' | 'booked';
  features: string[];
}

// Mock services data
const services: Service[] = [
  {
    id: 'SVC001',
    name: 'Continental Breakfast Buffet',
    description: 'Start your day with our extensive breakfast buffet featuring Indian and international cuisine',
    price: 1500,
    category: 'dining',
    image: 'https://images.unsplash.com/photo-1722477936580-84aa10762b0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGJyZWFrZmFzdCUyMGJ1ZmZldHxlbnwxfHx8fDE3NTk4MTEyMTR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '6:30 AM - 10:30 AM',
    capacity: 200,
    rating: 4.8,
    availability: 'available',
    features: ['Live cooking stations', 'Fresh fruits', 'Indian breakfast', 'Continental options', 'Fresh juices']
  },
  {
    id: 'SVC002',
    name: 'Luxury Swimming Pool',
    description: 'Olympic-size swimming pool with poolside service and stunning city views',
    price: 800,
    category: 'wellness',
    image: 'https://images.unsplash.com/photo-1547064663-a07e03f25fca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHN3aW1taW5nJTIwcG9vbCUyMGx1eHVyeXxlbnwxfHx8fDE3NTk4MTEyMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '5:00 AM - 11:00 PM',
    capacity: 50,
    rating: 4.9,
    availability: 'available',
    features: ['Heated pool', 'Poolside bar', 'Loungers', 'Towel service', 'Pool games']
  },
  {
    id: 'SVC003',
    name: 'HHA Spa & Wellness',
    description: 'Full-service spa offering traditional Ayurvedic treatments and modern wellness therapies',
    price: 3500,
    category: 'wellness',
    image: 'https://images.unsplash.com/photo-1604161926875-bb58f9a0d81b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHNwYSUyMHdlbGxuZXNzfGVufDF8fHx8MTc1OTc0NDcwMXww&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '60-90 minutes',
    capacity: 8,
    rating: 4.7,
    availability: 'limited',
    features: ['Ayurvedic massage', 'Steam room', 'Jacuzzi', 'Aromatherapy', 'Couple rooms']
  },
  {
    id: 'SVC004',
    name: 'Airport Transfer Service',
    description: 'Luxury car service to and from the airport with professional chauffeurs',
    price: 2500,
    category: 'transport',
    image: 'https://images.unsplash.com/photo-1626868449668-fb47a048d9cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb20lMjBiZWR8ZW58MXx8fHwxNzU5NzEyMjYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '45-60 minutes',
    capacity: 4,
    rating: 4.6,
    availability: 'available',
    features: ['Mercedes vehicles', 'Professional driver', 'Complimentary water', 'Flight tracking', 'Meet & greet']
  },
  {
    id: 'SVC005',
    name: 'Fitness Center Access',
    description: 'State-of-the-art fitness center with modern equipment and personal training',
    price: 500,
    category: 'wellness',
    image: 'https://images.unsplash.com/photo-1759264244746-140bbbc54e1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGRlbHV4ZSUyMHJvb20lMjBtb2Rlcm58ZW58MXx8fHwxNzU5NzU4OTM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '24/7 access',
    capacity: 30,
    rating: 4.5,
    availability: 'available',
    features: ['Modern equipment', 'Personal trainer', 'Yoga classes', 'Cardio machines', 'Free weights']
  },
  {
    id: 'SVC006',
    name: 'Fine Dining Restaurant',
    description: 'Multi-cuisine restaurant featuring authentic Indian and international dishes',
    price: 2800,
    category: 'dining',
    image: 'https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHN1aXRlfGVufDF8fHx8MTc1OTgxMTIxOXww&ixlib=rb-4.1.0&q=80&w=1080',
    duration: '12:00 PM - 11:30 PM',
    capacity: 120,
    rating: 4.8,
    availability: 'available',
    features: ['Live kitchen', 'Wine pairing', 'Private dining', 'Chef specials', 'Vegetarian options']
  }
];

const categoryColors = {
  dining: 'bg-gray-200 text-gray-800',
  wellness: 'bg-gray-300 text-gray-800',
  transport: 'bg-gray-400 text-gray-900',
  amenities: 'bg-gray-500 text-white'
};

const categoryIcons = {
  dining: Utensils,
  wellness: Sparkles,
  transport: Car,
  amenities: Wifi
};

const availabilityColors = {
  available: 'bg-gray-600',
  limited: 'bg-gray-500',
  booked: 'bg-gray-400'
};

export function ServicesManagement() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredServices = services.filter(service => 
    selectedCategory === 'all' || service.category === selectedCategory
  );

  const categories = ['all', 'dining', 'wellness', 'transport', 'amenities'];

  const categoryLabels = {
    all: 'Tất Cả',
    dining: 'Ăn Uống',
    wellness: 'Sức Khỏe',
    transport: 'Di Chuyển',
    amenities: 'Tiện Nghi'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1744782996368-dc5b7e697f4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMGxvYmJ5JTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU5NzgzMTQ4fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Dịch vụ khách sạn"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-800/50 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 via-white to-gray-400"></div>
        <div className="absolute inset-0 flex items-center justify-start p-6">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">Dịch Vụ Khách Sạn</h1>
            <p className="text-xl opacity-90 text-white/80">Trải nghiệm tiện nghi sang trọng và dịch vụ cá nhân hóa tại HHA</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                <Star className="h-5 w-5 text-white fill-current" />
                <span className="font-semibold">4.8</span>
                <span className="text-sm opacity-80">Đánh Giá Dịch Vụ</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                <CheckCircle className="h-5 w-5 text-white" />
                <span className="font-semibold">{services.length}</span>
                <span className="text-sm opacity-80">Dịch Vụ Cao Cấp</span>
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
              <h2 className="text-gray-800">Danh Mục Dịch Vụ</h2>
              <AddServiceDialog />
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => {
                const Icon = category !== 'all' ? categoryIcons[category as keyof typeof categoryIcons] : Star;
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center gap-2 ${
                      selectedCategory === category 
                        ? 'bg-gray-700 hover:bg-gray-800 text-white' 
                        : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const CategoryIcon = categoryIcons[service.category];
            const categoryLabels = {
              dining: 'Ăn Uống',
              wellness: 'Sức Khỏe',
              transport: 'Di Chuyển',
              amenities: 'Tiện Nghi'
            };
            return (
              <Card key={service.id} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group bg-white border-gray-200">
                {/* Service Image */}
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={`${categoryColors[service.category]} border-0`}>
                      <CategoryIcon className="h-3 w-3 mr-1" />
                      {categoryLabels[service.category]}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className={`w-3 h-3 rounded-full ${availabilityColors[service.availability]} shadow-lg`}></div>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <div className="flex items-center gap-1 bg-gray-800/70 text-white px-2 py-1 rounded-full text-sm">
                      <Star className="h-3 w-3 text-white fill-current" />
                      {service.rating}
                    </div>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-800">{service.name}</CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-800">₹{service.price.toLocaleString()}</div>
                    <Badge 
                      className={`${
                        service.availability === 'available' ? 'bg-gray-200 text-gray-800' :
                        service.availability === 'limited' ? 'bg-gray-300 text-gray-800' :
                        'bg-gray-400 text-white'
                      }`}
                    >
                      {service.availability === 'available' ? 'Còn Chỗ' :
                       service.availability === 'limited' ? 'Sắp Hết' :
                       'Hết Chỗ'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    {service.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span>{service.duration}</span>
                      </div>
                    )}
                    {service.capacity && (
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-gray-500" />
                        <span>Sức chứa: {service.capacity}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2 text-gray-800">Tiện Ích:</h4>
                    <div className="flex flex-wrap gap-1">
                      {service.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-gray-300 text-gray-700">
                          {feature}
                        </Badge>
                      ))}
                      {service.features.length > 3 && (
                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                          +{service.features.length - 3} khác
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {service.availability !== 'booked' && (
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gray-700 hover:bg-gray-800 text-white"
                      >
                        Đặt Ngay
                      </Button>
                    )}
                    {service.availability === 'booked' && (
                      <Button size="sm" variant="outline" className="flex-1 border-gray-300" disabled>
                        Đã Hết Chỗ
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="px-3 hover:bg-gray-100">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredServices.length === 0 && (
          <Card className="py-12 bg-white border-gray-200">
            <CardContent className="text-center">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không tìm thấy dịch vụ nào trong danh mục này.</p>
              <Button variant="outline" className="mt-4 border-gray-300 hover:bg-gray-100" onClick={() => setSelectedCategory('all')}>
                Xem Tất Cả Dịch Vụ
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}