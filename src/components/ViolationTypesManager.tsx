// src/components/ViolationTypesManager.tsx

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// ساختار تخلف جدید
interface ViolationType {
  code: number;
  name: string;
  description: string;
  validDuration: number; // به روز
  color: string;
}

// لیست اولیه (که قبلاً در mockDatabase بود)
const initialViolationTypes: ViolationType[] = [
  { code: 1, name: 'عبور از چراغ قرمز', description: 'عبور از خط توقف پس از قرمز شدن چراغ', validDuration: 30, color: '#ef4444' },
  { code: 2, name: 'تجاوز به خط عابر', description: 'عبور از خط عابر پیاده در زمان ممنوع', validDuration: 15, color: '#f97316' },
  { code: 3, name: 'سرعت غیرمجاز', description: 'تجاوز از حد مجاز سرعت', validDuration: 60, color: '#8b5cf6' },
  { code: 4, name: 'تغییر خط ممنوع', description: 'تغییر خط در محل ممنوع', validDuration: 30, color: '#ec4899' },
  { code: 5, name: 'پارک ممنوع', description: 'توقف در محل پارک ممنوع', validDuration: 7, color: '#10b981' },
];

export function ViolationTypesManager() {
  const [violationTypes, setViolationTypes] = useState<ViolationType[]>(initialViolationTypes);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    validDuration: 30,
  });

  const handleAdd = () => {
    if (!formData.name.trim()) {
      toast.error('نام تخلف الزامی است');
      return;
    }

    const newViolation: ViolationType = {
      code: Math.max(...violationTypes.map(v => v.code), 0) + 1,
      name: formData.name,
      description: formData.description,
      validDuration: formData.validDuration,
      color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`, // رنگ تصادفی
    };

    setViolationTypes([...violationTypes, newViolation]);
    setFormData({ name: '', description: '', validDuration: 30 });
    toast.success('تخلف جدید با موفقیت اضافه شد');
  };

  const handleDelete = (code: number) => {
    setViolationTypes(violationTypes.filter(v => v.code !== code));
    toast.success('تخلف حذف شد');
  };

  // این تابع رو export می‌کنیم تا در جاهای دیگه استفاده بشه
  (ViolationTypesManager as any).getViolationTypes = () => violationTypes;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">مدیریت انواع تخلفات</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          انواع تخلفات قابل شناسایی در سیستم را اینجا تعریف و مدیریت کنید
        </p>
      </div>

      {/* فرم افزودن تخلف جدید */}
      <Card className="p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">افزودن تخلف جدید</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>نام تخلف</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: توقف دوبل"
              className="mt-1"
            />
          </div>
          <div>
            <Label>مدت اعتبار جریمه (روز)</Label>
            <Input
              type="number"
              value={formData.validDuration}
              onChange={(e) => setFormData({ ...formData, validDuration: Number(e.target.value) })}
              min={1}
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <Label>توضیحات</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="توضیح مختصر درباره این تخلف..."
              rows={3}
              className="mt-1"
            />
          </div>
          <div className="md:col-span-2">
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              افزودن تخلف جدید
            </Button>
          </div>
        </div>
      </Card>

      {/* لیست تخلفات موجود */}
      <Card className="p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">تخلفات تعریف شده ({violationTypes.length})</h3>
        <div className="space-y-3">
          {violationTypes.map((v) => (
            <div
              key={v.code}
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: v.color }}
                >
                  {v.code}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{v.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{v.description}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    اعتبار جریمه: {v.validDuration} روز
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                onClick={() => handleDelete(v.code)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {violationTypes.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>هنوز هیچ تخلفی تعریف نشده است</p>
          </div>
        )}
      </Card>
    </div>
  );
}