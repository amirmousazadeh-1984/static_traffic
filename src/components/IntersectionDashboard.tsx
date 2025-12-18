import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowRight,
  Camera,
  AlertTriangle,
  Clock,
  Activity,
  Eye,
  CheckCircle,
  XCircle,
  MapPin,
  Video,
  Download
} from 'lucide-react';
import { Intersection, Violation } from '../types';

interface IntersectionDashboardProps {
  intersection: Intersection;
  onBack: () => void;
}

export function IntersectionDashboard({ intersection, onBack }: IntersectionDashboardProps) {
  const [ptzStatus, setPtzStatus] = useState({
    currentDirection: 'شمال',
    isTracking: true,
    targetViolation: 'V2024121805',
    zoom: '10x',
    recording: true
  });

  const [recentViolations, setRecentViolations] = useState<Violation[]>([
    {
      id: 'V2024121805',
      intersectionId: intersection.id,
      plateNumber: '۱۲ ص ۳۴۵ ایران ۶۷',
      violationType: 'عبور از چراغ قرمز',
      direction: 'north',
      maskId: 'vio-mask-north-1',
      detectionCamera: 'دوربین ثابت شمال',
      ptzPresetUsed: 'پیش‌فرض شمال',
      date: '۱۴۰۳/۰۹/۲۸',
      time: '۱۴:۵۶:۲۳',
      status: 'verified',
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80',
      videoUrl: '#'
    },
    {
      id: 'V2024121804',
      intersectionId: intersection.id,
      plateNumber: '۸۹ الف ۱۲۳ ایران ۴۵',
      violationType: 'توقف در خط عابر پیاده',
      direction: 'south',
      maskId: 'vio-mask-south-2',
      detectionCamera: 'دوربین ثابت جنوب',
      ptzPresetUsed: 'پیش‌فرض جنوب',
      date: '۱۴۰۳/۰۹/۲۸',
      time: '۱۴:۴۵:۱۲',
      status: 'pending',
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80&sig=2',
      videoUrl: '#'
    },
    {
      id: 'V2024121803',
      intersectionId: intersection.id,
      plateNumber: '۳۴ ب ۵۶۷ ایران ۸۹',
      violationType: 'تغییر خط غیرمجاز',
      direction: 'east',
      maskId: 'vio-mask-east-1',
      detectionCamera: 'دوربین ثابت شرق',
      ptzPresetUsed: 'پیش‌فرض شرق',
      date: '۱۴۰۳/۰۹/۲۸',
      time: '۱۴:۳۰:۴۵',
      status: 'verified',
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80&sig=3',
      videoUrl: '#'
    }
  ]);

  const stats = {
    todayTotal: intersection.todayViolations,
    verified: recentViolations.filter(v => v.status === 'verified').length,
    pending: recentViolations.filter(v => v.status === 'pending').length,
    ptzActive: ptzStatus.isTracking
  };

  const getDirectionLabel = (dir: string) => {
    const map: Record<string, string> = {
      north: 'شمال',
      south: 'جنوب',
      east: 'شرق',
      west: 'غرب'
    };
    return map[dir] || dir;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500">تایید شده</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">رد شده</Badge>;
      default:
        return <Badge className="bg-yellow-500">در انتظار</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                داشبورد نظارت - {intersection.name}
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {intersection.location}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700">سیستم فعال</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">تخلفات امروز</p>
                  <p className="text-3xl font-bold mt-1">{stats.todayTotal}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">تایید شده</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{stats.verified}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">در انتظار بررسی</p>
                  <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">وضعیت PTZ</p>
                  <p className="text-lg font-bold mt-1 text-blue-600">
                    {ptzStatus.isTracking ? 'در حال ردیابی' : 'آماده'}
                  </p>
                </div>
                <Camera className="w-10 h-10 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Feeds */}
          <div className="lg:col-span-2 space-y-6">
            {/* PTZ Camera */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>دوربین PTZ - نمای زنده</CardTitle>
                  <div className="flex items-center gap-2">
                    {ptzStatus.recording && (
                      <Badge className="bg-red-500 animate-pulse">
                        <Video className="w-3 h-3 ml-1" />
                        در حال ضبط
                      </Badge>
                    )}
                    {ptzStatus.isTracking && (
                      <Badge className="bg-blue-500">
                        ردیابی فعال
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                  <img 
                    src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80" 
                    alt="PTZ Camera View"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Tracking Indicator */}
                  {ptzStatus.isTracking && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-24 h-24 border-2 border-red-500 rounded animate-pulse">
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-red-500"></div>
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-500"></div>
                      </div>
                    </div>
                  )}

                  {/* Info Overlay */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between">
                    <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-xs space-y-1">
                      <div>جهت: {ptzStatus.currentDirection}</div>
                      <div>زوم: {ptzStatus.zoom}</div>
                    </div>
                    {ptzStatus.isTracking && (
                      <div className="bg-red-500/90 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
                        ردیابی تخلف #{ptzStatus.targetViolation}
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-xs">
                    <Clock className="w-3 h-3 inline ml-1" />
                    {new Date().toLocaleTimeString('fa-IR')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fixed Cameras */}
            <Card>
              <CardHeader>
                <CardTitle>دوربین‌های ثابت - نمای همزمان</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {['شمال', 'جنوب', 'شرق', 'غرب'].map((dir, idx) => (
                    <div key={dir} className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                      <img 
                        src={`https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80&sig=${idx}`}
                        alt={`${dir} Camera`}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 px-2 py-1 rounded text-white text-xs flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        فعال
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
                        {dir}
                      </div>
                      {/* Detection zones indicator */}
                      <div className="absolute bottom-2 left-2 bg-blue-500 px-2 py-1 rounded text-white text-xs">
                        {Math.floor(Math.random() * 3) + 1} منطقه
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  گزارش فعالیت‌ها
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">دوربین PTZ به جهت شمال چرخید</p>
                      <p className="text-xs text-gray-600 mt-1">۱۴:۵۶:۲۳ - Preset "پیش‌فرض شمال" اجرا شد</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">تخلف جدید شناسایی شد</p>
                      <p className="text-xs text-gray-600 mt-1">۱۴:۵۶:۲۰ - عبور از چراغ قرمز در جهت شمال</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">تخلف تایید شد</p>
                      <p className="text-xs text-gray-600 mt-1">۱۴:۵۵:۱۰ - شناسه V2024121803</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* PTZ Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  وضعیت دوربین PTZ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">حالت</span>
                    <Badge className={ptzStatus.isTracking ? 'bg-blue-500' : 'bg-gray-400'}>
                      {ptzStatus.isTracking ? 'ردیابی' : 'آماده'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">جهت فعلی</span>
                    <span className="font-medium">{ptzStatus.currentDirection}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">زوم</span>
                    <span className="font-medium">{ptzStatus.zoom}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">ضبط</span>
                    <Badge className={ptzStatus.recording ? 'bg-red-500' : 'bg-gray-400'}>
                      {ptzStatus.recording ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Violations */}
            <Card>
              <CardHeader>
                <CardTitle>تخلفات اخیر</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentViolations.slice(0, 5).map((violation) => (
                    <div
                      key={violation.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="font-medium text-sm">#{violation.id.slice(-3)}</span>
                        </div>
                        {getStatusBadge(violation.status)}
                      </div>
                      <div className="space-y-1 text-xs">
                        <p className="font-medium text-gray-900">{violation.violationType}</p>
                        <p className="text-gray-600">{violation.plateNumber}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <span className="text-gray-500">{getDirectionLabel(violation.direction)}</span>
                          <span className="text-gray-500">{violation.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm">
                  مشاهده همه
                </Button>
              </CardContent>
            </Card>

            {/* Detection Zones */}
            <Card>
              <CardHeader>
                <CardTitle>مناطق تشخیص فعال</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {['شمال', 'جنوب', 'شرق', 'غرب'].map((dir, idx) => (
                    <div key={dir} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{dir}</span>
                      </div>
                      <span className="text-xs text-gray-600">
                        {Math.floor(Math.random() * 3) + 1} منطقه
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
