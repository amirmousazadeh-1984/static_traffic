// src/components/ViolationTypesManager.tsx

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AlertCircle, Plus, Trash2, Edit3, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { translations, type Language } from '../locales';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { addViolationType, updateViolationType, deleteViolationType } from '../store/violationSlice';

interface ViolationType {
  id: string;
  code: string;
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

interface ViolationTypesManagerProps {
  language: Language;
}

export function ViolationTypesManager({ language }: ViolationTypesManagerProps) {
  const t = translations[language];
  const isRTL = language === 'fa';
  const dispatch = useDispatch();

  const violationTypes = useSelector((state: RootState) => state.violations.types);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    validDuration: 30,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ViolationType | null>(null);

  const handleAdd = () => {
    const { code, name } = formData;

    if (!code.trim()) {
      toast.error(t.codeRequired);
      return;
    }

    if (!name.trim()) {
      toast.error(t.nameRequired);
      return;
    }

    if (violationTypes.some(v => v.code === code)) {
      toast.error(t.codeDuplicate);
      return;
    }

   const newId = String(Math.max(...violationTypes.map(v => Number(v.id)), 0) + 1);
    const newColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;

    const newViolation: ViolationType = {
      id: newId,
      code: code.trim(),
      name: name.trim(),
      description: formData.description.trim(),
      validDuration: Number(formData.validDuration),
      color: newColor,
    };

    dispatch(addViolationType(newViolation));
    setFormData({ code: '', name: '', description: '', validDuration: 30 });
    toast.success(t.violationAdded);
  };

 const handleDelete = (id: string) => {
    dispatch(deleteViolationType(id));
    toast.success(t.violationDeleted);
  };

  const handleEditClick = (violation: ViolationType) => {
    setEditingId(violation.id);
    setEditForm({ ...violation });
  };

  const handleEditChange = (field: keyof ViolationType, value: string | number) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  const handleSaveEdit = () => {
    if (!editForm) return;

    const { id, code, name } = editForm;

    if (!code.trim()) {
      toast.error(t.codeRequired);
      return;
    }

    if (!name.trim()) {
      toast.error(t.nameRequired);
      return;
    }

    const isDuplicate = violationTypes.some(v => v.code === code && v.id !== id);
    if (isDuplicate) {
      toast.error(t.codeDuplicateShort);
      return;
    }

    dispatch(updateViolationType({ ...editForm, code: code.trim(), name: name.trim(), description: editForm.description.trim() }));

    setEditingId(null);
    setEditForm(null);
    toast.success(t.changesSaved);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-100 dark:bg-slate-900 p-4">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t.violationTypesManagerTitle}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t.violationTypesManagerDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[55%_43%] gap-6" style={{ height: '80vh' }}>
          <Card className="p-6 border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {editingId ? t.editViolation : t.addNewViolation}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-3 text-slate-700 dark:text-slate-300">{t.violationNameLabel}</Label>
                <Input
                  value={editingId ? editForm?.name || '' : formData.name}
                  onChange={(e) =>
                    editingId
                      ? handleEditChange('name', e.target.value)
                      : setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={language === 'fa' ? "نام تخلف را وارد کنید" : "Enter violation name"}
                  className="mt-1 bg-slate-50 dark:bg-slate-700"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <div>
                <Label className="mb-3 text-slate-700 dark:text-slate-300">{t.violationCodeLabel}</Label>
                <Input
                  value={editingId ? editForm?.code || '' : formData.code}
                  onChange={(e) =>
                    editingId
                      ? handleEditChange('code', e.target.value)
                      : setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder={language === 'fa' ? "کد تخلف را وارد کنید" : "Enter violation code"}
                  className="mt-1 bg-slate-50 dark:bg-slate-700"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <div>
                <Label className="mb-3 text-slate-700 dark:text-slate-300">{t.validDurationLabel}</Label>
                <Input
                  type="number"
                  value={editingId ? editForm?.validDuration || 30 : formData.validDuration}
                  onChange={(e) =>
                    editingId
                      ? handleEditChange('validDuration', Number(e.target.value))
                      : setFormData({ ...formData, validDuration: Number(e.target.value) })
                  }
                  min={1}
                  placeholder={language === 'fa' ? "مدت زمان توقف جریمه را وارد کنید" : "Enter hold duration"}
                  className="mt-1 bg-slate-50 dark:bg-slate-700"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-3 text-slate-700 dark:text-slate-300">{t.descriptionLabel}</Label>
                <Textarea
                  value={editingId ? editForm?.description || '' : formData.description}
                  onChange={(e) =>
                    editingId
                      ? handleEditChange('description', e.target.value)
                      : setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={language === 'fa' ? "توضیح درباره این تخلف..." : "Description about this violation..."}
                  rows={8}
                  className="mt-1 bg-slate-50 dark:bg-slate-700"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="flex items-center justify-end md:col-span-2 gap-2">
                {editingId ? (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 h-6 w-6 p-0.5"
                      onClick={handleSaveEdit}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 h-6 w-6 p-0.5"
                      onClick={handleCancelEdit}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleAdd}
                    className="shadow-md hover:shadow-lg transition-shadow bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    {t.addButton}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {t.definedViolationsTitle}
            </h3>
            <div className="space-y-3">
              {violationTypes.map((v) => (
                <div
                  key={v.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    editingId === v.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-inner'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
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
                        {t.codeLabel}: {v.code} | {t.durationLabel}: {v.validDuration} {t.seconds}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {editingId === v.id ? (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 h-6 w-6 p-0.5"
                          onClick={handleSaveEdit}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 h-6 w-6 p-0.5"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 h-5 w-5 p-0.5"
                          onClick={() => handleEditClick(v)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 h-5 w-5 p-0.5"
                          onClick={() => handleDelete(v.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {violationTypes.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t.noViolationsDefined}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}