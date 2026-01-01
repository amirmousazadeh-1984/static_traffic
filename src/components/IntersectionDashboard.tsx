


// // src/components/IntersectionDashboard.tsx

// import React, { useState, useEffect } from 'react';
// import { Card } from './ui/card';
// import { Button } from './ui/button';
// import { Badge } from './ui/badge';
// import {
//   FileText,
//   CheckCircle,
//   Clock,
//   XCircle,
//   Video,
//   AlertTriangle,
//   Play,
//   Pause,
// } from 'lucide-react';
// import { Intersection } from '../types';
// import { mockViolations } from '../data/mockDatabase';
// import { toast } from 'sonner';

// // Chart.js
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   ArcElement,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import ChartDataLabels from 'chartjs-plugin-datalabels';
// import { Bar, Pie } from 'react-chartjs-2';
// import { translations, type Language } from '../locales';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   ArcElement,
//   Tooltip,
//   Legend,
//   ChartDataLabels
// );

// // فقط یک نقشه ثابت: نام فارسی → ID (چون دیتابیس فارسی است)
// const violationNameToId: Record<string, string> = {
//   'عبور از چراغ قرمز': 'red-light',
//   'تجاوز به خط عابر پیاده': 'crosswalk',
//   'سرعت غیرمجاز': 'speed',
//   'تغییر خط ممنوع': 'lane-change',
//   'پارک در محل ممنوع': 'illegal-parking',
// };

// // نقشه دو زبانه فقط برای نمایش نام در نمودارها
// const getViolationDisplayName = (id: string, language: Language): string => {
//   const names = {
//     'red-light': language === 'fa' ? 'عبور از چراغ قرمز' : 'Red Light Violation',
//     'crosswalk': language === 'fa' ? 'تجاوز به خط عابر پیاده' : 'Crosswalk Violation',
//     'speed': language === 'fa' ? 'سرعت غیرمجاز' : 'Speeding',
//     'lane-change': language === 'fa' ? 'تغییر خط ممنوع' : 'Illegal Lane Change',
//     'illegal-parking': language === 'fa' ? 'پارک در محل ممنوع' : 'Illegal Parking',
//   };
//   return names[id as keyof typeof names] || id;
// };

// // لیست ثابت IDها (ترتیب مهم است برای نمایش ثابت در نمودار)
// const violationTypeIds = ['red-light', 'crosswalk', 'speed', 'lane-change', 'illegal-parking'] as const;

// interface IntersectionDashboardProps {
//   intersection: Intersection;
//   onChangeTab?: (tab: string) => void;
//   language: Language;
// }

// export function IntersectionDashboard({
//   intersection,
//   onChangeTab,
//   language,
// }: IntersectionDashboardProps) {
//   const t = translations[language];

//   const [liveMonitoring, setLiveMonitoring] = useState(true);
//   const [ptzTracking] = useState(true);

//   // فیلتر تخلفات این چهارراه
//   const violations = mockViolations.filter(v => v.intersectionId === intersection.id);

//   // تبدیل نام فارسی به ID
//   const violationsWithId = violations.map(v => ({
//     ...v,
//     violationTypeId: violationNameToId[v.violationType] || 'unknown',
//   }));

//   // محاسبه آمار بر اساس ID ثابت
//   const stats = {
//     total: violations.length,
//     byStatus: {
//       verified: violations.filter(v => v.status === 'verified').length,
//       pending: violations.filter(v => v.status === 'pending').length,
//       rejected: violations.filter(v => v.status === 'rejected').length,
//     },
//     byType: violationTypeIds.reduce((acc, id) => {
//       acc[id] = violationsWithId.filter(v => v.violationTypeId === id).length;
//       return acc;
//     }, {} as Record<string, number>),
//   };

//   // شبیه‌سازی تشخیص تخلف جدید
//   useEffect(() => {
//     if (!liveMonitoring) return;

//     const interval = setInterval(() => {
//       if (Math.random() > 0.85) {
//         toast.warning(t.newViolationDetected, { duration: 5000 });
//       }
//     }, 18000);

//     return () => clearInterval(interval);
//   }, [liveMonitoring, t.newViolationDetected]);

//   // بج وضعیت
//   const getStatusBadge = (status: string) => {
//     const texts = {
//       verified: language === 'fa' ? 'تایید شده' : 'Verified',
//       pending: language === 'fa' ? 'در انتظار' : 'Pending',
//       rejected: language === 'fa' ? 'رد شده' : 'Rejected',
//     };

