import React from 'react';
import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Camera,
  AlertTriangle,
  Clock,
  Activity,
  Eye,
  CheckCircle,
  XCircle,
  Video,
  Download,
  Play,
  Pause,
  Wifi
} from 'lucide-react';
import { Intersection } from '../types';
import { mockViolations, mockCameras, violationStats } from '../data/mockDatabase';
import { toast } from 'sonner';

interface IntersectionDashboardProps {
  intersection: Intersection;
}

export function IntersectionDashboard({ intersection }: IntersectionDashboardProps) {
  const [selectedDirection, setSelectedDirection] = useState<'north' | 'south' | 'east' | 'west'>('north');
  const [liveMonitoring, setLiveMonitoring] = useState(true);
  const [ptzTracking, setPtzTracking] = useState(true);

  const violations = mockViolations.filter(v => v.intersectionId === intersection.id);
  const cameras = mockCameras[intersection.id] || [];
  const stats = violationStats.today;

  const recentViolations = violations.slice(0, 10);
  const verifiedCount = violations.filter(v => v.status === 'verified').length;
  const pendingCount = violations.filter(v => v.status === 'pending').length;

  useEffect(() => {
    if (!liveMonitoring) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        toast.warning('تخلف جدید شناسایی شد!', {
          description: 'دوربین PTZ در حال ضبط جزئیات است...'
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [liveMonitoring]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 ml-1" />
            تایید شده
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-orange-100 text-orange-700">
            <Clock className="w-3 h-3 ml-1" />
            در انتظار
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="w-3 h-3 ml-1" />
            رد شده
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)]">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* هدر */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">داشبورد نظارت زنده</h2>
              <p className="text-slate-600">{intersection.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${liveMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm text-slate-600">{liveMonitoring ? 'نظارت فعال' : 'نظارت متوقف'}</span>
              </div>
              <Button
                variant={liveMonitoring ? 'destructive' : 'default'}
                onClick={() => {
                  setLiveMonitoring(!liveMonitoring);
                  toast.info(liveMonitoring ? 'نظارت متوقف شد' : 'نظارت شروع شد');
                }}
              >
                {liveMonitoring ? <Pause className="w-4 h-4 ml-2" /> : <Play className="w-4 h-4 ml-2" />}
                {liveMonitoring ? 'توقف نظارت' : 'شروع نظارت'}
              </Button>
            </div>
          </div>
        </div>

        {/* آمار کلی */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 mb-1">کل تخلفات امروز</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">تایید شده</p>
                <p className="text-3xl font-bold text-green-900">{stats.byStatus.verified}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 mb-1">در انتظار</p>
                <p className="text-3xl font-bold text-orange-900">{stats.byStatus.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 mb-1">رد شده</p>
                <p className="text-3xl font-bold text-red-900">{stats.byStatus.rejected}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 mb-1">دوربین PTZ</p>
                <p className="text-sm font-bold text-purple-900">
                  {ptzTracking ? 'فعال' : 'غیرفعال'}
                </p>
              </div>
              <Video className="w-10 h-10 text-purple-600 opacity-50" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ستون چپ - دوربین‌های زنده */}
          <div className="lg:col-span-2 space-y-6">
            {/* نمای دوربین‌های ثابت */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  دوربین‌های ثابت - نمای زنده
                </h3>
                <div className="flex gap-2">
                  {(['north', 'south', 'east', 'west'] as const).map((dir) => (
                    <Button
                      key={dir}
                      variant={selectedDirection === dir ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedDirection(dir)}
                    >
                      {dir === 'north' && 'شمال'}
                      {dir === 'south' && 'جنوب'}
                      {dir === 'east' && 'شرق'}
                      {dir === 'west' && 'غرب'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Grid دوربین‌ها */}
              <div className="grid grid-cols-2 gap-4">
                {cameras.filter(c => c.type === 'fixed').map((camera) => (
                  <div key={camera.id} className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video group">
                    <img
                      src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop"
                      alt={camera.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* اطلاعات دوربین */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <Badge className="bg-blue-600">
                        <Camera className="w-3 h-3 ml-1" />
                        {camera.name}
                      </Badge>
                      <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-xs">
                        <Wifi className="w-3 h-3" />
                        زنده
                      </div>
                    </div>

                    {/* کنترل‌های hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button size="sm" variant="secondary">
                        <Eye className="w-4 h-4 ml-2" />
                        تمام صفحه
                      </Button>
                    </div>

                    {/* شناسایی تخلف */}
                    {camera.direction === selectedDirection && Math.random() > 0.5 && (
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-red-600 text-white px-3 py-2 rounded flex items-center gap-2 text-sm animate-pulse">
                          <AlertTriangle className="w-4 h-4" />
                          تخلف در حال شناسایی...
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* نمای دوربین PTZ */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-600" />
                  دوربین PTZ - ردیابی خودکار
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">ردیابی خودکار</span>
                  <Button
                    size="sm"
                    variant={ptzTracking ? 'default' : 'outline'}
                    onClick={() => {
                      setPtzTracking(!ptzTracking);
                      toast.info(ptzTracking ? 'ردیابی PTZ متوقف شد' : 'ردیابی PTZ فعال شد');
                    }}
                  >
                    {ptzTracking ? 'فعال' : 'غیرفعال'}
                  </Button>
                </div>
              </div>

              <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video">
                <img
                  src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=700&fit=crop"
                  alt="PTZ View"
                  className="w-full h-full object-cover"
                />

                {/* Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative">
                    <div className="w-32 h-32 border-2 border-purple-500 rounded-full opacity-50"></div>
                    <div className="absolute top-1/2 left-1/2 w-16 h-px bg-purple-500 -translate-x-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-px h-16 bg-purple-500 -translate-y-1/2"></div>
                  </div>
                </div>

                {/* اطلاعات ردیابی */}
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm px-4 py-3 rounded-lg text-white">
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="font-semibold">REC</span>
                    </p>
                    <p>جهت: شمال</p>
                    <p>زوم: 10x</p>
                    <p>هدف: تخلف V-{Math.floor(Math.random() * 10000)}</p>
                  </div>
                </div>

                {ptzTracking && (
                  <div className="absolute bottom-4 left-4 right-4 bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span className="text-sm font-semibold">در حال ردیابی تخلف...</span>
                  </div>
                )}
              </div>

              {/* کنترل‌های سریع PTZ */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  آخرین ردیابی: 2 دقیقه پیش
                </div>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 ml-2" />
                  دانلود ویدئو
                </Button>
              </div>
            </Card>

            {/* آمار تخلفات به تفکیک نوع */}
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-6">آمار تخلفات امروز به تفکیک نوع</h3>
              <div className="space-y-3">
                {Object.entries(stats.byType).map(([type, count]) => {
                  const typeNames: Record<string, string> = {
                    'red-light': 'عبور از چراغ قرمز',
                    'crosswalk': 'تجاوز به خط عابر',
                    'speed': 'سرعت غیرمجاز',
                    'lane-change': 'تغییر خط ممنوع',
                    'illegal-parking': 'پارک ممنوع'
                  };
                  const colors: Record<string, string> = {
                    'red-light': 'bg-red-100 text-red-700',
                    'crosswalk': 'bg-orange-100 text-orange-700',
                    'speed': 'bg-purple-100 text-purple-700',
                    'lane-change': 'bg-pink-100 text-pink-700',
                    'illegal-parking': 'bg-green-100 text-green-700'
                  };
                  
                  const percentage = (count / stats.total) * 100;
                  
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">{typeNames[type]}</span>
                        <span className="font-semibold">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors[type]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* ستون راست - تخلفات اخیر */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                تخلفات ثبت شده ({recentViolations.length})
              </h3>

              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="all">همه</TabsTrigger>
                  <TabsTrigger value="verified">تایید شده</TabsTrigger>
                  <TabsTrigger value="pending">در انتظار</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-3 max-h-[800px] overflow-y-auto">
                  {recentViolations.map((violation) => (
                    <div
                      key={violation.id}
                      className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <img
                          src={violation.imageUrl}
                          alt="تخلف"
                          className="w-20 h-20 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-900 mb-1">
                            {violation.plateNumber}
                          </p>
                          <p className="text-xs text-slate-600 mb-2">{violation.violationType}</p>
                          {getStatusBadge(violation.status)}
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-xs text-slate-600 pt-3 border-t">
                        <p className="flex items-center justify-between">
                          <span>زمان:</span>
                          <span className="font-mono">{violation.date} - {violation.time}</span>
                        </p>
                        <p className="flex items-center justify-between">
                          <span>دوربین:</span>
                          <span>{violation.detectionCamera}</span>
                        </p>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-3 h-3 ml-1" />
                          مشاهده
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="w-3 h-3 ml-1" />
                          دانلود
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="verified" className="space-y-3 max-h-[800px] overflow-y-auto">
                  {recentViolations.filter(v => v.status === 'verified').map((violation) => (
                    <div
                      key={violation.id}
                      className="p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <img
                          src={violation.imageUrl}
                          alt="تخلف"
                          className="w-20 h-20 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-900 mb-1">
                            {violation.plateNumber}
                          </p>
                          <p className="text-xs text-slate-600 mb-2">{violation.violationType}</p>
                          {getStatusBadge(violation.status)}
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-slate-600 pt-3 border-t border-green-200">
                        <p className="flex items-center justify-between">
                          <span>زمان:</span>
                          <span className="font-mono">{violation.date} - {violation.time}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="pending" className="space-y-3 max-h-[800px] overflow-y-auto">
                  {recentViolations.filter(v => v.status === 'pending').map((violation) => (
                    <div
                      key={violation.id}
                      className="p-4 bg-orange-50 rounded-lg border border-orange-200"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <img
                          src={violation.imageUrl}
                          alt="تخلف"
                          className="w-20 h-20 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-900 mb-1">
                            {violation.plateNumber}
                          </p>
                          <p className="text-xs text-slate-600 mb-2">{violation.violationType}</p>
                          {getStatusBadge(violation.status)}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-3 h-3 ml-1" />
                          تایید
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1">
                          <XCircle className="w-3 h-3 ml-1" />
                          رد
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
