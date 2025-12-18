import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  MapPin, 
  Camera, 
  AlertTriangle, 
  Search,
  ChevronLeft,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Intersection } from '../types';

interface IntersectionListProps {
  onSelectIntersection: (intersection: Intersection) => void;
}

export function IntersectionList({ onSelectIntersection }: IntersectionListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const intersections: Intersection[] = [
    {
      id: 'int-001',
      name: 'چهارراه ولیعصر',
      location: 'تهران، خیابان ولیعصر، تقاطع با انقلاب',
      coordinates: { lat: 35.6892, lng: 51.3890 },
      status: 'active',
      camerasCount: 5,
      todayViolations: 127,
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80'
    },
    {
      id: 'int-002',
      name: 'چهارراه آزادی',
      location: 'تهران، میدان آزادی، تقاطع با کارگر',
      coordinates: { lat: 35.6995, lng: 51.3376 },
      status: 'active',
      camerasCount: 5,
      todayViolations: 89,
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80&sig=2'
    },
    {
      id: 'int-003',
      name: 'چهارراه فردوسی',
      location: 'تهران، خیابان فردوسی، تقاطع با جمهوری',
      coordinates: { lat: 35.7005, lng: 51.4154 },
      status: 'active',
      camerasCount: 5,
      todayViolations: 156,
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80&sig=3'
    },
    {
      id: 'int-004',
      name: 'چهارراه سعادت‌آباد',
      location: 'تهران، منطقه ۲، سعادت‌آباد',
      coordinates: { lat: 35.7596, lng: 51.3736 },
      status: 'maintenance',
      camerasCount: 5,
      todayViolations: 0,
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80&sig=4'
    },
    {
      id: 'int-005',
      name: 'چهارراه نواب',
      location: 'تهران، خیابان نواب صفوی',
      coordinates: { lat: 35.6722, lng: 51.3140 },
      status: 'active',
      camerasCount: 5,
      todayViolations: 72,
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80&sig=5'
    },
    {
      id: 'int-006',
      name: 'چهارراه جهان کودک',
      location: 'تهران، بزرگراه همت، جهان کودک',
      coordinates: { lat: 35.7547, lng: 51.4118 },
      status: 'active',
      camerasCount: 5,
      todayViolations: 103,
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80&sig=6'
    }
  ];

  const filteredIntersections = intersections.filter(int =>
    int.name.includes(searchQuery) || int.location.includes(searchQuery)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500 gap-1">
            <CheckCircle className="w-3 h-3" />
            فعال
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-red-500 gap-1">
            <XCircle className="w-3 h-3" />
            غیرفعال
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge className="bg-yellow-500 gap-1">
            <Activity className="w-3 h-3" />
            در حال تعمیر
          </Badge>
        );
    }
  };

  const activeCount = intersections.filter(i => i.status === 'active').length;
  const totalViolations = intersections.reduce((sum, i) => sum + i.todayViolations, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            مدیریت چهارراه‌ها
          </h1>
          <p className="text-gray-600 mt-2">
            انتخاب چهارراه برای نظارت و تنظیمات سیستم
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">کل چهارراه‌ها</p>
                  <p className="text-3xl font-bold mt-1">{intersections.length}</p>
                </div>
                <MapPin className="w-10 h-10 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">چهارراه‌های فعال</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{activeCount}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">کل دوربین‌ها</p>
                  <p className="text-3xl font-bold mt-1">{intersections.length * 5}</p>
                </div>
                <Camera className="w-10 h-10 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">تخلفات امروز</p>
                  <p className="text-3xl font-bold mt-1 text-orange-600">{totalViolations}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="جستجو بر اساس نام یا موقعیت چهارراه..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 h-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Intersections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntersections.map((intersection) => (
            <Card
              key={intersection.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => onSelectIntersection(intersection)}
            >
              <div className="relative h-48 bg-gray-900">
                <img
                  src={intersection.imageUrl}
                  alt={intersection.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute top-3 right-3">
                  {getStatusBadge(intersection.status)}
                </div>
                {intersection.status === 'active' && intersection.todayViolations > 0 && (
                  <div className="absolute top-3 left-3 bg-orange-500 px-3 py-1 rounded-full text-white text-sm font-medium flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {intersection.todayViolations} تخلف
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                  {intersection.name}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{intersection.location}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Camera className="w-4 h-4" />
                      <span>{intersection.camerasCount} دوربین</span>
                    </div>
                    {intersection.status === 'active' && (
                      <div className="flex items-center gap-1 text-orange-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{intersection.todayViolations} تخلف امروز</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  className="w-full mt-4 gap-2 group-hover:bg-blue-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectIntersection(intersection);
                  }}
                >
                  مشاهده جزئیات
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredIntersections.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">چهارراهی یافت نشد</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
