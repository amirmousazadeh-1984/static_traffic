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
  Plus,
  Eye,
  Download,
} from 'lucide-react';
import { Intersection } from '../types';
import { mockViolations, mockCameras } from '../data/mockDatabase';
import { toast } from 'sonner';

// Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const violationNameToId: Record<string, string> = {
  'عبور از چراغ قرمز': 'red-light',
  'تجاوز به خط عابر پیاده': 'crosswalk',
  'سرعت غیرمجاز': 'speed',
  'تغییر خط ممنوع': 'lane-change',
  'پارک در محل ممنوع': 'illegal-parking',
};

const violationTypeMap: Record<string, { name: string; color: string }> = {
  'red-light': { name: 'عبور از چراغ قرمز', color: '#ef4444' },
  'crosswalk': { name: 'تجاوز به خط عابر پیاده', color: '#f59e0b' },
  'speed': { name: 'سرعت غیرمجاز', color: '#8b5cf6' },
  'lane-change': { name: 'تغییر خط ممنوع', color: '#ec4899' },
  'illegal-parking': { name: 'پارک در محل ممنوع', color: '#10b981' },
};

interface IntersectionDashboardProps {
  intersection: Intersection;
  onChangeTab?: (tab: string) => void;
}

export function IntersectionDashboard({ intersection, onChangeTab }: IntersectionDashboardProps) {
  const [liveMonitoring, setLiveMonitoring] = useState(true);
  const [ptzTracking, setPtzTracking] = useState(true);

  const violations = mockViolations.filter(v => v.intersectionId === intersection.id);
  const recentViolations = violations.slice(0, 12);
  const violationsWithId = violations.map(v => ({
    ...v,
    violationTypeId: violationNameToId[v.violationType] || 'unknown',
  }));

  const validTypeIds = Object.keys(violationTypeMap);

  const stats = {
    total: violations.length,
    byStatus: {
      verified: violations.filter(v => v.status === 'verified').length,
      pending: violations.filter(v => v.status === 'pending').length,
      rejected: violations.filter(v => v.status === 'rejected').length,
    },
    byType: validTypeIds.reduce((acc, id) => {
      acc[id] = violationsWithId.filter(v => v.violationTypeId === id).length;
      return acc;
    }, {} as Record<string, number>),
  };

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

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 dark:bg-slate-900">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
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

       <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
  <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md">
    <p className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-wider">کل تخلفات امروز</p>
    <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.total}</p>
  </Card>
  <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md">
    <p className="text-[10px] text-green-700 dark:text-green-300 uppercase tracking-wider">تخلفات تایید شده</p>
    <p className="text-lg font-bold text-green-900 dark:text-green-100 mt-1">{stats.byStatus.verified}</p>
  </Card>
  <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md">
    <p className="text-[10px] text-amber-700 dark:text-amber-300 uppercase tracking-wider">تخلفات در حال انتظار</p>
    <p className="text-lg font-bold text-amber-900 dark:text-amber-100 mt-1">{stats.byStatus.pending}</p>
  </Card>
  <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md">
    <p className="text-[10px] text-red-700 dark:text-red-300 uppercase tracking-wider">تخلفات رد شده</p>
    <p className="text-lg font-bold text-red-900 dark:text-red-100 mt-1">{stats.byStatus.rejected}</p>
  </Card>
  <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md">
    <p className="text-[10px] text-purple-700 dark:text-purple-300 uppercase tracking-wider">وضعیت دوربین چرخان (PTZ)</p>
    <p className="text-base font-bold text-purple-900 dark:text-purple-100 mt-1">
      {ptzTracking ? 'فعال' : 'غیرفعال'}
    </p>
  </Card>
</div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  تحلیل آماری تخلفات
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

              {validTypeIds.length === 0 ? (
                <div className="text-center py-10">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-400 opacity-50" />
                  <p className="text-slate-500 dark:text-slate-400 mb-4">هیچ نوع تخلفی تعریف نشده است</p>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => onChangeTab?.('violations')}
                  >
                    افزودن اولین تخلف
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bar Chart */}
                  <div className="flex flex-col h-[240px]">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 text-center">
                      تعداد تخلفات
                    </h4>
                    <div className="flex-1">
                      <Bar
                        data={{
                          labels: validTypeIds.map(id => violationTypeMap[id].name),
                          datasets: [
                            {
                              label: 'تعداد',
data: validTypeIds.map(id => stats.byType[id] || 0),                              backgroundColor: validTypeIds.map(id => violationTypeMap[id].color),
                              borderColor: validTypeIds.map(id => violationTypeMap[id].color),
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: 'rgba(30, 41, 59, 0.9)',
                              titleColor: '#fff',
                              bodyColor: '#f1f5f9',
                              padding: 10,
                            },
                          },
                          scales: {
                            x: {
                              ticks: { color: '#94a3b8', font: { size: 10 } },
                              grid: { display: false },
                            },
                            y: {
                              beginAtZero: true,
                              ticks: { color: '#94a3b8' },
                              grid: { color: 'rgba(148, 163, 184, 0.1)' },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* Pie Chart */}
                  <div className="flex flex-col h-[240px]">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2 text-center">
                      درصد تخلفات
                    </h4>
                    <div className="flex-1">
                      <Pie
                        data={{
                          labels: validTypeIds.map(id => violationTypeMap[id].name),
                          datasets: [
                            {
                              label: 'درصد',
data: validTypeIds.map(id => stats.byType[id] || 0),                              backgroundColor: validTypeIds.map(id => violationTypeMap[id].color),
                              borderWidth: 0,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right' as const,
                              labels: {
                                color: '#f1f5f9',
                                font: { size: 10 },
                                padding: 8,
                                usePointStyle: true,
                              },
                            },
                            tooltip: {
                              backgroundColor: 'rgba(15, 23, 42, 0.9)',
                              titleColor: '#fff',
                              bodyColor: '#e2e8f0',
                              padding: 10,
                              callbacks: {
                                label: (context) => {
                                  const total = context.dataset.data.reduce((a, b) => a + (b as number), 0);
                                  const value = context.raw as number;
                                  const percent = total > 0 ? (value / total) * 100 : 0;
                                  return `${context.label}: ${percent.toFixed(1)}% (${value})`;
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

         
        </div>
      </div>
    </div>
  );
}