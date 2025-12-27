// src/App.tsx

import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { IntersectionList } from './components/IntersectionList';
import { ZoneCalibration } from './components/ZoneCalibration';
import { PTZCalibration } from './components/PTZCalibration';
import { IntersectionDashboard } from './components/IntersectionDashboard';
import { Intersection } from './types';
import { AlertTriangle, Camera, MapPin, Monitor, Moon, Sun } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { ViolationTypesManager } from './components/ViolationTypesManager';

function App() {
  const [activeTab, setActiveTab] = useState('intersections');
  const [selectedIntersection, setSelectedIntersection] = useState<Intersection | null>(null);
  const [isDark, setIsDark] = useState(false);

  // تشخیص تم سیستم و ذخیره در localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleSelectIntersection = (intersection: Intersection) => {
    setSelectedIntersection(intersection);
    setActiveTab('dashboard');
  };

  const isIntersectionSelected = selectedIntersection !== null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300" dir="rtl">
      {/* هدر مینیمال با دکمه تم */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-md">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* لوگو، عنوان و دکمه تم */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">نظارت ترافیکی</h1>
              </div>

              {/* دکمه تغییر تم */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="تغییر تم"
              >
                <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>

            {/* چهارراه انتخاب‌شده */}
            {selectedIntersection && (
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  {selectedIntersection.name}
                </span>
              </div>
            )}
          </div>

          {/* تب‌ها */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full -mb-px">
            <TabsList className="w-full justify-start bg-transparent h-12 p-0 gap-8 border-b border-slate-200 dark:border-slate-700">
              <TabsTrigger
                value="intersections"
                className="relative px-1 pb-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 transition-colors"
              >
                <MapPin className="w-4 h-4 ml-2" />
                داشبورد
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-200" />
              </TabsTrigger>

              <TabsTrigger
                value="dashboard"
                disabled={!isIntersectionSelected}
                className="relative px-1 pb-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 transition-colors disabled:opacity-40"
              >
                <Monitor className="w-4 h-4 ml-2" />
                مشخصات دوربین‌های چهارراه
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-200" />
              </TabsTrigger>
               <TabsTrigger
                value="ptz-calibration"
                disabled={!isIntersectionSelected}
                className="relative px-1 pb-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 transition-colors disabled:opacity-40"
              >
                <Camera className="w-4 h-4 ml-2" />
                کالیبراسیون دوربین چرخان
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-200" />
              </TabsTrigger>

              <TabsTrigger
                value="zone-calibration"
                disabled={!isIntersectionSelected}
                className="relative px-1 pb-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 transition-colors disabled:opacity-40"
              >
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
                کالیبراسیون مناطق
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-200" />
              </TabsTrigger>
              <TabsTrigger
  value="violations"
  className="relative px-1 pb-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-400 transition-colors"
>
  <AlertTriangle className="w-4 h-4 ml-2" />
  تخلفات
  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 scale-x-0 data-[state=active]:scale-x-100 transition-transform duration-200" />
</TabsTrigger>

             
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* محتوای اصلی */}
      <main className="pt-6">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="intersections" className="mt-0">
            <IntersectionList onSelectIntersection={handleSelectIntersection} />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-0">
            {selectedIntersection && <IntersectionDashboard intersection={selectedIntersection} />}
          </TabsContent>

     <TabsContent value="zone-calibration" className="mt-0">
  {selectedIntersection && (
    <ZoneCalibration
      intersection={selectedIntersection}
      onChangeTab={setActiveTab}
    />
  )}
</TabsContent>

          <TabsContent value="ptz-calibration" className="mt-0">
            {selectedIntersection && <PTZCalibration intersection={selectedIntersection} />}
          </TabsContent>

<TabsContent value="violations" className="mt-0">
  <div className="max-w-[1200px] mx-auto px-6 py-8">
    <ViolationTypesManager />
  </div>
</TabsContent>
        </Tabs>
      </main>

      <Toaster position="top-center" richColors dir="rtl" />
    </div>
  );
}

export default App;