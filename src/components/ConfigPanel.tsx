// src/components/ConfigPanel.tsx

import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Label } from './ui/label';
import { translations, type Language } from '../locales';

interface ConfigPanelProps {
  language: Language;
}

export function ConfigPanel({ language }: ConfigPanelProps) {
  const t = translations[language] || {};
  const isRTL = language === 'fa';

  const tabs = [
    { id: 'object-detector', label: t.objectDetector || (language === 'fa' ? 'تشخیص اشیاء' : 'Object Detector') },
    { id: 'cameras', label: t.cameras || (language === 'fa' ? 'دوربین‌ها' : 'Cameras') },
    { id: 'main', label: t.mainConfig || (language === 'fa' ? 'تنظیمات اصلی' : 'Main') },
    { id: 'ocr', label: t.ocr || 'OCR' },
    { id: 'vehicle', label: t.vehicle || (language === 'fa' ? 'خودرو' : 'Vehicle') },
    { id: 'imaging', label: t.imaging || (language === 'fa' ? 'تصویربرداری' : 'Imaging') },
    { id: 'saving', label: t.saving || (language === 'fa' ? 'ذخیره‌سازی' : 'Saving') },
  ];

  const [activeTab, setActiveTab] = React.useState('object-detector');

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}   className="min-h-[calc(100vh-140px)] bg-slate-100 dark:bg-slate-900 p-4">
      <div className="max-w-[1800px] mx-auto">
          <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {t.configTitle || (language === 'fa' ? 'تنظیمات سیستم' : 'System Settings')}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {t.configDesc || (language === 'fa' ? 'مدیریت تنظیمات کلی سیستم نظارت ترافیکی' : 'Manage global settings of the traffic monitoring system')}
        </p>
      </div>
        <div style={{ height: '80vh' }}>

          <Card className="p-6 border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800">
        {/* تب‌ها */}
        <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium text-sm transition-all border-b-2  -mb-px ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 bg-slate-50 dark:bg-slate-900/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* محتوای تب */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'object-detector' && (
            <div className="space-y-8" style={{ height: '60vh' }}>
              <div>
                <h3 className="text-xl font-semibold mb-6">{t.objectDetector || 'تنظیمات تشخیص اشیاء و پلاک'}</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-6 shadow-md w-full border border-slate-200 dark:border-slate-700  bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col">
                    <Label className="text-base font-medium mb-4 block">دقت تشخیص پلاک (Confidence Threshold)</Label>
                    <div className="space-y-4">
                      <Slider defaultValue={[75]} max={100} step={1} className="w-full" />
                      <div className="flex justify-between text-sm">
                        <span>0%</span>
                        <Badge variant="secondary" className="text-lg px-4">75%</Badge>
                        <span>100%</span>
                      </div>
                    </div>
                  </Card>

            <Card className="p-6 shadow-md w-full border border-slate-200 dark:border-slate-700  bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col">
                    <Label className="text-base font-medium mb-4 block">حداکثر تعداد تشخیص در هر فریم</Label>
                    <div className="space-y-4">
                      <Slider defaultValue={[10]} max={20} step={1} className="w-full" />
                      <div className="text-center">
                        <span className="text-3xl font-bold text-blue-600">10</span>
                        <span className="text-slate-500 ml-2">خودرو</span>
                      </div>
                    </div>
                  </Card>
                </div>

            <Card className="p-6 shadow-md w-full border border-slate-200 dark:border-slate-700  bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">فعال‌سازی تشخیص پلاک در شب</Label>
                      <p className="text-sm text-slate-500 mt-1">بهبود تشخیص در شرایط نور کم</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'cameras' && (
            <div className="space-y-8" style={{ height: '60vh' }}>
              <h3 className="text-xl font-semibold mb-6">{t.cameras || 'وضعیت و مشخصات دوربین‌ها'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 shadow-md w-full border border-slate-200 dark:border-slate-700  bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col">
                  <div className="text-4xl font-bold text-green-600 mb-2">28</div>
                  <p className="text-slate-600 dark:text-slate-400">میانگین FPS</p>
                </Card>
            <Card className="p-6 shadow-md w-full border border-slate-200 dark:border-slate-700  bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col">
                  <div className="text-4xl font-bold text-blue-600 mb-2">12</div>
                  <p className="text-slate-600 dark:text-slate-400">دوربین فعال</p>
                </Card>
            <Card className="p-6 shadow-md w-full border border-slate-200 dark:border-slate-700  bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col">
                  <div className="text-3xl font-bold mb-2">Full HD</div>
                  <p className="text-slate-600 dark:text-slate-400">رزولوشن متوسط</p>
                </Card>
              </div>

            <Card className="p-6 shadow-md w-full border border-slate-200 dark:border-slate-700  bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col">
                <h4 className="font-medium mb-4">لیست دوربین‌های PTZ</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>نام دوربین</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead>FPS</TableHead>
                      <TableHead>رزولوشن</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>دوربین شمالی</TableCell>
                      <TableCell><Badge className="bg-green-600">فعال</Badge></TableCell>
                      <TableCell>30</TableCell>
                      <TableCell>1920x1080</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>دوربین شرقی</TableCell>
                      <TableCell><Badge className="bg-green-600">فعال</Badge></TableCell>
                      <TableCell>25</TableCell>
                      <TableCell>1920x1080</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {activeTab === 'main' && (
            <div className="space-y-8" style={{ height: '60vh' }}>
              <h3 className="text-xl font-semibold mb-6">{t.mainConfig || 'تنظیمات اصلی سیستم'}</h3>
            <Card className="p-6 shadow-md w-full border border-slate-200 dark:border-slate-700  bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col">
                <div>
                  <Label className="text-base font-medium mb-3 block">فاصله ثبت لاگ سیستم (ثانیه)</Label>
                  <select className="w-full max-w-xs p-3 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700">
                    <option>30 ثانیه</option>
                    <option selected>60 ثانیه</option>
                    <option>120 ثانیه</option>
                    <option>300 ثانیه</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <Label className="text-base font-medium">ثبت خودکار تخلفات</Label>
                    <p className="text-sm text-slate-500">تخلفات به صورت خودکار ذخیره شوند</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <Label className="text-base font-medium">ارسال نوتیفیکیشن تخلفات مهم</Label>
                    <p className="text-sm text-slate-500">برای تخلفات جدی هشدار ارسال شود</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'ocr' && (
            <div className="space-y-8" style={{ height: '60vh' }}>
              <h3 className="text-xl font-semibold mb-6">تنظیمات تشخیص متن (OCR)</h3>
            <Card className="p-6 shadow-md w-full border border-slate-200 dark:border-slate-700  bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col">
                <Label className="text-base font-medium mb-6 block">دقت فعلی تشخیص پلاک</Label>
                <div className="space-y-4">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-12 relative overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-blue-600 h-12 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg" style={{ width: '88%' }}>
                      88%
                    </div>
                  </div>
                  <p className="text-center text-slate-600 dark:text-slate-400">دقت بسیار بالا — مناسب برای شرایط روز و شب</p>
                </div>
              </Card>

            <Card className="p-6 shadow-md w-full border border-slate-200 dark:border-slate-700  bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">فعال‌سازی OCR پیشرفته (Tesseract)</Label>
                    <p className="text-sm text-slate-500">دقت بالاتر با مصرف منابع بیشتر</p>
                  </div>
                  <Switch />
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'vehicle' && (
            <div className="space-y-8" style={{ height: '60vh' }}>
              <h3 className="text-xl font-semibold mb-6">{t.vehicle || 'تنظیمات تشخیص خودرو'}</h3>
            <Card className="p-6 shadow-md w-full border border-slate-200 dark:border-slate-700  bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col">
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  تنظیمات تشخیص نوع خودرو (سدان، وانت، کامیون)، رنگ، برند و مدل در نسخه‌های آینده اضافه خواهد شد.
                </p>
                <Badge variant="secondary" className="mt-4">به‌زودی</Badge>
              </Card>
            </div>
          )}

          {activeTab === 'imaging' && (
            <div className="space-y-8" style={{ height: '60vh' }}>
              <h3 className="text-xl font-semibold mb-6">{t.imaging || 'تنظیمات تصویربرداری'}</h3>
            <Card className="p-6 shadow-md w-full border border-slate-200 dark:border-slate-700  bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col">
                <div>
                  <Label className="text-base font-medium mb-3 block">کیفیت ذخیره تصاویر</Label>
                  <select className="w-full max-w-xs p-3 border rounded-lg dark:bg-slate-700">
                    <option>بالا (بدون فشرده‌سازی)</option>
                    <option selected>متوسط (فشرده‌سازی 80%)</option>
                    <option>پایین (فشرده‌سازی 50%)</option>
                  </select>
                </div>
                <div>
                  <Label className="text-base font-medium mb-3 block">فرمت ذخیره تصاویر</Label>
                  <div className="flex gap-4">
                    <Badge variant="default">JPEG</Badge>
                    <Badge variant="secondary">PNG</Badge>
                    <Badge variant="outline">WEBP</Badge>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'saving' && (
            <div className="space-y-8" style={{ height: '60vh' }}>
              <h3 className="text-xl font-semibold mb-6">{t.saving || 'تنظیمات ذخیره‌سازی'}</h3>
            <Card className="p-6 shadow-md w-full border border-slate-200 dark:border-slate-700  bg-slate-50 dark:bg-slate-700 rounded-xl flex flex-col">
                <div>
                  <Label className="text-base font-medium mb-3 block">مدت نگهداری فایل‌ها (روز)</Label>
                  <Slider defaultValue={[30]} max={365} step={10} className="w-full max-w-md" />
                  <p className="text-sm text-slate-500 mt-2">فایل‌های قدیمی‌تر از 30 روز به صورت خودکار حذف شوند</p>
                </div>
                <div>
                  <Label className="text-base font-medium mb-3 block">مسیر ذخیره‌سازی</Label>
                  <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg font-mono text-sm">
                    /storage/traffic_violations/2025/
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">پشتیبان‌گیری خودکار</Label>
                    <p className="text-sm text-slate-500">به سرور پشتیبان هر 24 ساعت</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </Card>
            </div>
          )}
        </div>
              </Card>
              </div>
              </div>
    </div>
  );
}