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
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';
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
  Plus,
  Video,
  Settings,
} from 'lucide-react';

interface IntersectionListProps {
  onSelectIntersection: (intersection: Intersection) => void;
}

export function IntersectionList({ onSelectIntersection }: IntersectionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
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
        return <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">فعال</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">غیرفعال</Badge>;
      case 'maintenance':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">در تعمیر</Badge>;
    }
  };

  const totalViolations = mockIntersections.reduce((sum, int) => sum + int.todayViolations, 0);
  const activeIntersections = mockIntersections.filter(int => int.status === 'active').length;
  const totalCameras = mockIntersections.reduce((sum, int) => sum + int.camerasCount, 0);

  // توابع مدیریت
  const handleAddIntersection = () => {
    if (!newIntName.trim() || !newIntLocation.trim() || !newIntLat || !newIntLng) {
toast.error('همه فیلدهای الزامی را پر کنید', {
  description: 'نام، آدرس، طول و عرض جغرافیایی اجباری هستند.',
});      return;
    }

    addIntersection({
      name: newIntName.trim(),
      location: newIntLocation.trim(),
      coordinates: { lat: parseFloat(newIntLat), lng: parseFloat(newIntLng) },
      status: newIntStatus,
    });

    setUpdateTrigger({});
    toast.success('چهارراه جدید با موفقیت اضافه شد');

    setNewIntName('');
    setNewIntLocation('');
    setNewIntLat('');
    setNewIntLng('');
    setNewIntStatus('active');
    setOpenAddIntersection(false);
  };

  const handleAddCamera = () => {
    if (!currentIntersectionId || selectedModelIndex === '' || !cameraIP.trim()) {
     toast.error('مدل دوربین و آدرس IP الزامی هستند');
      return;
    }

    const model = predefinedCameraModels[parseInt(selectedModelIndex)];

    addCameraToIntersection(currentIntersectionId, {
      name: cameraName.trim() || `${model.brand} ${model.model}`,
      type: model.type,
      direction: cameraDirection,
      status: 'active',
      ipAddress: cameraIP.trim(),
      username: cameraUsername.trim() || model.defaultUsername,
      password: cameraPassword.trim() || model.defaultPassword,
    });

    setUpdateTrigger({});
    toast.success('دوربین با موفقیت اضافه شد');

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

  // ساخت حرف اول برای آواتار
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]?.toUpperCase() || '').join('').slice(0, 2);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50">
      <div className="max-w-[1800px] mx-auto px-6 py-8">

        {/* آمار کلی - مینیمال */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Card className="p-5 border-0 shadow-sm bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">کل چهارراه‌ها</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{mockIntersections.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-5 border-0 shadow-sm bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">فعال</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{activeIntersections}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-5 border-0 shadow-sm bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">تخلفات امروز</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalViolations}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-5 border-0 shadow-sm bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">دوربین‌ها</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalCameras}</p>
              </div>
              <Camera className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* جستجو، فیلتر و دکمه اضافه کردن */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="جستجوی چهارراه..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 w-full sm:w-96"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {(['all', 'active', 'inactive', 'maintenance'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={statusFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(filter)}
                >
                  {filter === 'all' ? 'همه' : filter === 'active' ? 'فعال' : filter === 'inactive' ? 'غیرفعال' : 'در تعمیر'}
                </Button>
              ))}
            </div>
          </div>

          <Dialog open={openAddIntersection} onOpenChange={setOpenAddIntersection}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 ml-2" />
                چهارراه جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]" dir="rtl">
              <DialogHeader>
                <DialogTitle>اضافه کردن چهارراه جدید</DialogTitle>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="int-name" className="text-right">نام چهارراه</Label>
                  <Input id="int-name" value={newIntName} onChange={(e) => setNewIntName(e.target.value)} className="col-span-3" placeholder="مثال: چهارراه ولیعصر - انقلاب" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="int-location" className="text-right">آدرس</Label>
                  <Input id="int-location" value={newIntLocation} onChange={(e) => setNewIntLocation(e.target.value)} className="col-span-3" placeholder="مثال: تهران، میدان ولیعصر" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="int-lat" className="text-right">عرض جغرافیایی</Label>
                  <Input id="int-lat" type="number" step="any" value={newIntLat} onChange={(e) => setNewIntLat(e.target.value)} className="col-span-3" placeholder="مثال: 35.6892" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="int-lng" className="text-right">طول جغرافیایی</Label>
                  <Input id="int-lng" type="number" step="any" value={newIntLng} onChange={(e) => setNewIntLng(e.target.value)} className="col-span-3" placeholder="مثال: 51.3890" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">وضعیت اولیه</Label>
                  <Select value={newIntStatus} onValueChange={(v: any) => setNewIntStatus(v)}>
                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
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

        {/* لیست چهارراه‌ها - مینیمال و شیک */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredIntersections.map((intersection) => (
            <Card
              key={intersection.id}
              className="group cursor-pointer transition-all duration-300 hover:shadow-md hover:border-slate-300 border border-slate-200 bg-white overflow-hidden"
              onClick={() => onSelectIntersection(intersection)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <Avatar className="h-12 w-12 border-2 border-slate-200">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg">
                      {getInitials(intersection.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(intersection.status)}
                    {intersection.todayViolations > 0 && (
                      <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {intersection.todayViolations} تخلف
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {intersection.name}
                </h3>

                <p className="text-sm text-slate-600 mt-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {intersection.location}
                </p>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                  <span className="text-sm text-slate-600 flex items-center gap-1">
                    <Camera className="w-4 h-4" />
                    {intersection.camerasCount} دوربین
                  </span>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-3 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCameraModal(intersection.id);
                      }}
                    >
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 px-3 text-xs">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* حالت خالی */}
        {filteredIntersections.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-600 text-lg">هیچ چهارراهی یافت نشد</p>
            <p className="text-slate-500 text-sm mt-2">فیلترها را تغییر دهید یا چهارراه جدید اضافه کنید</p>
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
                        {model.brand} - {model.model} ({model.type === 'fixed' ? 'ثابت' : 'PTZ'})
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
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
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