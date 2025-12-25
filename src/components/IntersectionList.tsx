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
import { toast } from 'sonner';
import { Intersection, Camera } from '../types';
import {
  mockIntersections,
  addIntersection,
  addCameraToIntersection,
  removeIntersection,
  removeCameraFromIntersection,
  updateCameraInIntersection,
  predefinedCameraModels,
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
  TrafficCone,
} from 'lucide-react';

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
  const [selectedModelIndex, setSelectedModelIndex] = useState('');
  const [cameraName, setCameraName] = useState('');
  const [cameraDirection, setCameraDirection] = useState<'north' | 'south' | 'east' | 'west'>('north');
  const [cameraIP, setCameraIP] = useState('');
  const [cameraUsername, setCameraUsername] = useState('');
  const [cameraPassword, setCameraPassword] = useState('');

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
        return <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs font-medium">فعال</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs font-medium">غیرفعال</Badge>;
      case 'maintenance':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs font-medium">در تعمیر</Badge>;
    }
  };

  const totalViolations = mockIntersections.reduce((sum, int) => sum + int.todayViolations, 0);
  const activeIntersections = mockIntersections.filter(int => int.status === 'active').length;
  const totalCameras = mockIntersections.reduce((sum, int) => sum + int.camerasCount, 0);

  const handleAddIntersection = () => {
    if (!newIntName.trim() || !newIntLocation.trim() || !newIntLat || !newIntLng) {
      toast.error('همه فیلدهای الزامی را پر کنید');
      return;
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

  const handleDeleteIntersection = (id: string) => {
    if (window.confirm('آیا از حذف این چهارراه و تمام دوربین‌های آن مطمئن هستید؟')) {
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
      toast.error('آدرس IP الزامی است');
      return;
    }

    const selectedModel = selectedModelIndex ? predefinedCameraModels[parseInt(selectedModelIndex)] : null;

    addCameraToIntersection(currentIntersection.id, {
      name: cameraName.trim() || (selectedModel ? `${selectedModel.brand} ${selectedModel.model}` : 'دوربین جدید'),
      type: cameraType,
      direction: cameraDirection,
      status: 'active',
      ipAddress: cameraIP.trim(),
      username: cameraUsername.trim() || (selectedModel?.defaultUsername || 'admin'),
      password: cameraPassword.trim() || (selectedModel?.defaultPassword || ''),
    });

    setUpdateTrigger({});
    toast.success('دوربین با موفقیت اضافه شد');

    setCameraType('fixed');
    setSelectedModelIndex('');
    setCameraName('');
    setCameraDirection('north');
    setCameraIP('');
    setCameraUsername('');
    setCameraPassword('');
    setOpenAddCamera(false);
  };

  const handleDeleteCamera = (cameraId: string) => {
    if (window.confirm('آیا از حذف این دوربین مطمئن هستید؟')) {
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
    setCameraUsername(camera.username || '');
    setCameraPassword(camera.password || '');
    setOpenEditCamera(true);
  };

  const handleUpdateCamera = () => {
    if (!currentIntersection || !editingCamera || !cameraIP.trim()) {
      toast.error('آدرس IP الزامی است');
      return;
    }

    updateCameraInIntersection(currentIntersection.id, {
      ...editingCamera,
      name: cameraName.trim() || editingCamera.name,
      type: cameraType,
      direction: cameraDirection,
      ipAddress: cameraIP.trim(),
      username: cameraUsername.trim(),
      password: cameraPassword.trim(),
    });

    setUpdateTrigger({});
    toast.success('دوربین به‌روزرسانی شد');
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
    <div className="min-h-[calc(100vh-140px)] bg-slate-50">
      <div className="max-w-[1800px] mx-auto px-6 py-8">

        {/* آمار کلی - با سایه و hover ملایم */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <Card className="p-6 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">چهارراه‌ها</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{mockIntersections.length}</p>
              </div>
              <MapPin className="w-10 h-10 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">فعال</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{activeIntersections}</p>
              </div>
              <Activity className="w-10 h-10 text-green-600" />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">تخلفات امروز</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{totalViolations}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-amber-600" />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">دوربین‌ها</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{totalCameras}</p>
              </div>
              <CameraIcon className="w-10 h-10 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* جستجو و فیلتر */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="جستجو در چهارراه‌ها..."
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
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-shadow">
                <Plus className="w-4 h-4 ml-2" />
                چهارراه جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>اضافه کردن چهارراه جدید</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="int-name" className="text-right">نام</Label>
                  <Input id="int-name" value={newIntName} onChange={(e) => setNewIntName(e.target.value)} className="col-span-3" placeholder="مثال: ولیعصر - انقلاب" />
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
                  <Label className="text-right">وضعیت</Label>
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
                <Button onClick={handleAddIntersection}>اضافه کردن</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* لیست چهارراه‌ها - با انیمیشن و سایه زیبا */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredIntersections.map((intersection) => (
            <Card
              key={intersection.id}
              className="shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 bg-white rounded-xl overflow-hidden cursor-pointer transform hover:-translate-y-1"
              onClick={() => onSelectIntersection(intersection)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center shadow-inner">
                    <TrafficCone className="w-8 h-8 text-blue-600" />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 text-red-600 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteIntersection(intersection.id);
                      }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                    {getStatusBadge(intersection.status)}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  {intersection.name}
                </h3>

                <p className="text-sm text-slate-600 flex items-center gap-2 mb-5">
                  <MapPin className="w-4 h-4" />
                  {intersection.location}
                </p>

                {intersection.todayViolations > 0 ? (
                  <div className="flex items-center gap-2 text-red-600 text-sm font-medium mb-5">
                    <AlertTriangle className="w-5 h-5" />
                    {intersection.todayViolations} تخلف امروز
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 mb-5">
                    بدون تخلف امروز
                  </div>
                )}

                {/* بخش دوربین‌ها - با hover زیبا */}
                <div
                  className="mt-6 pt-5 border-t border-slate-200 cursor-pointer hover:bg-blue-50/50 rounded-xl -mx-6 px-6 py-4 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    showCamerasModal(intersection);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-blue-700 flex items-center gap-3">
                      <CameraIcon className="w-6 h-6" />
                      {intersection.camerasCount} دوربین
                    </span>
                    <span className="text-sm text-blue-600 font-medium">مدیریت →</span>
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

        {/* مدال مدیریت دوربین‌ها */}
        <Dialog open={openCamerasModal} onOpenChange={setOpenCamerasModal}>
          <DialogContent className="sm:max-w-xl" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                مدیریت دوربین‌های {currentIntersection?.name}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-6">
              <Button
                className="w-full mb-6 shadow-md hover:shadow-lg transition-shadow"
                onClick={() => setOpenAddCamera(true)}
              >
                <Plus className="w-5 h-5 ml-2" />
                اضافه کردن دوربین جدید
              </Button>

              {currentIntersection && (mockCameras[currentIntersection.id]?.length || 0) === 0 ? (
                <p className="text-center text-slate-500 py-10">هنوز دوربینی اضافه نشده است</p>
              ) : (
                <div className="space-y-4">
                  {currentIntersection && mockCameras[currentIntersection.id]?.map((cam) => (
                    <div
                      key={cam.id}
                      className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-lg">{cam.name}</div>
                        <div className="text-sm text-slate-600 mt-2">
                          IP: <span className="font-mono">{cam.ipAddress}</span> • 
                          نوع: <span className="font-medium">{cam.type === 'ptz' ? 'چرخان (PTZ)' : 'ثابت'}</span> • 
                          جهت: <span className="font-medium">{getDirectionLabel(cam.direction)}</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="shadow-sm hover:shadow"
                          onClick={() => openEditCameraModal(cam)}
                        >
                          <Edit2 className="w-4 h-4 ml-1" />
                          ویرایش
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="shadow-sm hover:shadow"
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

        {/* مدال اضافه کردن دوربین جدید */}
        <Dialog open={openAddCamera} onOpenChange={setOpenAddCamera}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>اضافه کردن دوربین جدید</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">نوع</Label>
                <Select value={cameraType} onValueChange={(v: 'fixed' | 'ptz') => setCameraType(v)}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">ثابت</SelectItem>
                    <SelectItem value="ptz">چرخان</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cam-name" className="text-right">نام</Label>
                <Input id="cam-name" value={cameraName} onChange={(e) => setCameraName(e.target.value)} className="col-span-3" placeholder="اختیاری" />
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
                <Label htmlFor="cam-ip" className="text-right">IP</Label>
                <Input id="cam-ip" value={cameraIP} onChange={(e) => setCameraIP(e.target.value)} className="col-span-3" placeholder="192.168.1.101" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddCamera}>اضافه کردن</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* مدال ویرایش دوربین */}
        <Dialog open={openEditCamera} onOpenChange={setOpenEditCamera}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>ویرایش: {editingCamera?.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">نوع</Label>
                <Select value={cameraType} onValueChange={(v: 'fixed' | 'ptz') => setCameraType(v)}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">ثابت</SelectItem>
                    <SelectItem value="ptz">چرخان</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">نام</Label>
                <Input id="edit-name" value={cameraName} onChange={(e) => setCameraName(e.target.value)} className="col-span-3" />
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
                <Label htmlFor="edit-ip" className="text-right">IP</Label>
                <Input id="edit-ip" value={cameraIP} onChange={(e) => setCameraIP(e.target.value)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateCamera}>ذخیره</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}