// src/components/IntersectionList.tsx

import React, { useState, forwardRef } from 'react';
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
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Intersection, Camera } from '../types';
import {
  mockIntersections,
  addIntersection,
  addCameraToIntersection,
  removeIntersection,
  removeCameraFromIntersection,
  updateCameraInIntersection,
  mockCameras,
} from '../data/mockDatabase';
import {
  Search,
  MapPin,
  Camera as CameraIcon,
  AlertTriangle,
  Activity,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
} from 'lucide-react';

// --- Radix UI Imports برای Select سفارشی ---
import * as SelectPrimitive from '@radix-ui/react-select';

// --- SelectNoModal: برای استفاده داخل مدال بدون محدودیت z-index ---
const SelectNoModal = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>
>((props, ref) => {
  return <SelectPrimitive.Root {...props} modal={false} ref={ref} />;
});
SelectNoModal.displayName = 'SelectNoModal';

// --- کامپوننت اصلی ---
interface IntersectionListProps {
  onSelectIntersection: (intersection: Intersection) => void;
}

export function IntersectionList({ onSelectIntersection }: IntersectionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [, setUpdateTrigger] = useState({});

  const [openAddIntersection, setOpenAddIntersection] = useState(false);
  const [newIntName, setNewIntName] = useState('');
  const [newIntLocation, setNewIntLocation] = useState('');
  const [newIntLat, setNewIntLat] = useState('');
  const [newIntLng, setNewIntLng] = useState('');
  const [newIntStatus, setNewIntStatus] = useState<'active' | 'inactive' | 'maintenance'>('active');

  const [openCamerasModal, setOpenCamerasModal] = useState(false);
  const [currentIntersection, setCurrentIntersection] = useState<Intersection | null>(null);

  const [openAddCamera, setOpenAddCamera] = useState(false);
  const [cameraType, setCameraType] = useState<'fixed' | 'ptz'>('fixed');
  const [cameraName, setCameraName] = useState('');
  const [cameraDirection, setCameraDirection] = useState<'north' | 'south' | 'east' | 'west'>('north');
  const [cameraIP, setCameraIP] = useState('');

  const [openEditCamera, setOpenEditCamera] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);

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
        return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs">فعال</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 text-xs">غیرفعال</Badge>;
      case 'maintenance':
        return <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs">در حال تعمیر</Badge>;
    }
  };

  const totalViolations = mockIntersections.reduce((sum, int) => sum + int.todayViolations, 0);
  const activeIntersections = mockIntersections.filter(int => int.status === 'active').length;
  const totalCameras = mockIntersections.reduce((sum, int) => sum + int.camerasCount, 0);

  const handleAddIntersection = () => {
    if (!newIntName.trim() || !newIntLocation.trim() || !newIntLat || !newIntLng) {
      toast.error('فیلدهای ضروری را پر کنید');
      return;
    }

    addIntersection({
      name: newIntName.trim(),
      location: newIntLocation.trim(),
      coordinates: { lat: parseFloat(newIntLat), lng: parseFloat(newIntLng) },
      status: newIntStatus,
    });

    setUpdateTrigger({});
    toast.success('چهارراه اضافه شد');

    setNewIntName('');
    setNewIntLocation('');
    setNewIntLat('');
    setNewIntLng('');
    setNewIntStatus('active');
    setOpenAddIntersection(false);
  };

  const handleDeleteIntersection = (id: string) => {
    if (window.confirm('حذف چهارراه و دوربین‌های آن؟')) {
      removeIntersection(id);
      setUpdateTrigger({});
      toast.success('چهارراه حذف شد');
    }
  };

  const showCamerasModal = (intersection: Intersection) => {
    setCurrentIntersection(intersection);
    setOpenCamerasModal(true);
  };

  const handleAddCamera = () => {
    if (!currentIntersection || !cameraIP.trim()) {
      toast.error('آدرس IP ضروری است');
      return;
    }

    addCameraToIntersection(currentIntersection.id, {
      name: cameraName.trim() || 'دوربین جدید',
      type: cameraType,
      direction: cameraDirection,
      status: 'active',
      ipAddress: cameraIP.trim(),
      username: '',
      password: '',
    });

    setUpdateTrigger({});
    toast.success('دوربین اضافه شد');

    setCameraType('fixed');
    setCameraName('');
    setCameraDirection('north');
    setCameraIP('');
    setOpenAddCamera(false);
  };

  const handleDeleteCamera = (cameraId: string) => {
    if (window.confirm('حذف این دوربین؟')) {
      if (currentIntersection) {
        removeCameraFromIntersection(currentIntersection.id, cameraId);
        setUpdateTrigger({});
        toast.success('دوربین حذف شد');
      }
    }
  };

  const openEditCameraModal = (camera: Camera) => {
    setEditingCamera(camera);
    setCameraType(camera.type);
    setCameraName(camera.name);
    setCameraDirection(camera.direction);
    setCameraIP(camera.ipAddress);
    setOpenEditCamera(true);
  };

  const handleUpdateCamera = () => {
    if (!currentIntersection || !editingCamera || !cameraIP.trim()) {
      toast.error('آدرس IP ضروری است');
      return;
    }

    updateCameraInIntersection(currentIntersection.id, {
      ...editingCamera,
      name: cameraName.trim() || editingCamera.name,
      type: cameraType,
      direction: cameraDirection,
      ipAddress: cameraIP.trim(),
    });

    setUpdateTrigger({});
    toast.success('دوربین ویرایش شد');
    setOpenEditCamera(false);
  };

  const getDirectionLabel = (dir: string) => {
    const labels: Record<string, string> = {
      north: 'شمال',
      south: 'جنوب',
      east: 'شرق',
      west: 'غرب',
    };
    return labels[dir] || dir;
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            کنترل ترافیک در تقاطع های شهری
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            برنامه جامع ثبت تخلفات چهارراه ها بر اساس تخلفات توسط دوربین های جرخان (PTZ)
          </p>
        </div>

        {/* --- کارت‌های آمار --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          <Card className="p-5 bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">تعداد چهارراه‌ها</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{mockIntersections.length}</p>
              </div>
              <MapPin className="w-9 h-9 text-slate-600 dark:text-slate-400" />
            </div>
          </Card>

          <Card className="p-5 bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wider">چهارراه‌های فعال</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">{activeIntersections}</p>
              </div>
              <Activity className="w-9 h-9 text-green-600 dark:text-green-400" />
            </div>
          </Card>

          <Card className="p-5 bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider">تخلفات ثبت‌شده امروز</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1">{totalViolations}</p>
              </div>
              <AlertTriangle className="w-9 h-9 text-amber-600 dark:text-amber-400" />
            </div>
          </Card>

          <Card className="p-5 bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wider">تعداد کل دوربین‌ها</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">{totalCameras}</p>
              </div>
              <CameraIcon className="w-9 h-9 text-purple-600 dark:text-purple-400" />
            </div>
          </Card>
        </div>

        {/* --- هدر: جستجو + فیلتر + دکمه اضافه --- */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/3 w-5 h-5 text-slate-400" />
              <Input
                placeholder="جستجو..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 w-full sm:w-80 bg-slate-50 dark:bg-slate-700/50"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {(['all', 'active', 'inactive', 'maintenance'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={statusFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(filter)}
                  className={
                    statusFilter === filter
                      ? 'bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-800'
                  }
                >
                  {filter === 'all'
                    ? 'همه'
                    : filter === 'active'
                    ? 'فعال'
                    : filter === 'inactive'
                    ? 'غیرفعال'
                    : 'در حال تعمیر'}
                </Button>
              ))}
            </div>
          </div>

          <Dialog open={openAddIntersection} onOpenChange={setOpenAddIntersection}>
            <DialogTrigger asChild>
              <Button className="shadow-md hover:shadow-lg transition-shadow bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600">
                <Plus className="w-4 h-4 ml-2" />
                چهارراه جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">چهارراه جدید</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="int-name" className="text-right text-sm text-slate-700 dark:text-slate-300">نام</Label>
                  <Input
                    id="int-name"
                    value={newIntName}
                    onChange={(e) => setNewIntName(e.target.value)}
                    className="col-span-3 text-right bg-slate-50 dark:bg-slate-700/50"
                    placeholder="نام چهارراه"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="int-location" className="text-right text-sm text-slate-700 dark:text-slate-300">آدرس</Label>
                  <Input
                    id="int-location"
                    value={newIntLocation}
                    onChange={(e) => setNewIntLocation(e.target.value)}
                    className="col-span-3 text-right bg-slate-50 dark:bg-slate-700/50"
                    placeholder="آدرس کامل محل تقاطع"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="int-lat" className="text-right text-sm text-slate-700 dark:text-slate-300">عرض جغرافیایی</Label>
                  <Input
                    id="int-lat"
                    type="number"
                    step="any"
                    value={newIntLat}
                    onChange={(e) => setNewIntLat(e.target.value)}
                    className="col-span-3 text-right bg-slate-50 dark:bg-slate-700/50"
                    placeholder="مثلاً: 35.6892"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="int-lng" className="text-right text-sm text-slate-700 dark:text-slate-300">طول جغرافیایی</Label>
                  <Input
                    id="int-lng"
                    type="number"
                    step="any"
                    value={newIntLng}
                    onChange={(e) => setNewIntLng(e.target.value)}
                    className="col-span-3 text-right bg-slate-50 dark:bg-slate-700/50"
                    placeholder="مثلاً: 51.3890"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-sm text-slate-700 dark:text-slate-300">وضعیت</Label>
                  <SelectNoModal value={newIntStatus} onValueChange={(v) => setNewIntStatus(v as any)}>
                    <SelectPrimitive.Trigger className="col-span-3 text-right flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-50">
                      <SelectPrimitive.Value placeholder="وضعیت را انتخاب کنید" />
                      <SelectPrimitive.Icon asChild>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </SelectPrimitive.Icon>
                    </SelectPrimitive.Trigger>
                    <SelectPrimitive.Content
                      className="z-[1600] min-w-[--radix-select-trigger-width] overflow-hidden rounded-md border bg-white shadow-md dark:bg-slate-800"
                      position="popper"
                      sideOffset={5}
                    >
                      <SelectPrimitive.Viewport>
                        <SelectPrimitive.Item
                          value="active"
                          className="relative flex w-full cursor-default select-none items-center px-3 py-2 text-sm outline-none hover:bg-slate-100 data-[disabled]:pointer-events-none data-[highlighted]:bg-slate-100 data-[disabled]:opacity-50 dark:hover:bg-slate-700 dark:data-[highlighted]:bg-slate-700"
                        >
                          <SelectPrimitive.ItemText>فعال</SelectPrimitive.ItemText>
                        </SelectPrimitive.Item>
                        <SelectPrimitive.Item
                          value="inactive"
                          className="relative flex w-full cursor-default select-none items-center px-3 py-2 text-sm outline-none hover:bg-slate-100 data-[disabled]:pointer-events-none data-[highlighted]:bg-slate-100 data-[disabled]:opacity-50 dark:hover:bg-slate-700 dark:data-[highlighted]:bg-slate-700"
                        >
                          <SelectPrimitive.ItemText>غیرفعال</SelectPrimitive.ItemText>
                        </SelectPrimitive.Item>
                        <SelectPrimitive.Item
                          value="maintenance"
                          className="relative flex w-full cursor-default select-none items-center px-3 py-2 text-sm outline-none hover:bg-slate-100 data-[disabled]:pointer-events-none data-[highlighted]:bg-slate-100 data-[disabled]:opacity-50 dark:hover:bg-slate-700 dark:data-[highlighted]:bg-slate-700"
                        >
                          <SelectPrimitive.ItemText>در حال تعمیر</SelectPrimitive.ItemText>
                        </SelectPrimitive.Item>
                      </SelectPrimitive.Viewport>
                    </SelectPrimitive.Content>
                  </SelectNoModal>
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setOpenAddIntersection(false)}
                  className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  انصراف
                </Button>
                <Button
                  onClick={handleAddIntersection}
                  className="bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  اضافه کردن
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* --- لیست چهارراه‌ها --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredIntersections.map((intersection) => (
            <Card
              key={intersection.id}
              className="shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl overflow-hidden cursor-pointer transform hover:-translate-y-2"
              onClick={() => onSelectIntersection(intersection)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">{intersection.name}</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteIntersection(intersection.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {getStatusBadge(intersection.status)}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4" />
                  {intersection.location}
                </p>

                {intersection.todayViolations > 0 ? (
                  <div className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4" />
                    <span>تعداد تخلف ثبت شده</span>
                    {intersection.todayViolations}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">امکان ثبت تخلف وجود ندارد</div>
                )}

                <div
                  className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl -mx-6 px-6 py-3 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    showCamerasModal(intersection);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <CameraIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">تعداد دوربین‌ها:</span>
                      <span className="text-xs text-slate-900 dark:text-slate-100">{intersection.camerasCount}</span>
                    </span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">مدیریت دوربین‌ها →</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredIntersections.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-base">چهارراهی یافت نشد</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">جستجو یا فیلتر را تغییر دهید</p>
          </div>
        )}

        {/* --- مدال‌های دوربین (بدون تغییر — چون Select آن‌ها خارج از مدال دیگری هست) --- */}
        <Dialog open={openCamerasModal} onOpenChange={setOpenCamerasModal}>
          <DialogContent className="sm:max-w-lg p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                دوربین‌های {currentIntersection?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-5">
              <Button
                className="w-full mb-5 shadow-md hover:shadow-lg transition-shadow bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-sm py-1.5"
                size="sm"
                onClick={() => setOpenAddCamera(true)}
              >
                <Plus className="w-4 h-4 ml-2" />
                دوربین جدید
              </Button>
              {currentIntersection && (mockCameras[currentIntersection.id]?.length || 0) === 0 ? (
                <div className="py-8 text-center">
                  <CameraIcon className="w-10 h-10 mx-auto mb-3 text-slate-400 dark:text-slate-500" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">دوربینی برای این چهارراه تعریف نشده است</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentIntersection &&
                    mockCameras[currentIntersection.id]?.map((cam) => (
                      <div
                        key={cam.id}
                        className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-slate-100 text-base">{cam.name}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {cam.ipAddress} • {cam.type === 'ptz' ? 'چرخان' : 'ثابت'} • {getDirectionLabel(cam.direction)}
                          </div>
                        </div>
                        <div className="flex gap-2 mr-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                            onClick={() => openEditCameraModal(cam)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleDeleteCamera(cam.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={openAddCamera} onOpenChange={setOpenAddCamera}>
          <DialogContent className="sm:max-w-sm p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">دوربین جدید</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-sm text-slate-700 dark:text-slate-300">نوع</Label>
                <select
                  value={cameraType}
                  onChange={(e) => setCameraType(e.target.value as 'fixed' | 'ptz')}
                  className="col-span-3 text-right bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm"
                >
                  <option value="fixed">ثابت</option>
                  <option value="ptz">چرخان</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cam-name" className="text-right text-sm text-slate-700 dark:text-slate-300">نام</Label>
                <Input
                  id="cam-name"
                  value={cameraName}
                  onChange={(e) => setCameraName(e.target.value)}
                  className="col-span-3 text-right bg-slate-50 dark:bg-slate-700/50"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-sm text-slate-700 dark:text-slate-300">جهت</Label>
                <select
                  value={cameraDirection}
                  onChange={(e) => setCameraDirection(e.target.value as any)}
                  className="col-span-3 text-right bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm"
                >
                  <option value="north">شمال</option>
                  <option value="south">جنوب</option>
                  <option value="east">شرق</option>
                  <option value="west">غرب</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cam-ip" className="text-right text-sm text-slate-700 dark:text-slate-300">آدرس IP</Label>
                <Input
                  id="cam-ip"
                  value={cameraIP}
                  onChange={(e) => setCameraIP(e.target.value)}
                  className="col-span-3 text-right bg-slate-50 dark:bg-slate-700/50"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setOpenAddCamera(false)}
                className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                انصراف
              </Button>
              <Button
                onClick={handleAddCamera}
                className="bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                اضافه کردن
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openEditCamera} onOpenChange={setOpenEditCamera}>
          <DialogContent className="sm:max-w-sm p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">ویرایش دوربین</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-sm text-slate-700 dark:text-slate-300">نوع</Label>
                <select
                  value={cameraType}
                  onChange={(e) => setCameraType(e.target.value as 'fixed' | 'ptz')}
                  className="col-span-3 text-right bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm"
                >
                  <option value="fixed">ثابت</option>
                  <option value="ptz">چرخان</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right text-sm text-slate-700 dark:text-slate-300">نام</Label>
                <Input
                  id="edit-name"
                  value={cameraName}
                  onChange={(e) => setCameraName(e.target.value)}
                  className="col-span-3 text-right bg-slate-50 dark:bg-slate-700/50"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-sm text-slate-700 dark:text-slate-300">جهت</Label>
                <select
                  value={cameraDirection}
                  onChange={(e) => setCameraDirection(e.target.value as any)}
                  className="col-span-3 text-right bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm"
                >
                  <option value="north">شمال</option>
                  <option value="south">جنوب</option>
                  <option value="east">شرق</option>
                  <option value="west">غرب</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-ip" className="text-right text-sm text-slate-700 dark:text-slate-300">آدرس IP</Label>
                <Input
                  id="edit-ip"
                  value={cameraIP}
                  onChange={(e) => setCameraIP(e.target.value)}
                  className="col-span-3 text-right bg-slate-50 dark:bg-slate-700/50"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setOpenEditCamera(false)}
                className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                انصراف
              </Button>
              <Button
                onClick={handleUpdateCamera}
                className="bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                ذخیره
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}