//     switch (status) {
//       case 'verified':
//         return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs">{texts.verified}</Badge>;
//       case 'pending':
//         return <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs">{texts.pending}</Badge>;
//       case 'rejected':
//         return <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs">{texts.rejected}</Badge>;
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-[calc(100vh-140px)] bg-slate-100 dark:bg-slate-900 p-4">
//       <div className="max-w-[1800px] mx-auto">
//         {/* هدر */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
//               {intersection.name}
//             </h2>
//             <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
//               {t.liveMonitoringAndStats}
//             </p>
//           </div>

//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2">
//               <div
//                 className={`w-2.5 h-2.5 rounded-full ${
//                   liveMonitoring ? 'bg-green-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'
//                 }`}
//               />
//               <span className="text-sm text-slate-700 dark:text-slate-300">
//                 {liveMonitoring ? t.active : t.inactive}
//               </span>
//             </div>
//             <Button
//               size="sm"
//               variant={liveMonitoring ? 'destructive' : 'default'}
//               className="gap-2"
//               onClick={() => {
//                 setLiveMonitoring(!liveMonitoring);
//                 toast.info(liveMonitoring ? t.monitoringStopped : t.monitoringStarted);
//               }}
//             >
//               {liveMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
//               {liveMonitoring ? t.stopMonitoring : t.startMonitoring}
//             </Button>
//           </div>
//         </div>

//         {/* کارت‌های آمار */}
//         <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-8">
//           <Card className="p-5 bg-white dark:bg-slate-800 shadow-lg hover:shadow-lg transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">
//                   {t.totalViolationsToday}
//                 </p>
//                 <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.total}</p>
//               </div>
//               <FileText className="w-9 h-9 text-slate-600 dark:text-slate-400" />
//             </div>
//           </Card>

//           <Card className="p-5 bg-white dark:bg-slate-800 shadow-lg hover:shadow-lg transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wider">
//                   {t.verifiedViolations}
//                 </p>
//                 <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
//                   {stats.byStatus.verified}
//                 </p>
//               </div>
//               <CheckCircle className="w-9 h-9 text-green-600 dark:text-green-400" />
//             </div>
//           </Card>

//           <Card className="p-5 bg-white dark:bg-slate-800 shadow-lg hover:shadow-lg transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider">
//                   {t.pendingViolations}
//                 </p>
//                 <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1">
//                   {stats.byStatus.pending}
//                 </p>
//               </div>
//               <Clock className="w-9 h-9 text-amber-600 dark:text-amber-400" />
//             </div>
//           </Card>

//           <Card className="p-5 bg-white dark:bg-slate-800 shadow-lg hover:shadow-lg transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wider">
//                   {t.rejectedViolations}
//                 </p>
//                 <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
//                   {stats.byStatus.rejected}
//                 </p>
//               </div>
//               <XCircle className="w-9 h-9 text-red-600 dark:text-red-400" />
//             </div>
//           </Card>

//           <Card className="p-5 bg-white dark:bg-slate-800 shadow-lg hover:shadow-lg transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wider">
//                   {t.ptzCameraStatus}
//                 </p>
//                 <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
//                   {ptzTracking ? t.active : t.inactive}
//                 </p>
//               </div>
//               <Video className="w-9 h-9 text-purple-600 dark:text-purple-400" />
//             </div>
//           </Card>
//         </div>

//         {/* نمودارها */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* نمودار میله‌ای */}
//           <Card className="shadow-lg p-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg h-[65vh] flex flex-col">
//             <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 text-center">
//               {t.violationsByTypeTitle}
//             </h3>
//             <div className="flex-1 w-full flex items-center justify-center">
//               <div className="w-[85%] h-[75%]">
//                 {violationTypeIds.some(id => stats.byType[id] > 0) ? (
//                   <Bar
//                     data={{
//                       labels: violationTypeIds.map(id => getViolationDisplayName(id, language)),
//                       datasets: [
//                         {
//                           label: language === 'fa' ? 'تعداد تخلفات' : 'Violation Count',
//                           data: violationTypeIds.map(id => stats.byType[id]),
//                           backgroundColor: violationTypeIds.map(id => {
//                             const colors = {
//                               'red-light': '#ef444480',
//                               'crosswalk': '#f59e0b80',
//                               'speed': '#8b5cf680',
//                               'lane-change': '#ec489980',
//                               'illegal-parking': '#10b98180',
//                             };
//                             return colors[id];
//                           }),
//                           borderColor: violationTypeIds.map(id => {
//                             const colors = {
//                               'red-light': '#ef4444',
//                               'crosswalk': '#f59e0b',
//                               'speed': '#8b5cf6',
//                               'lane-change': '#ec4899',
//                               'illegal-parking': '#10b981',
//                             };
//                             return colors[id];
//                           }),
//                           barThickness: 50,
//                           borderWidth: 1,
//                           borderRadius: 5,
//                         },
//                       ],
//                     }}
//                     options={{
//                       responsive: true,
//                       maintainAspectRatio: false,
//                       plugins: { legend: { display: false } },
//                       scales: {
//                         x: { grid: { display: false } },
//                         y: { beginAtZero: true, ticks: { stepSize: 1 } },
//                       },
//                     }}
//                   />
//                 ) : (
//                   <div className="flex flex-col items-center justify-center h-full text-center">
//                     <AlertTriangle className="w-12 h-12 text-slate-400 mb-3" />
//                     <p className="text-slate-500 dark:text-slate-400">{t.noViolationsToDisplay}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </Card>

