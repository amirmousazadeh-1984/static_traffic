// src/App.tsx

import React, { useState, useEffect } from 'react';
import { IntersectionList } from './components/IntersectionList';
import { ZoneCalibration } from './components/ZoneCalibration';
import { PTZCalibration } from './components/PTZCalibration';
import { IntersectionDashboard } from './components/IntersectionDashboard';
import { ViolationTypesManager } from './components/ViolationTypesManager';
import { ManualViolationCapture } from './components/ManualViolationCapture';
import { Login } from './components/Login';
import { ChangeCredentialsModal } from './components/ChangeCredentialsModal';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';
import { Intersection } from './types';
import { AlertTriangle, Camera, MapPin, Monitor, Moon, Sun, Globe, LogOut, Key, Settings } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { translations, type Language } from './locales';
import { ConfigPanel } from './components/ConfigPanel';

function App() {
  const [activeTab, setActiveTab] = useState('intersections');
  const [selectedIntersection, setSelectedIntersection] = useState<Intersection | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState<Language>('fa');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // همیشه false در شروع
  const [showChangeCredentials, setShowChangeCredentials] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const t = translations[language] || {};

  // فقط تم و زبان از localStorage بارگذاری بشن — لاگین نه!
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedLang = localStorage.getItem('language') as Language | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // تم
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }

    // زبان
    if (savedLang && (savedLang === 'fa' || savedLang === 'en')) {
      setLanguage(savedLang);
    }
  }, []);

  // اعمال جهت و فونت بر اساس زبان
  useEffect(() => {
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('language', language);

    if (language === 'fa') {
      document.documentElement.classList.add('font-vazirmatn');
    } else {
      document.documentElement.classList.remove('font-vazirmatn');
    }
  }, [language]);

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

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'fa' ? 'en' : 'fa'));
  };

  const handleSelectIntersection = (intersection: Intersection) => {
    setSelectedIntersection(intersection);
    setActiveTab('dashboard');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    // لاگین در localStorage ذخیره نمی‌شه → هر بار باید وارد بشه
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setIsLoggedIn(false);
    setActiveTab('intersections');
    setSelectedIntersection(null);
    setShowLogoutConfirm(false);
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const isIntersectionSelected = selectedIntersection !== null;

  const menuItems = [
    {
      id: 'intersections',
      label: t.dashboard || 'لیست چهارراه‌ها',
      icon: <MapPin className="w-4 h-4" />,
      disabled: false,
    },
    {
      id: 'dashboard',
      label: t.violationDashboard || 'داشبورد تخلفات',
      icon: <Monitor className="w-4 h-4" />,
      disabled: !isIntersectionSelected,
    },
    {
      id: 'ptz-calibration',
      label: t.ptzCalibration || 'کالیبراسیون PTZ',
      icon: <Camera className="w-4 h-4" />,
      disabled: !isIntersectionSelected,
    },
    {
      id: 'zone-calibration',
      label: t.zoneCalibration || 'کالیبراسیون مناطق',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
          />
        </svg>
      ),
      disabled: !isIntersectionSelected,
    },
    {
      id: 'violations',
      label: t.violationTypes || 'مدیریت انواع تخلف',
      icon: <AlertTriangle className="w-4 h-4" />,
      disabled: false,
    },
    {
      id: 'manual-violation',
      label: t.manualViolationCapture || 'ثبت دستی تخلف',
      icon: <Camera className="w-5 h-5" />,
      disabled: !isIntersectionSelected,
    },
    {
  id: 'config',
  label: t.config || (language === 'fa' ? 'تنظیمات' : 'Config'),
  icon: <Settings className="w-4 h-4" />,
  disabled: false,
},
  ];

  // همیشه اول صفحه لاگین نشان داده می‌شود
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} language={language} />;
  }

  // بعد از لاگین → برنامه اصلی
  return (
    <div
      className={`min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300 flex ${
        language === 'fa' ? 'font-vazirmatn' : 'font-sans'
      }`}
    >
      {/* منوی عمودی */}
      <div className="w-full max-w-[280px] shadow-lg flex-shrink-0 bg-slate-200 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col">
        {/* هدر منو */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-500 dark:bg-slate-600 rounded-md flex items-center justify-center shadow-sm">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                {t.appTitle || 'سیستم نظارت ترافیکی'}
              </h1>
            </div>

            <div className="flex gap-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleLanguage}
                className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Globe className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
            </div>
          </div>

          {selectedIntersection && (
            <div className="mt-4 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg shadow-lg">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300 truncate">
                {selectedIntersection.name}
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          <div className="space-y-2 px-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.disabled && setActiveTab(item.id)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  language === 'fa' ? 'text-right' : 'text-left'
                } ${
                  activeTab === item.id
                    ? 'bg-slate-300 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium shadow-lg'
                    : item.disabled
                    ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-slate-600 dark:text-slate-400">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}

            {/* تغییر رمز عبور */}
            <button
              onClick={() => setShowChangeCredentials(true)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 ${
                language === 'fa' ? 'text-right' : 'text-left'
              }`}
            >
              <Key className="w-4 h-4" />
              <span className="text-sm">
                {t.changeCredentials || (language === 'fa' ? 'تغییر رمز عبور' : 'Change Credentials')}
              </span>
            </button>

            {/* خروج از حساب */}
            <button
              onClick={handleLogoutClick}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mt-8 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 ${
                language === 'fa' ? 'text-right' : 'text-left'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">
                {t.logout || (language === 'fa' ? 'خروج از حساب' : 'Logout')}
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* محتوای اصلی */}
      <div className="flex-1 overflow-auto">
        <main className="h-full p-4 md:p-6">
          {activeTab === 'intersections' && (
            <IntersectionList onSelectIntersection={handleSelectIntersection} language={language} />
          )}
          {activeTab === 'dashboard' && selectedIntersection && (
            <IntersectionDashboard intersection={selectedIntersection} language={language} />
          )}
          {activeTab === 'ptz-calibration' && selectedIntersection && (
            <PTZCalibration intersection={selectedIntersection} language={language} />
          )}
          {activeTab === 'zone-calibration' && selectedIntersection && (
            <ZoneCalibration intersection={selectedIntersection} language={language} />
          )}
          {activeTab === 'violations' && <ViolationTypesManager language={language} />}
          {activeTab === 'manual-violation' && selectedIntersection && (
            <ManualViolationCapture intersection={selectedIntersection} language={language} />
          )}
          {activeTab === 'config' && <ConfigPanel language={language} />}
        </main>
      </div>

      {/* مدال تغییر رمز عبور */}
      <ChangeCredentialsModal
        isOpen={showChangeCredentials}
        onClose={() => setShowChangeCredentials(false)}
        language={language}
      />

      {/* مدال تأیید خروج */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        language={language}
      />

      <Toaster position="top-center" richColors dir={language === 'fa' ? 'rtl' : 'ltr'} />
    </div>
  );
}

export default App;