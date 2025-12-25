// components/IntersectionList.tsx

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { toast } from 'sonner'; // یا از sonner استفاده کنید: import { toast } from './components/ui/sonner'
import { Intersection } from '../types';
import {
  mockIntersections,
  addIntersection,
  addCameraToIntersection,
  predefinedCameraModels,
} from '../data/mockDatabase';
import {
  Search,
  MapPin,
  Camera,
  AlertTriangle,
  Activity,
  Settings,
  Plus,
  Video,
} from 'lucide-react';

interface IntersectionListProps {
  onSelectIntersection: (intersection: Intersection) => void;
}

export function IntersectionList({ onSelectIntersection }: IntersectionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');

  // برای re-render بعد از اضافه کردن
  const [, setUpdateTrigger] = useState({});

  // مدال اضافه کردن چهارراه
  const [openAddIntersection, setOpenAddIntersection] = useState(false);
  const [newIntName, setNewIntName] = useState('');
  const [newIntLocation, setNewIntLocation] = useState('');
  const [newIntLat, setNewIntLat] = useState('');
  const [newIntLng, setNewIntLng] = useState('');
  const [newIntStatus, setNewIntStatus] = useState<'active' | 'inactive' | 'maintenance'>('active');

  // مدال اضافه کردن دوربین
  const [openAddCamera, setOpenAddCamera] = useState(false);
  const [currentIntersectionId, setCurrentIntersectionId] = useState<string | null>(null);
  const [selectedModelIndex, setSelectedModelIndex] = useState('');
  const [cameraName, setCameraName] = useState('');
  const [cameraDirection, setCameraDirection] = useState<'north' | 'south' | 'east' | 'west'>('north');
  const [cameraIP, setCameraIP] = useState('');
  const [cameraUsername, setCameraUsername] = useState('');
  const [cameraPassword, setCameraPassword] = useState('');

  // فیلتر چهارراه‌ها
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

  // توابع مدیریت
  const handleAddIntersection = () => {
    if (!newIntName.trim() || !newIntLocation.trim() || !newIntLat || !newIntLng) {
      toast({ title: 'خطا', description: 'همه فیلدهای الزامی را پر کنید', variant: 'destructive' });
      return;
    }

    addIntersection({
      name: newIntName.trim(),
      location: newIntLocation.trim(),
      coordinates: { lat: parseFloat(newIntLat), lng: parseFloat(newIntLng) },
      status: newIntStatus,
    });

    setUpdateTrigger({});
    toast({ title: 'موفقیت', description: 'چهارراه جدید با موفقیت اضافه شد' });

    // ریست فرم
    setNewIntName('');
    setNewIntLocation('');
    setNewIntLat('');
    setNewIntLng('');
    setNewIntStatus('active');
    setOpenAddIntersection(false);
  };

  const handleAddCamera = () => {
    if (!currentIntersectionId || selectedModelIndex === '' || !cameraIP.trim()) {
      toast({ title: 'خطا', description: 'مدل دوربین و آدرس IP الزامی هستند', variant: 'destructive' });
      return;
    }

    const model = predefinedCameraModels[parseInt(selectedModelIndex)];

    addCameraToIntersection(currentIntersectionId, {
      name: cameraName.trim() || `${model.brand} ${model.model}`,
      type: model.type,
      direction: cameraDirection,
      status: 'active',
      ipAddress: cameraIP.trim(),
      // اگر کاربر چیزی وارد نکرده، از پیش‌فرض مدل استفاده کن
      username: cameraUsername.trim() || model.defaultUsername,
      password: cameraPassword.trim() || model.defaultPassword,
    });

    setUpdateTrigger({});
    toast({ title: 'موفقیت', description: 'دوربین با موفقیت اضافه شد' });

    // ریست فرم دوربین
    setSelectedModelIndex('');
    setCameraName('');
    setCameraIP('');
    setCameraUsername('');
    setCameraPassword('');
    setOpenAddCamera(false);
  };

  const openCameraModal = (intersectionId: string) => {
    setCurrentIntersectionId(intersectionId);
    setOpenAddCamera(true);
  };

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

        {/* جستجو، فیلتر و دکمه اضافه کردن چهارراه */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="جستجوی چهارراه..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 w-full sm:w-80"
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

          {/* دکمه اضافه کردن چهارراه */}
          <Dialog open={openAddIntersection} onOpenChange={setOpenAddIntersection}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 ml-2" />
                اضافه کردن چهارراه
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]" dir="rtl">
              <DialogHeader>
                <DialogTitle>اضافه کردن چهارراه جدید</DialogTitle>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="int-name" className="text-right">نام چهارراه</Label>
                  <Input
                    id="int-name"
                    value={newIntName}
                    onChange={(e) => setNewIntName(e.target.value)}
                    className="col-span-3"
                    placeholder="مثال: چهارراه ولیعصر - انقلاب"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="int-location" className="text-right">آدرس</Label>
                  <Input
                    id="int-location"
                    value={newIntLocation}
                    onChange={(e) => setNewIntLocation(e.target.value)}
                    className="col-span-3"
                    placeholder="مثال: تهران، میدان ولیعصر"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="int-lat" className="text-right">عرض جغرافیایی</Label>
                  <Input
                    id="int-lat"
                    type="number"
                    step="any"
                    value={newIntLat}
                    onChange={(e) => setNewIntLat(e.target.value)}
                    className="col-span-3"
                    placeholder="مثال: 35.6892"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="int-lng" className="text-right">طول جغرافیایی</Label>
                  <Input
                    id="int-lng"
                    type="number"
                    step="any"
                    value={newIntLng}
                    onChange={(e) => setNewIntLng(e.target.value)}
                    className="col-span-3"
                    placeholder="مثال: 51.3890"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">وضعیت اولیه</Label>
                  <Select value={newIntStatus} onValueChange={(v: any) => setNewIntStatus(v)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">فعال</SelectItem>
                      <SelectItem value="inactive">غیرفعال</SelectItem>
                      <SelectItem value="maintenance">در تعمیر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddIntersection}>اضافه کردن چهارراه</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* لیست چهارراه‌ها */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntersections.map((intersection) => (
            <Card
              key={intersection.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => onSelectIntersection(intersection)}
            >
              <div className="relative h-48 overflow-hidden bg-slate-200">
                <img
                  src={intersection.imageUrl}
                  alt={intersection.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">{getStatusBadge(intersection.status)}</div>
                {intersection.todayViolations > 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {intersection.todayViolations} تخلف
                  </div>
                )}
              </div>

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

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCameraModal(intersection.id);
                      }}
                    >
                      <Video className="w-4 h-4 ml-1" />
                      دوربین‌ها
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="w-4 h-4 ml-1" />
                      مشاهده
                    </Button>
                  </div>
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

        {/* مدال اضافه کردن دوربین */}
        <Dialog open={openAddCamera} onOpenChange={setOpenAddCamera}>
          <DialogContent className="sm:max-w-[600px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>اضافه کردن دوربین جدید</DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">مدل دوربین</Label>
                <Select value={selectedModelIndex} onValueChange={setSelectedModelIndex}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="یک مدل انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedCameraModels.map((model, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {model.brand} - {model.model}{' '}
                        ({model.type === 'fixed' ? 'ثابت' : 'PTZ'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cam-name" className="text-right">نام دوربین</Label>
                <Input
                  id="cam-name"
                  value={cameraName}
                  onChange={(e) => setCameraName(e.target.value)}
                  className="col-span-3"
                  placeholder="اختیاری - در غیر این صورت از مدل استفاده می‌شود"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">جهت</Label>
                <Select value={cameraDirection} onValueChange={(v: any) => setCameraDirection(v)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="north">شمال</SelectItem>
                    <SelectItem value="south">جنوب</SelectItem>
                    <SelectItem value="east">شرق</SelectItem>
                    <SelectItem value="west">غرب</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cam-ip" className="text-right">آدرس IP</Label>
                <Input
                  id="cam-ip"
                  value={cameraIP}
                  onChange={(e) => setCameraIP(e.target.value)}
                  className="col-span-3"
                  placeholder="مثال: 192.168.1.101"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cam-user" className="text-right">نام کاربری</Label>
                <Input
                  id="cam-user"
                  value={cameraUsername}
                  onChange={(e) => setCameraUsername(e.target.value)}
                  className="col-span-3"
                  placeholder="اختیاری - پیش‌فرض از مدل"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cam-pass" className="text-right">رمز عبور</Label>
                <Input
                  id="cam-pass"
                  type="password"
                  value={cameraPassword}
                  onChange={(e) => setCameraPassword(e.target.value)}
                  className="col-span-3"
                  placeholder="اختیاری - پیش‌فرض از مدل"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddCamera}>اضافه کردن دوربین</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}