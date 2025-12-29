// src/App.tsx

import React, { useState, useEffect } from 'react';
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

  // تم
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

  // منوی عمودی
  const menuItems = [
    {
      id: 'intersections',
      label: 'داشبورد',
      icon: <MapPin className="w-4 h-4" />,
      disabled: false,
    },
    {
      id: 'dashboard',
      label: 'داشبورد تخلفات چهارراهها',
      icon: <Monitor className="w-4 h-4" />,
      disabled: !isIntersectionSelected,
    },
    {
      id: 'ptz-calibration',
      label: 'کالیبراسیون دوربین چرخان',
      icon: <Camera className="w-4 h-4" />,
      disabled: !isIntersectionSelected,
    },
    {
      id: 'zone-calibration',
      label: 'کالیبراسیون مناطق',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
        </svg>
      ),
      disabled: !isIntersectionSelected,
    },
    {
      id: 'violations',
      label: 'مدیریت تخلفات',
      icon: <AlertTriangle className="w-4 h-4" />,
      disabled: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-slate-900 transition-colors duration-300 flex" dir="rtl">
      {/* ========== منوی عمودی (سمت راست) ========== */}
      <div className="w-full shadow-lgg max-w-[280px] flex-shrink-0 bg-slate-100 dark:bg-slate-800  dark:border-slate-700 flex flex-col">
        {/* هدر منو */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                نظارت ترافیکی
              </h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              aria-label="تغییر تم"
            >
              <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>

          {/* چهارراه انتخاب‌شده */}
          {selectedIntersection && (
            <div className="mt-4 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300 truncate">
                {selectedIntersection.name}
              </span>
            </div>
          )}
        </div>

        {/* آیتم‌های منو */}
        <nav className="flex-1 overflow-y-auto py-3">
          <div className="space-y-1 px-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.disabled && setActiveTab(item.id)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-right rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium'
                    : item.disabled
                    ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-slate-600 dark:text-slate-400">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* ========== محتوای اصلی (سمت چپ) ========== */}
      <div className="flex-1 overflow-auto">
        <main className="h-full p-4 md:p-6">
          {activeTab === 'intersections' && (
            <IntersectionList onSelectIntersection={handleSelectIntersection} />
          )}

          {activeTab === 'dashboard' && selectedIntersection && (
            <IntersectionDashboard
              intersection={selectedIntersection}
              onChangeTab={setActiveTab}
            />
          )}

          {activeTab === 'ptz-calibration' && selectedIntersection && (
            <PTZCalibration intersection={selectedIntersection} />
          )}

          {activeTab === 'zone-calibration' && selectedIntersection && (
            <ZoneCalibration
              intersection={selectedIntersection}
              onChangeTab={setActiveTab}
            />
          )}

          {activeTab === 'violations' && (
            <div >
              <ViolationTypesManager />
            </div>
          )}
        </main>
      </div>

      <Toaster position="top-center" richColors dir="rtl" />
    </div>
  );
}

export default App;