//           {/* نمودار دونات */}
//           <Card className="shadow-lg p-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg h-[65vh] flex flex-col">
//             <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 text-center">
//               {t.violationsPercentageTitle}
//             </h3>
//             <div className="flex-1 w-full flex items-center justify-center">
//               <div className="w-[85%] h-[75%]">
//                 {violationTypeIds.some(id => stats.byType[id] > 0) ? (
//                   <Pie
//                     data={{
//                       labels: violationTypeIds.map(id => getViolationDisplayName(id, language)),
//                       datasets: [
//                         {
//                           data: violationTypeIds.map(id => stats.byType[id]),
//                           backgroundColor: violationTypeIds.map(id => {
//                             const colors = {
//                               'red-light': '#ef4444B0',
//                               'crosswalk': '#f59e0bB0',
//                               'speed': '#8b5cf6B0',
//                               'lane-change': '#ec4899B0',
//                               'illegal-parking': '#10b981B0',
//                             };
//                             return colors[id];
//                           }),
//                           borderWidth: 0,
//                           cutout: '40%',
//                         },
//                       ],
//                     }}
//                     options={{
//                       responsive: true,
//                       maintainAspectRatio: false,
//                       plugins: {
//                         legend: {
//                           position: language === 'fa' ? 'left' : 'right' as const,
//                         },
//                         tooltip: {
//                           callbacks: {
//                             label: (context) => {
//                               const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
//                               const value = context.raw as number;
//                               const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
//                               return `${context.label}: ${percent}% (${value})`;
//                             },
//                           },
//                         },
//                         datalabels: {
//                           color: '#fff',
//                           font: { weight: 'bold' },
//                           formatter: (value: number) => {
//                             const total = violationTypeIds.reduce((sum, id) => sum + stats.byType[id], 0);
//                             return total > 0 ? Math.round((value / total) * 100) + '%' : '';
//                           },
//                         },
//                       },
//                     }}
//                   />
//                 ) : (
//                   <div className="flex flex-col items-center justify-center h-full text-center">
//                     <AlertTriangle className="w-12 h-12 text-slate-400 mb-3" />
//                     <p className="text-slate-500 dark:text-slate-400">{t.noViolationsToDisplay}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }


// src/components/IntersectionDashboard.tsx

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Video,
  AlertTriangle,
  Play,
  Pause,
} from 'lucide-react';
import { Intersection } from '../types';
import { mockViolations } from '../data/mockDatabase';
import { toast } from 'sonner';

import { translations, type Language } from '../locales';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import 'highcharts/highcharts-3d';

const chartColors = ['#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981'];
// فقط یک نقشه ثابت: نام فارسی → ID (چون دیتابیس فارسی است)
const violationNameToId: Record<string, string> = {
  'عبور از چراغ قرمز': 'red-light',
  'تجاوز به خط عابر پیاده': 'crosswalk',
  'سرعت غیرمجاز': 'speed',
  'تغییر خط ممنوع': 'lane-change',
  'پارک در محل ممنوع': 'illegal-parking',
};

// نقشه دو زبانه فقط برای نمایش نام در نمودارها
const getViolationDisplayName = (id: string, language: Language): string => {
  const names = {
    'red-light': language === 'fa' ? 'عبور از چراغ قرمز' : 'Red Light Violation',
    'crosswalk': language === 'fa' ? 'تجاوز به خط عابر پیاده' : 'Crosswalk Violation',
    'speed': language === 'fa' ? 'سرعت غیرمجاز' : 'Speeding',
    'lane-change': language === 'fa' ? 'تغییر خط ممنوع' : 'Illegal Lane Change',
    'illegal-parking': language === 'fa' ? 'پارک در محل ممنوع' : 'Illegal Parking',
  };
  return names[id as keyof typeof names] || id;
};

