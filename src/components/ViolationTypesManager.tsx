// src/components/ViolationTypesManager.tsx

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ViolationType {
  id: string;
  code: string; // ✅ فیلد جدید: کد تخلف
  name: string;
  description: string;
  validDuration: number;
  color: string;
}

const initialViolationTypes: ViolationType[] = [
  { id: '1', code: '101', name: 'عبور از چراغ قرمز', description: 'عبور از خط توقف پس از قرمز شدن چراغ', validDuration: 30, color: '#ef4444' },
  { id: '2', code: '102', name: 'تجاوز به خط عابر', description: 'عبور از خط عابر پیاده در زمان ممنوع', validDuration: 15, color: '#f97316' },
  { id: '3', code: '103', name: 'سرعت غیرمجاز', description: 'تجاوز از حد مجاز سرعت', validDuration: 60, color: '#8b5cf6' },
  { id: '4', code: '104', name: 'تغییر خط ممنوع', description: 'تغییر خط در محل ممنوع', validDuration: 30, color: '#ec4899' },
  { id: '5', code: '105', name: 'پارک ممنوع', description: 'توقف در محل پارک ممنوع', validDuration: 7, color: '#10b981' },
];

export function ViolationTypesManager() {
  const [violationTypes, setViolationTypes] = useState<ViolationType[]>(initialViolationTypes);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    validDuration: '',
  });

  const handleAdd = () => {
    const { code, name } = formData;

    if (!code.trim()) {
      toast.error('کد تخلف الزامی است');
      return;
    }

    if (!name.trim()) {
      toast.error('نام تخلف الزامی است');
      return;
    }

    // بررسی منحصربه‌فرد بودن کد
    if (violationTypes.some(v => v.code === code)) {
      toast.error('کد تخلف تکراری است. لطفاً کد دیگری وارد کنید.');
      return;
    }

    const newId = String(Math.max(...violationTypes.map(v => Number(v.id)), 0) + 1);
    const newColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;

    const newViolation: ViolationType = {
      id: newId,
      code: code.trim(),
      name: name.trim(),
      description: formData.description.trim(),
      validDuration: formData.validDuration,
      color: newColor,
    };

    setViolationTypes([...violationTypes, newViolation]);
    setFormData({ code: '', name: '', description: '', validDuration: 30 });
    toast.success('تخلف جدید با موفقیت اضافه شد');
  };

  const handleDelete = (id: string) => {
    setViolationTypes(violationTypes.filter(v => v.id !== id));
    toast.success('تخلف حذف شد');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 dark:bg-slate-900 p-4">
<div className="max-w-[1800px] mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">مدیریت انواع تخلفات</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          انواع تخلفات قابل شناسایی در سیستم را اینجا تعریف و مدیریت کنید
        </p>
      </div>

      <div
          className="grid grid-cols-1 lg:grid-cols-[55%_43%] gap-6"
          style={{ height: '80vh' }}
        >
      {/* فرم افزودن */}
      <Card className="p-6 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">افزودن تخلف جدید</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         
          <div>
            <Label className="mb-3 text-slate-700 dark:text-slate-300">نام تخلف</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="نام تخلف را وارد کنید"
              className="mt-1 bg-slate-50 dark:bg-slate-700"
            />
              </div>
               <div>
            <Label className=" mb-3 text-slate-700 dark:text-slate-300">کد تخلف</Label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="کد تخلف را وارد کنید"
              className="mt-1 bg-slate-50 dark:bg-slate-700"
            />
          </div>
          <div>
            <Label className="mb-3 text-slate-700 dark:text-slate-300">مدت زمان توقف جریمه (ثانیه)</Label>
            <Input
              type="number"
              value={formData.validDuration}
              onChange={(e) => setFormData({ ...formData, validDuration: Number(e.target.value) })}
                  min={1}
                  placeholder="مدت زمان توقف جریمه را وارد کنید"
              className="mt-1 bg-slate-50 dark:bg-slate-700"
            />
          </div>
          <div className="mb-6 md:col-span-2">
            <Label className=" mb-3 text-slate-700 dark:text-slate-300">توضیحات</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="توضیح درباره این تخلف..."
              rows={8}
              className="mt-1 bg-slate-50 dark:bg-slate-700 "
            />
          </div>
          <div className="flex items-center justify-end md:col-span-2">
            <Button
              onClick={handleAdd}
                               className="shadow-md hover:shadow-lg transition-shadow bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600">
                  
                  
          
              <Plus className="w-4 h-4" />
              افزودن تخلف جدید
            </Button>
          </div>
        </div>
      </Card>

      {/* لیست تخلفات */}
      <Card className="p-6 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          تخلفات تعریف شده در سیستم
        </h3>
        <div className="space-y-3">
          {violationTypes.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
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
                    کد تخلف: {v.code} | مدت زمان توقف جریمه: {v.validDuration} ثانیه
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                onClick={() => handleDelete(v.id)}
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
        </div>
    </div>
  );
}