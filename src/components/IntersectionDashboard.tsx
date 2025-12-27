// components/IntersectionDashboard.tsx

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Camera,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Video,
  Eye,
  Download,
  Wifi,
  Play,
  Pause,
  Activity
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

  const recentViolations = violations.slice(0, 12);

  useEffect(() => {
    if (!liveMonitoring) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        toast.warning('تخلف جدید شناسایی شد');
      }
    }, 18000);

    return () => clearInterval(interval);
  }, [liveMonitoring]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 text-xs">تخلفات تایید شده</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 text-xs">تخلفات در انتظار</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 text-xs">تخلفات رد شده</Badge>;
      default:
        return null;
    }
  };

  const getViolationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'red-light': 'چراغ قرمز',
      'crosswalk': 'خط عابر',
      'speed': 'سرعت',
      'lane-change': 'تغییر خط',
      'illegal-parking': 'پارک ممنوع'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50">
      <div className="max-w-[1800px] mx-auto px-6 py-8">

        {/* هدر مینیمال و کاربردی */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{intersection.name}</h2>
            <p className="text-sm text-slate-600 mt-1">نظارت زنده</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${liveMonitoring ? 'bg-green-500' : 'bg-slate-400'}`} />
              <span className="text-sm text-slate-700">{liveMonitoring ? 'فعال' : 'متوقف'}</span>
            </div>
            <Button
              size="sm"
              variant={liveMonitoring ? 'destructive' : 'default'}
              className="gap-2"
              onClick={() => {
                setLiveMonitoring(!liveMonitoring);
                toast.info(liveMonitoring ? 'نظارت متوقف شد' : 'نظارت فعال شد');
              }}
            >
              {liveMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {liveMonitoring ? 'توقف' : 'شروع'}
            </Button>
          </div>
        </div>

        {/* آمار کلی - مینیمال و خوانا */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-8">
          <Card className="p-5 border border-slate-200 shadow-sm hover:shadow transition-shadow">
            <p className="text-xs text-slate-600 uppercase tracking-wider">کل تخلفات</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.total}</p>
          </Card>

          <Card className="p-5 border border-slate-200 shadow-sm hover:shadow transition-shadow">
            <p className="text-xs text-green-700 uppercase tracking-wider">تخلفات تایید شده</p>
            <p className="text-2xl font-bold text-green-900 mt-2">{stats.byStatus.verified}</p>
          </Card>

          <Card className="p-5 border border-slate-200 shadow-sm hover:shadow transition-shadow">
            <p className="text-xs text-amber-700 uppercase tracking-wider">تخلفات در انتظار</p>
            <p className="text-2xl font-bold text-amber-900 mt-2">{stats.byStatus.pending}</p>
          </Card>

          <Card className="p-5 border border-slate-200 shadow-sm hover:shadow transition-shadow">
            <p className="text-xs text-red-700 uppercase tracking-wider">تخلفات رد شده</p>
            <p className="text-2xl font-bold text-red-900 mt-2">{stats.byStatus.rejected}</p>
          </Card>

          <Card className="p-5 border border-slate-200 shadow-sm hover:shadow transition-shadow">
            <p className="text-xs text-purple-700 uppercase tracking-wider">حالت دوربین چرخان  </p>
            <p className="text-xl font-bold text-purple-900 mt-2">{ptzTracking ? 'فعال' : 'غیرفعال'}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ستون چپ - دوربین‌ها */}
          <div className="lg:col-span-2 space-y-6">

            {/* دوربین‌های ثابت */}
            <Card className="p-6 border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-4">دوربین‌های ثابت</h3>
              <div className="flex gap-2 mb-5">
                {(['north', 'south', 'east', 'west'] as const).map((dir) => (
                  <Button
                    key={dir}
                    variant={selectedDirection === dir ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDirection(dir)}
                  >
                    {dir === 'north' ? 'شمال' : dir === 'south' ? 'جنوب' : dir === 'east' ? 'شرق' : 'غرب'}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {cameras.filter(c => c.type === 'fixed').length === 0 ? (
                  <p className="col-span-2 text-center text-slate-500 py-6">دوربین ثابتی موجود نیست</p>
                ) : (
                  cameras.filter(c => c.type === 'fixed').map((camera) => (
                    <div key={camera.id} className="relative bg-slate-100 rounded-xl aspect-video flex items-center justify-center border border-slate-300 hover:border-slate-400 transition-colors">
                      <Camera className="w-12 h-12 text-slate-400" />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-medium shadow">
                        {camera.name}
                      </div>
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-xs">
                        <Wifi className="w-3 h-3" />
                        زنده
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* دوربین PTZ */}
            <Card className="p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900">دوربین PTZ</h3>
                <Button
                  size="sm"
                  variant={ptzTracking ? 'default' : 'outline'}
                  onClick={() => setPtzTracking(!ptzTracking)}
                >
                  {ptzTracking ? 'فعال' : 'غیرفعال'}
                </Button>
              </div>

              <div className="relative bg-slate-100 rounded-xl aspect-video flex items-center justify-center border border-slate-300">
                <Video className="w-16 h-16 text-slate-400" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-sm font-medium shadow">
                  PTZ مرکزی
                </div>
                {ptzTracking && (
                  <div className="absolute bottom-3 left-3 bg-purple-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    ردیابی
                  </div>
                )}
              </div>
            </Card>

            {/* آمار تخلفات به تفکیک نوع */}
            <Card className="p-6 border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-5">تخلفات به تفکیک نوع</h3>
              <div className="space-y-4">
                {Object.entries(stats.byType).map(([type, count]) => {
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-700">{getViolationTypeLabel(type)}</span>
                        <span className="font-medium text-slate-900">{count}</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-500"
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
            <Card className="p-6 border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-5">
                تخلفات اخیر ({recentViolations.length})
              </h3>

              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-5">
                  <TabsTrigger value="all">همه</TabsTrigger>
                  <TabsTrigger value="verified">تخلفات تایید شده</TabsTrigger>
                  <TabsTrigger value="pending">تخلفات در حال انتظار</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 max-h-96 overflow-y-auto">
                  {recentViolations.length === 0 ? (
                    <p className="text-center text-slate-500 py-8 text-sm">تخلفی ثبت نشده</p>
                  ) : (
                    recentViolations.map((violation) => (
                      <div
                        key={violation.id}
                        className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-14 h-14 bg-slate-200 rounded-lg flex items-center justify-center">
                            <Camera className="w-7 h-7 text-slate-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-slate-900">{violation.plateNumber}</p>
                            <p className="text-xs text-slate-600 mt-1">{getViolationTypeLabel(violation.violationType)}</p>
                            <div className="mt-2">{getStatusBadge(violation.status)}</div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-600 space-y-1">
                          <p>زمان: {violation.time}</p>
                          <p>دوربین: {violation.detectionCamera}</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 text-xs">
                            <Eye className="w-3 h-3 ml-1" />
                            مشاهده
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 text-xs">
                            <Download className="w-3 h-3 ml-1" />
                            دانلود
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="verified" className="space-y-4 max-h-96 overflow-y-auto">
                  {recentViolations.filter(v => v.status === 'verified').map((violation) => (
                    <div key={violation.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-14 h-14 bg-green-200 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-7 h-7 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-slate-900">{violation.plateNumber}</p>
                          <p className="text-xs text-slate-600 mt-1">{getViolationTypeLabel(violation.violationType)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="pending" className="space-y-4 max-h-96 overflow-y-auto">
                  {recentViolations.filter(v => v.status === 'pending').map((violation) => (
                    <div key={violation.id} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-14 h-14 bg-amber-200 rounded-lg flex items-center justify-center">
                          <Clock className="w-7 h-7 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-slate-900">{violation.plateNumber}</p>
                          <p className="text-xs text-slate-600 mt-1">{getViolationTypeLabel(violation.violationType)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" className="flex-1 text-xs bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-3 h-3 ml-1" />
                          تایید
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1 text-xs">
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