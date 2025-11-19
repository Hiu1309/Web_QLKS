import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Plus, Sparkles, DollarSign, Users, Clock, Image as ImageIcon } from 'lucide-react';

interface AddServiceDialogProps {
  trigger?: React.ReactNode;
}

export function AddServiceDialog({ trigger }: AddServiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: '',
    category: 'dining',
    description: '',
    price: '',
    duration: '',
    capacity: '',
    availability: 'available',
    imageUrl: '',
    features: [] as string[],
    featureInput: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Service added:', {
      ...formData,
      id: `SVC${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
    });
    setOpen(false);
    // Reset form
    setFormData({
      serviceName: '',
      category: 'dining',
      description: '',
      price: '',
      duration: '',
      capacity: '',
      availability: 'available',
      imageUrl: '',
      features: [],
      featureInput: ''
    });
  };

  const addFeature = () => {
    if (formData.featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, formData.featureInput.trim()],
        featureInput: ''
      });
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-800">Thêm Dịch Vụ Mới</DialogTitle>
          <DialogDescription className="text-gray-600">
            Tạo dịch vụ mới để cung cấp cho khách hàng
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Thông Tin Cơ Bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceName">Tên Dịch Vụ *</Label>
                <Input
                  id="serviceName"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  required
                  className="border-gray-300 focus:border-gray-500"
                  placeholder="Ví dụ: Massage Thư Giãn"
                />
              </div>
              <div>
                <Label htmlFor="category">Danh Mục *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dining">Ăn Uống</SelectItem>
                    <SelectItem value="wellness">Sức Khỏe</SelectItem>
                    <SelectItem value="transport">Di Chuyển</SelectItem>
                    <SelectItem value="amenities">Tiện Nghi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Mô Tả *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="border-gray-300 focus:border-gray-500 h-24"
                  placeholder="Mô tả chi tiết về dịch vụ..."
                />
              </div>
            </div>
          </div>

          {/* Pricing & Availability */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Giá & Tình Trạng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Giá (₹) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="pl-8 border-gray-300 focus:border-gray-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="availability">Tình Trạng *</Label>
                <Select value={formData.availability} onValueChange={(value) => setFormData({ ...formData, availability: value })}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Còn Chỗ</SelectItem>
                    <SelectItem value="limited">Sắp Hết</SelectItem>
                    <SelectItem value="booked">Hết Chỗ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Chi Tiết Dịch Vụ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Thời Gian</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="border-gray-300 focus:border-gray-500"
                  placeholder="Ví dụ: 60 phút hoặc 9:00 - 17:00"
                />
              </div>
              <div>
                <Label htmlFor="capacity">Sức Chứa</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="pl-10 border-gray-300 focus:border-gray-500"
                    placeholder="Số người tối đa"
                    min="1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Hình Ảnh
            </h3>
            <div>
              <Label htmlFor="imageUrl">URL Hình Ảnh</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="border-gray-300 focus:border-gray-500"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nhập URL hình ảnh dịch vụ (tùy chọn)
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Tính Năng & Tiện Ích</h3>
            <div className="flex gap-2">
              <Input
                value={formData.featureInput}
                onChange={(e) => setFormData({ ...formData, featureInput: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="border-gray-300 focus:border-gray-500"
                placeholder="Thêm tính năng (Enter để thêm)"
              />
              <Button
                type="button"
                onClick={addFeature}
                variant="outline"
                className="border-gray-300 hover:bg-gray-100"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {formData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-white px-3 py-1 rounded-md border border-gray-300 text-sm"
                  >
                    <span className="text-gray-700">{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          {formData.serviceName && formData.price && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Tóm Tắt Dịch Vụ</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Tên dịch vụ:</span>
                  <span className="font-medium">{formData.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Giá:</span>
                  <span className="font-medium">₹{parseInt(formData.price || '0').toLocaleString()}</span>
                </div>
                {formData.capacity && (
                  <div className="flex justify-between">
                    <span>Sức chứa:</span>
                    <span className="font-medium">{formData.capacity} người</span>
                  </div>
                )}
                {formData.features.length > 0 && (
                  <div className="flex justify-between">
                    <span>Tính năng:</span>
                    <span className="font-medium">{formData.features.length} tính năng</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
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
