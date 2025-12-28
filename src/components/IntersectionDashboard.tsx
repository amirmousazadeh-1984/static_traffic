// src/components/IntersectionDashboard.tsx

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Camera,
  AlertTriangle,
  Play,
  Pause,
  Video,
  Wifi,
  Activity,
  Eye,
  Download,
  Plus
} from 'lucide-react';
import { Intersection } from '../types';
import { mockViolations, mockCameras } from '../data/mockDatabase';
import { toast } from 'sonner';

interface IntersectionDashboardProps {
  intersection: Intersection;
  onChangeTab?: (tab: string) => void;
}

export function IntersectionDashboard({ intersection, onChangeTab }: IntersectionDashboardProps) {
  const [selectedDirection, setSelectedDirection] = useState<'north' | 'south' | 'east' | 'west'>('north');
  const [liveMonitoring, setLiveMonitoring] = useState(true);
  const [ptzTracking, setPtzTracking] = useState(true);

  // ⚠️ mock violation types — جایگزین Redux (موقت)
  const violationTypes = [
    { id: '1', name: 'عبور از چراغ قرمز', color: '#ef4444' },
    { id: '2', name: 'تجاوز به خط عابر', color: '#f97316' },
    { id: '3', name: 'سرعت غیرمجاز', color: '#8b5cf6' },
    { id: '4', name: 'تغییر خط ممنوع', color: '#ec4899' },
    { id: '5', name: 'پارک ممنوع', color: '#10b981' },
  ];

  const violations = mockViolations.filter(v => v.intersectionId === intersection.id);
  const cameras = mockCameras[intersection.id] || [];
  const recentViolations = violations.slice(0, 12);

  // آمار
  const stats = {
    total: violations.length,
    byStatus: {
      verified: violations.filter(v => v.status === 'verified').length,
      pending: violations.filter(v => v.status === 'pending').length,
      rejected: violations.filter(v => v.status === 'rejected').length,
    },
    byType: violationTypes.reduce((acc, type) => {
      acc[type.id] = violations.filter(v => v.violationType === type.id).length;
      return acc;
    }, {} as Record<string, number>),
  };

  // نظارت زنده — شبیه‌سازی هشدار
  useEffect(() => {
    if (!liveMonitoring) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        toast.warning('تخلف جدید شناسایی شد', { duration: 5000 });
      }
    }, 18000);

    return () => clearInterval(interval);
  }, [liveMonitoring]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs">
            تایید شده
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs">
            در انتظار
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs">
            رد شده
          </Badge>
        );
      default:
        return null;
    }
  };

  const getViolationTypeLabel = (typeId: string) => {
    const type = violationTypes.find(v => v.id === typeId);
    return type ? type.name : typeId;
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 dark:bg-slate-900">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* هدر داشبورد */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{intersection.name}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">نظارت زنده و آمار لحظه‌ای</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  liveMonitoring ? 'bg-green-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'
                }`}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {liveMonitoring ? 'فعال' : 'متوقف'}
              </span>
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

        {/* کارت‌های آماری */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-8">
          <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
            <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">کل تخلفات امروز</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{stats.total}</p>
          </Card>

          <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
            <p className="text-xs text-green-700 dark:text-green-300 uppercase tracking-wider">تایید شده</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-2">
              {stats.byStatus.verified}
            </p>
          </Card>

          <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
            <p className="text-xs text-amber-700 dark:text-amber-300 uppercase tracking-wider">در انتظار</p>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-2">
              {stats.byStatus.pending}
            </p>
          </Card>

          <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
            <p className="text-xs text-red-700 dark:text-red-300 uppercase tracking-wider">رد شده</p>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-2">
              {stats.byStatus.rejected}
            </p>
          </Card>

          <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
            <p className="text-xs text-purple-700 dark:text-purple-300 uppercase tracking-wider">ردیابی PTZ</p>
            <p className="text-xl font-bold text-purple-900 dark:text-purple-100 mt-2">
              {ptzTracking ? 'فعال' : 'غیرفعال'}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ستون چپ: دوربین‌ها و آمار */}
          <div className="lg:col-span-2 space-y-6">
         
            {/* تخلفات به تفکیک نوع */}
            <Card className="p-6 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  تخلفات به تفکیک نوع
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                  onClick={() => onChangeTab?.('violations')}
                >
                  <Plus className="w-3 h-3" />
                  تخلف جدید
                </Button>
              </div>

              <div className="space-y-4">
                {violationTypes.length === 0 ? (
                  <div className="text-center py-10">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-400 opacity-50" />
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                      هیچ نوع تخلفی تعریف نشده است
                    </p>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => onChangeTab?.('violations')}
                    >
                      افزودن اولین تخلف
                    </Button>
                  </div>
                ) : (
                  violationTypes.map((type) => {
                    const count = stats.byType[type.id] || 0;
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

                    return (
                      <div key={type.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                            {type.name}
                          </span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{count}</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-700"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: type.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* ستون راست: تخلفات اخیر */}
          <div className="space-y-6">
            <Card className="p-6 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-5">
                تخلفات اخیر ({recentViolations.length})
              </h3>

              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-5 bg-transparent">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md text-slate-700 dark:text-slate-300"
                  >
                    همه
                  </TabsTrigger>
                  <TabsTrigger
                    value="verified"
                    className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-md text-slate-700 dark:text-slate-300"
                  >
                    تایید شده
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="data-[state=active]:bg-amber-600 data-[state=active]:text-white rounded-md text-slate-700 dark:text-slate-300"
                  >
                    در انتظار
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 max-h-96 overflow-y-auto">
                  {recentViolations.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-12 text-sm">
                      تخلفی در این چهارراه ثبت نشده
                    </p>
                  ) : (
                    recentViolations.map((violation) => (
                      <Card
                        key={violation.id}
                        className="p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-14 h-14 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                            <Camera className="w-7 h-7 text-slate-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                              {violation.plateNumber}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {getViolationTypeLabel(violation.violationType)}
                            </p>
                            <div className="mt-2">{getStatusBadge(violation.status)}</div>
                          </div>
                        </div>

                        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mb-4">
                          <p>زمان: {violation.time}</p>
                          <p>دوربین: {violation.detectionCamera}</p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                          >
                            <Eye className="w-3 h-3 ml-1" />
                            مشاهده
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                          >
                            <Download className="w-3 h-3 ml-1" />
                            دانلود
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}