// لیست ثابت IDها (ترتیب مهم است برای نمایش ثابت در نمودار)
const violationTypeIds = ['red-light', 'crosswalk', 'speed', 'lane-change', 'illegal-parking'] as const;

interface IntersectionDashboardProps {
  intersection: Intersection;
  onChangeTab?: (tab: string) => void;
  language: Language;
}

export function IntersectionDashboard({
  intersection,
  onChangeTab,
  language,
}: IntersectionDashboardProps) {
  const t = translations[language];

  const [liveMonitoring, setLiveMonitoring] = useState(true);
  const [ptzTracking] = useState(true);

  // فیلتر تخلفات این چهارراه
  const violations = mockViolations.filter(v => v.intersectionId === intersection.id);

  // تبدیل نام فارسی به ID
  const violationsWithId = violations.map(v => ({
    ...v,
    violationTypeId: violationNameToId[v.violationType] || 'unknown',
  }));

  // محاسبه آمار بر اساس ID ثابت
  const stats = {
    total: violations.length,
    byStatus: {
      verified: violations.filter(v => v.status === 'verified').length,
      pending: violations.filter(v => v.status === 'pending').length,
      rejected: violations.filter(v => v.status === 'rejected').length,
    },
    byType: violationTypeIds.reduce((acc, id) => {
      acc[id] = violationsWithId.filter(v => v.violationTypeId === id).length;
      return acc;
    }, {} as Record<string, number>),
  };

  // شبیه‌سازی تشخیص تخلف جدید
  useEffect(() => {
    if (!liveMonitoring) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        toast.warning(t.newViolationDetected, { duration: 5000 });
      }
    }, 18000);

    return () => clearInterval(interval);
  }, [liveMonitoring, t.newViolationDetected]);

  // بج وضعیت
  const getStatusBadge = (status: string) => {
    const texts = {
      verified: language === 'fa' ? 'تایید شده' : 'Verified',
      pending: language === 'fa' ? 'در انتظار' : 'Pending',
      rejected: language === 'fa' ? 'رد شده' : 'Rejected',
    };

    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs">{texts.verified}</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs">{texts.pending}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs">{texts.rejected}</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-100 dark:bg-slate-900 p-4">
      <div className="max-w-[1800px] mx-auto">
        {/* هدر */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              {intersection.name}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {t.liveMonitoringAndStats}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  liveMonitoring ? 'bg-green-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-600'
                }`}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {liveMonitoring ? t.active : t.inactive}
              </span>
            </div>
            <Button
              size="sm"
              variant={liveMonitoring ? 'destructive' : 'default'}
              className="gap-2"
              onClick={() => {
                setLiveMonitoring(!liveMonitoring);
                toast.info(liveMonitoring ? t.monitoringStopped : t.monitoringStarted);
              }}
            >
              {liveMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {liveMonitoring ? t.stopMonitoring : t.startMonitoring}
            </Button>
          </div>
        </div>

        {/* کارت‌های آمار */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-8">
          <Card className="p-5 bg-white dark:bg-slate-800 shadow-lg hover:shadow-lg transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {t.totalViolationsToday}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.total}</p>
              </div>
              <FileText className="w-9 h-9 text-slate-600 dark:text-slate-400" />
            </div>
          </Card>

          <Card className="p-5 bg-white dark:bg-slate-800 shadow-lg hover:shadow-lg transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wider">
                  {t.verifiedViolations}
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                  {stats.byStatus.verified}
                </p>
              </div>
              <CheckCircle className="w-9 h-9 text-green-600 dark:text-green-400" />
            </div>
          </Card>

          <Card className="p-5 bg-white dark:bg-slate-800 shadow-lg hover:shadow-lg transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  {t.pendingViolations}
                </p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                  {stats.byStatus.pending}
                </p>
              </div>
              <Clock className="w-9 h-9 text-amber-600 dark:text-amber-400" />
            </div>
          </Card>

          <Card className="p-5 bg-white dark:bg-slate-800 shadow-lg hover:shadow-lg transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wider">
                  {t.rejectedViolations}
                </p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                  {stats.byStatus.rejected}
                </p>
              </div>
              <XCircle className="w-9 h-9 text-red-600 dark:text-red-400" />
            </div>
          </Card>

          <Card className="p-5 bg-white dark:bg-slate-800 shadow-lg hover:shadow-lg transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  {t.ptzCameraStatus}
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {ptzTracking ? t.active : t.inactive}
                </p>
              </div>
              <Video className="w-9 h-9 text-purple-600 dark:text-purple-400" />
            </div>
          </Card>
        </div>

  {/* نمودارها */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* نمودار میله‌ای سه‌بعدی - کاملاً وسط کارت */}
  <Card className="shadow-lg p-8 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg h-[65vh] flex flex-col">
  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-6 text-center">
    {t.violationsByTypeTitle}
  </h3>
    
    <div className="flex-1 flex items-center justify-center">
      <div className="w-[100%] h-[100%] "> {/* اندازه مناسب + وسط چین */}
        {stats.total > 0 ? (
       <HighchartsReact
  highcharts={Highcharts}
  containerProps={{ style: { height: '100%', width: '100%' } }}
  options={{
    chart: {
      type: 'column',
      options3d: {
        enabled: true,
        alpha: 0.5,
        beta: 0.5,
        depth: 0,
        viewDistance: 100,
        frame: {
          bottom: { size: 1, color: 'rgba(0,0,0,0.02)' },
          back: { size: 1, color: 'rgba(0,0,0,0.04)' },
          side: { size: 1, color: 'rgba(0,0,0,0.06)' }
        }
      },
      backgroundColor: 'transparent'
    },
    title: { text: null },
    credits: { enabled: false },
    legend: { enabled: false },
    plotOptions: {
      column: {
        depth: 1000,
        grouping: false
      }
    },
    xAxis: {
      categories: violationTypeIds.map(id => getViolationDisplayName(id, language)),
      lineColor: language === 'fa' ? (document.documentElement.classList.contains('dark') ? '#475569' : '#cbd5e1') : (document.documentElement.classList.contains('dark') ? '#475569' : '#94a3b8'),
      gridLineColor: document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0',
      labels: {
        skew3d: true,
        style: {
          fontSize: '12px',
          color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#334155'
        }
      }
    },
    yAxis: {
      title: { text: null },
      min: 0,
      tickInterval: 1,
      lineColor: document.documentElement.classList.contains('dark') ? '#475569' : '#94a3b8',
      gridLineColor: document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0',
      labels: {
        style: {
          color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#334155'
        }
      }
    },
    tooltip: {
      backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
      style: {
        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
        fontSize: '12px'
      },
      formatter: function (this: any) {
        return `<br>${this.key}<br/><br></br> تعداد تخلف: <b>${this.y}</b>`;
      }
    },
    series: [{
      data: violationTypeIds.map((id, index) => ({
        y: stats.byType[id],
        color: chartColors[index],
        name: getViolationDisplayName(id, language)
      })),
    }]
  }}
/>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <AlertTriangle className="w-16 h-16 text-slate-400 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg">{t.noViolationsToDisplay}</p>
          </div>
        )}
      </div>
    </div>
  </Card>

  {/* نمودار دایره‌ای سه‌بعدی - کاملاً وسط کارت */}
  <Card className="shadow-lg p-8 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg h-[65vh] flex flex-col">
    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-6 text-center">
      {t.violationsPercentageTitle}
    </h3>
    
    <div className="flex-1 flex items-center justify-center">
      <div className="w-[100%] h-[100%] "> {/* کمی کوچکتر برای زیبایی pie */}
        {stats.total > 0 ? (
          <HighchartsReact
            highcharts={Highcharts}
            containerProps={{ style: { height: '100%', width: '100%' } }}
            options={{
              chart: {
                type: 'pie',
                options3d: {
                  enabled: true,
                  alpha: 45,
                  beta: 0
                },
                backgroundColor: 'transparent'
              },
              title: { text: null },
              credits: { enabled: false },
              tooltip: {
                pointFormat: '<b>{point.percentage:.1f}%</b> ({point.y})'
              },
              plotOptions: {
                pie: {
                  allowPointSelect: true,
                  cursor: 'pointer',
                  depth: 45,
                  innerSize: '40%',
                  dataLabels: {
                    enabled: true,
                    format: '{point.percentage:.1f}%',
                    distance: 40,
                    style: {
                      fontWeight: 'bold',
                      color: 'white',
                      textOutline: '2px black',
                      fontSize: '13px'
                    }
                  }
                }
              },
              series: [{
                name: 'تخلفات',
                colorByPoint: true,
                colors: chartColors,
                data: violationTypeIds.map((id, index) => ({
                  name: getViolationDisplayName(id, language),
                  y: stats.byType[id]
                })).filter(item => item.y > 0) // حذف موارد صفر برای زیبایی
              }]
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <AlertTriangle className="w-16 h-16 text-slate-400 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg">{t.noViolationsToDisplay}</p>
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

