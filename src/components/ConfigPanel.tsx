// src/components/ConfigPanel.tsx

import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { translations, type Language } from '../locales';

interface ConfigPanelProps {
  language: Language;
}

export function ConfigPanel({ language }: ConfigPanelProps) {
  const t = translations[language] || {};
  const isRTL = language === 'fa';

  const tabs = [
    { id: 'object-detector', label: t.objectDetector || 'Object Detector' },
    { id: 'cameras', label: t.cameras || 'Cameras' },
    { id: 'main', label: t.mainConfig || 'Main' },
    { id: 'ocr', label: t.ocr || 'OCR' },
    { id: 'vehicle', label: t.vehicle || 'Vehicle' },
    { id: 'imaging', label: t.imaging || 'Imaging' },
    { id: 'saving', label: t.saving || 'Saving' },
  ];

  const [activeTab, setActiveTab] = React.useState('object-detector');

  const renderContent = () => {
    switch (activeTab) {
      case 'object-detector':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">{t.objectDetector || 'تشخیص پلاک خودرو'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h4 className="font-medium mb-3">دقت تشخیص (Confidence Threshold)</h4>
                <div className="flex items-center gap-4">
                  <input type="range" min="0" max="100" defaultValue="75" className="flex-1" />
                  <Badge variant="secondary">75%</Badge>
                </div>
              </Card>
              <Card className="p-6">
                <h4 className="font-medium mb-3">حداکثر تعداد تشخیص در فریم</h4>
                <div className="text-3xl font-bold text-blue-600">10</div>
              </Card>
            </div>
          </div>
        );

      case 'cameras':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">{t.cameras || 'دوربین‌ها'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <h4 className="font-medium mb-2">میانگین FPS</h4>
                <div className="text-3xl font-bold text-green-600">28</div>
              </Card>
              <Card className="p-6 text-center">
                <h4 className="font-medium mb-2">رزولوشن متوسط</h4>
                <div className="text-2xl font-bold">1920x1080</div>
              </Card>
              <Card className="p-6 text-center">
                <h4 className="font-medium mb-2">تعداد دوربین فعال</h4>
                <div className="text-3xl font-bold text-blue-600">12</div>
              </Card>
            </div>
          </div>
        );

      case 'main':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">{t.mainConfig || 'تنظیمات اصلی'}</h3>
            <Card className="p-6 space-y-4">
              <div>
                <h4 className="font-medium mb-2">فاصله ثبت لاگ (ثانیه)</h4>
                <select className="w-full p-2 border rounded-lg dark:bg-slate-700">
                  <option>30 ثانیه</option>
                  <option selected>60 ثانیه</option>
                  <option>120 ثانیه</option>
                </select>
              </div>
              <div>
                <h4 className="font-medium mb-2">حالت خودکار ثبت تخلف</h4>
                <Badge variant="default" className="bg-green-600">فعال</Badge>
              </div>
            </Card>
          </div>
        );

      case 'ocr':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">{t.ocr || 'تشخیص متن (OCR)'}</h3>
            <Card className="p-6">
              <h4 className="font-medium mb-4">دقت OCR فعلی</h4>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-8">
                <div className="bg-blue-600 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{width: '88%'}}>
                  88%
                </div>
              </div>
            </Card>
          </div>
        );

      case 'vehicle':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">{t.vehicle || 'تنظیمات خودرو'}</h3>
            <Card className="p-6">
              <p className="text-slate-600 dark:text-slate-400">تنظیمات مربوط به تشخیص نوع خودرو، رنگ، مدل و غیره در آینده اضافه خواهد شد.</p>
            </Card>
          </div>
        );

      case 'imaging':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">{t.imaging || 'تصویربرداری'}</h3>
            <Card className="p-6">
              <p className="text-slate-600 dark:text-slate-400">تنظیمات کیفیت تصویر، فشرده‌سازی و فرمت ذخیره‌سازی.</p>
            </Card>
          </div>
        );

      case 'saving':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">{t.saving || 'ذخیره‌سازی'}</h3>
            <Card className="p-6">
              <p className="text-slate-600 dark:text-slate-400">تنظیمات مسیر ذخیره، مدت نگهداری فایل‌ها و پشتیبان‌گیری.</p>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {t.configTitle || 'تنظیمات سیستم'}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t.configDesc || 'مدیریت تنظیمات کلی سیستم نظارت ترافیکی'}
        </p>
      </div>

      {/* تب‌ها */}
      <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
        <div className="flex flex-wrap gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* محتوای تب انتخاب‌شده */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}