import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Intersection } from '../types';
import { mockIntersections } from '../data/mockDatabase';
import { Search, MapPin, Camera, AlertTriangle, Activity, Settings } from 'lucide-react';

interface IntersectionListProps {
  onSelectIntersection: (intersection: Intersection) => void;
}

export function IntersectionList({ onSelectIntersection }: IntersectionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');

  const filteredIntersections = mockIntersections.filter((intersection) => {
    const matchesSearch = 
      intersection.name.includes(searchQuery) || 
      intersection.location.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || intersection.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Intersection['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">فعال</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">غیرفعال</Badge>;
      case 'maintenance':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">در تعمیر</Badge>;
    }
  };

  const totalViolations = mockIntersections.reduce((sum, int) => sum + int.todayViolations, 0);
  const activeIntersections = mockIntersections.filter(int => int.status === 'active').length;

  return (
    <div className="min-h-[calc(100vh-140px)]">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* آمار کلی */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 mb-1">کل چهارراه‌ها</p>
                <p className="text-3xl font-bold text-blue-900">{mockIntersections.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">چهارراه‌های فعال</p>
                <p className="text-3xl font-bold text-green-900">{activeIntersections}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 mb-1">تخلفات امروز</p>
                <p className="text-3xl font-bold text-orange-900">{totalViolations}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 mb-1">دوربین‌های فعال</p>
                <p className="text-3xl font-bold text-purple-900">
                  {mockIntersections.reduce((sum, int) => sum + int.camerasCount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* فیلترها و جستجو */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="جستجوی چهارراه..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              size="sm"
            >
              همه
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('active')}
              size="sm"
            >
              فعال
            </Button>
            <Button
              variant={statusFilter === 'inactive' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('inactive')}
              size="sm"
            >
              غیرفعال
            </Button>
            <Button
              variant={statusFilter === 'maintenance' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('maintenance')}
              size="sm"
            >
              در تعمیر
            </Button>
          </div>
        </div>

        {/* لیست چهارراه‌ها */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntersections.map((intersection) => (
            <Card
              key={intersection.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => onSelectIntersection(intersection)}
            >
              {/* تصویر */}
              <div className="relative h-48 overflow-hidden bg-slate-200">
                <img
                  src={intersection.imageUrl}
                  alt={intersection.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  {getStatusBadge(intersection.status)}
                </div>
                {intersection.todayViolations > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {intersection.todayViolations} تخلف
                  </div>
                )}
              </div>

              {/* محتوا */}
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 text-slate-900 group-hover:text-blue-600 transition-colors">
                  {intersection.name}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{intersection.location}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Camera className="w-4 h-4" />
                    <span>{intersection.camerasCount} دوربین</span>
                  </div>
                  <Button size="sm" variant="ghost" className="group-hover:bg-blue-50 group-hover:text-blue-600">
                    <Settings className="w-4 h-4 ml-1" />
                    مشاهده
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredIntersections.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600">هیچ چهارراهی یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  );
}
