// src/components/IntersectionDashboard.tsx

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Pie } from 'react-chartjs-2';

// رجیستر کردن پلاگین‌ها (یک‌بار در اپلیکیشن کافی است)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

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
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {intersection.name}
            </h2>
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

        {/* کارت‌های آمار */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md">
            <p className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              کل تخلفات امروز
            </p>
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.total}</p>
          </Card>
          <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md">
            <p className="text-[10px] text-green-700 dark:text-green-300 uppercase tracking-wider">
              تخلفات تایید شده
            </p>
            <p className="text-lg font-bold text-green-900 dark:text-green-100 mt-1">
              {stats.byStatus.verified}
            </p>
          </Card>
          <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md">
            <p className="text-[10px] text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              تخلفات در حال انتظار
            </p>
            <p className="text-lg font-bold text-amber-900 dark:text-amber-100 mt-1">
              {stats.byStatus.pending}
            </p>
          </Card>
          <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md">
            <p className="text-[10px] text-red-700 dark:text-red-300 uppercase tracking-wider">
              تخلفات رد شده
            </p>
            <p className="text-lg font-bold text-red-900 dark:text-red-100 mt-1">
              {stats.byStatus.rejected}
            </p>
          </Card>
          <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md">
            <p className="text-[10px] text-purple-700 dark:text-purple-300 uppercase tracking-wider">
              وضعیت دوربین چرخان (PTZ)
            </p>
            <p className="text-base font-bold text-purple-900 dark:text-purple-100 mt-1">
              {ptzTracking ? 'فعال' : 'غیرفعال'}
            </p>
          </Card>
        </div>

        {/* نمودارها — در کنار هم */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* نمودار ستونی */}
          <Card className="p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg h-[65vh] flex flex-col">
  <h3 className=" text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 text-center">
    تعداد تخلفات بر اساس نوع
  </h3>
            {/* 👇 این دیو 20% کوتاه‌تر از ارتفاع کارت است */}
            <div className="flex-1 w-full flex items-center justify-center">


            
   <div className="w-[90%] h-[80%]">
    {validTypeIds.some(id => (stats.byType[id] || 0) > 0) ? (
      <Bar
        data={{
          labels: validTypeIds.map(id => violationTypeMap[id].name),
          datasets: [
            {
              label: 'تعداد تخلفات',
 data: validTypeIds.map(id => stats.byType[id] || 0),
              backgroundColor: validTypeIds.map(id => violationTypeMap[id].color + '80'),
              borderColor: validTypeIds.map(id => violationTypeMap[id].color),
              borderWidth: 0.5,
              borderRadius: 5,
              borderSkipped: false,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          barThickness: 35,
          categoryPercentage: 0.7,
          barPercentage: 0.85,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              titleColor: '#fff',
              bodyColor: '#e2e8f0',
              titleFont: { size: 13, weight: 'bold' },
              bodyFont: { size: 12 },
              padding: 12,
              cornerRadius: 8,
            },
          },
          scales: {
            x: {
              ticks: {
                color: '#94a3b8',
                font: { size: 11 },
                maxRotation: 0,
                autoSkip: true,
              },
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: '#94a3b8',
                font: { size: 11 },
                stepSize: 1,
              },
              grid: {
                color: 'rgba(148, 163, 184, 0.1)',
              },
            },
          },
        }}
      />
    ) : (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-slate-400" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            هیچ تخلفی برای نمایش وجود ندارد
          </p>
        </div>
      </div>
    )}
  </div></div>
</Card>

          {/* نمودار دونات */}
          <Card className="p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg h-[65vh] flex flex-col">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 text-center">
              درصد تخلفات بر اساس نوع            </h3>
           <div className="flex-1 w-full flex items-center justify-center">


            
   <div className="w-[90%] h-[80%]">
              {validTypeIds.some(id => (stats.byType[id] || 0) > 0) ? (
                <Pie
                  data={{
                    labels: validTypeIds.map(id => violationTypeMap[id].name),
                    datasets: [
                      {
                        label: 'درصد تخلفات',
 data: validTypeIds.map(id => stats.byType[id] || 0),
                        backgroundColor: validTypeIds.map(id => violationTypeMap[id].color + 'B0'),
                        borderWidth: 0,
                        borderColor: 'transparent',
                        cutout: '50%',
                        borderRadius: 5,
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
                          color: '#cbd5e1',
                          font: { size: 11 },
                          padding: 12,
                          usePointStyle: true,
                          pointStyle: 'circle',
                        },
                      },
                      tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#e2e8f0',
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                          label: (context) => {
                            const total = context.dataset.data.reduce((a, b) => a + (b as number), 0);
                            const value = context.raw as number;
                            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                            return `${context.label}: ${percent}% (${value})`;
                          },
                        },
                      },
                      datalabels: {
                        color: '#fff',
                        font: {
                          weight: 'bold',
                          size: 12,
                        },
                        formatter: (value, context) => {
                          const total = context.dataset.data.reduce((a, b) => a + (b as number), 0);
                          const percent = total > 0 ? ((value as number) / total * 100).toFixed(0) + '%' : '';
                          return percent;
                        },
                        anchor: 'center',
                        align: 'center',
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      هیچ تخلفی برای نمایش وجود ندارد
                    </p>
                  </div>
                </div>
              )}
              </div>
              </div>
          </Card>
        </div>
      </div>
    </div>
  );
}