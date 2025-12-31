// src/components/SubPresetCalibration.tsx
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight as ArrowRightIcon,
  ZoomIn, ZoomOut, Save, Home, Play, Trash2, Edit3, X
} from 'lucide-react';
import { SubPreset, Intersection } from '../types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { addOrUpdateSubPreset, removeSubPreset } from '../store/subPresetSlice';
import { toast } from 'sonner';

interface SubPresetCalibrationProps {
  intersection: Intersection;
  maskId: string;
  maskName: string;
  onClose: () => void;
}

export function SubPresetCalibration({
  intersection,
  maskId,
  maskName,
  onClose,
}: SubPresetCalibrationProps) {
  const dispatch = useDispatch<AppDispatch>();
  const subPresets = useSelector((state: RootState) =>
    state.subPresets.byIntersectionAndMask[intersection.id]?.[maskId] || []
  );

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [presetName, setPresetName] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);

  // ❗️ فقط برای دیباگ mock — در نسخه نهایی حذف شود
  useEffect(() => {
    (window as any).mockSubPresets = {
      ...(window as any).mockSubPresets,
      [intersection.id]: {
        ...(window as any).mockSubPresets?.[intersection.id],
        [maskId]: subPresets,
      },
    };
  }, [subPresets, intersection.id, maskId]);

  const moveView = (dx: number, dy: number) => {
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setScale(prev => {
      const newScale = direction === 'in'
        ? Math.min(3, prev + 0.2)
        : Math.max(0.5, prev - 0.2);
      return Math.round(newScale * 10) / 10;
    });
  };

  const resetView = () => {
    setOffset({ x: 0, y: 0 });
    setScale(1);
    setPresetName('');
    setSelectedPresetId(null);
    setEditingPresetId(null);
  };

  const savePreset = (inPlace = false) => {
    if (!presetName.trim()) {
      toast.error('لطفاً نام Sub-preset را وارد کنید');
      return;
    }

    const targetId = inPlace && editingPresetId
      ? editingPresetId
      : (selectedPresetId || `sub-${Date.now()}`);

    const newSubPreset: SubPreset = {
      id: targetId,
      name: presetName.trim(),
      pan: offset.x,
      tilt: offset.y,
      zoom: scale,
      focus: 100,
      maskId,
      presetId: '',
    };

    dispatch(
      addOrUpdateSubPreset({
        intersectionId: intersection.id,
        maskId,
        subPreset: newSubPreset,
      })
    );
    setPresetName('');
    setSelectedPresetId(null);
    setEditingPresetId(null);
    toast.success(inPlace ? 'تغییرات ذخیره شد' : 'Sub-preset جدید ذخیره شد');
  };

  const testPreset = (preset: SubPreset) => {
    setIsTesting(true);
    setOffset({ x: preset.pan, y: preset.tilt });
    setScale(preset.zoom);

    setTimeout(() => {
      setIsTesting(false);
      toast.success(`تست ${preset.name} تکمیل شد`);
    }, 2000);
  };

  const deletePreset = (id: string) => {
    dispatch(
      removeSubPreset({
        intersectionId: intersection.id,
        maskId,
        subPresetId: id,
      })
    );
    if (selectedPresetId === id || editingPresetId === id) {
      setSelectedPresetId(null);
      setEditingPresetId(null);
      setPresetName('');
      resetView();
    }
    toast.success('Sub-preset حذف شد');
  };

  const selectPreset = (preset: SubPreset) => {
    setSelectedPresetId(preset.id);
    setOffset({ x: preset.pan, y: preset.tilt });
    setScale(preset.zoom);
  };

  const startEditPreset = (preset: SubPreset) => {
    setOffset({ x: preset.pan, y: preset.tilt });
    setScale(preset.zoom);
    setPresetName(preset.name);
    setSelectedPresetId(preset.id);
    setEditingPresetId(preset.id);
  };

  const cancelEdit = () => {
    if (selectedPresetId) {
      const preset = subPresets.find(p => p.id === selectedPresetId);
      if (preset) {
        setOffset({ x: preset.pan, y: preset.tilt });
        setScale(preset.zoom);
      }
    }
    setEditingPresetId(null);
    setPresetName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 sm:p-6">
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-[80vw] h-[80vh] flex flex-col"
        dir="rtl"
      >
        {/* هدر */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              تعریف Sub-preset برای منطقه: <span className="text-blue-600 dark:text-blue-400">{maskName}</span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {intersection.name} — تنظیم دید دوربین چرخان برای عکس‌برداری از این منطقه تخلف
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* بدنه اصلی */}
        <div className="flex-1 overflow-hidden p-4 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-[65%_34%] gap-5 h-full">
            {/* نمای دوربین */}
            <div className="flex flex-col">
              <Card className="w-full h-full flex flex-col border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl">
                <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    نمای دوربین چرخان
                  </h3>
                  {isTesting && (
                    <span className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
                      تست فعال
                    </span>
                  )}
                </div>

                <div className="relative flex-1 overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-900 mx-3 mb-3">
                  {intersection.imageUrl ? (
                    <img
                      src={intersection.imageUrl}
                      alt="چهارراه"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-150"
                      style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                        transformOrigin: 'center',
                      }}
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                      تصویری از چهارراه موجود نیست
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    <div className="grid grid-cols-3 gap-1 bg-black/40 backdrop-blur-sm p-1 rounded-md">
                      <div />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 p-0 bg-white/20 hover:bg-white/30 text-white"
                        onClick={() => moveView(0, -30)}
                      >
                        <ArrowUp className="w-2.5 h-2.5" />
                      </Button>
                      <div />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 p-0 bg-white/20 hover:bg-white/30 text-white"
                        onClick={() => moveView(-30, 0)}
                      >
                        <ArrowLeft className="w-2.5 h-2.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 p-0 bg-white/20 hover:bg-white/30 text-white"
                        onClick={resetView}
                      >
                        <Home className="w-2.5 h-2.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 p-0 bg-white/20 hover:bg-white/30 text-white"
                        onClick={() => moveView(30, 0)}
                      >
                        <ArrowRightIcon className="w-2.5 h-2.5" />
                      </Button>
                      <div />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 p-0 bg-white/20 hover:bg-white/30 text-white"
                        onClick={() => moveView(0, 30)}
                      >
                        <ArrowDown className="w-2.5 h-2.5" />
                      </Button>
                      <div />
                    </div>

                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm p-1 rounded-md">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 p-0 bg-white/20 hover:bg-white/30 text-white"
                        onClick={() => handleZoom('out')}
                      >
                        <ZoomOut className="w-2.5 h-2.5" />
                      </Button>
                      <Slider
                        value={[scale]}
                        onValueChange={([v]) => setScale(v)}
                        min={0.5}
                        max={3}
                        step={0.1}
                        className="w-14"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 p-0 bg-white/20 hover:bg-white/30 text-white"
                        onClick={() => handleZoom('in')}
                      >
                        <ZoomIn className="w-2.5 h-2.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-3 text-[11px] text-slate-600 dark:text-slate-400 flex gap-3">
                  <span>pan: {offset.x.toFixed(1)}</span>
                  <span>tilt: {offset.y.toFixed(1)}</span>
                  <span>zoom: {scale.toFixed(1)}x</span>
                </div>
              </Card>
            </div>

            {/* لیست و فرم */}
            <div className="flex flex-col gap-5 h-full">
              <Card className="p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl shrink-0">
                <div className="flex justify-between items-start mb-2.5">
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {editingPresetId ? 'ویرایش Sub-preset' : 'ایجاد Sub-preset جدید'}
                  </h3>
                  {editingPresetId ? (
                    <div className="flex gap-1">
                      <Button
                        onClick={() => savePreset(true)}
                        size="icon"
                        variant="ghost"
                        className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 h-5 w-5 p-0.5"
                      >
                        <Save className="w-2.5 h-2.5" />
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        size="icon"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 h-5 w-5 p-0.5"
                      >
                        <X className="w-2.5 h-2.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => savePreset(false)}
                      size="icon"
                      variant="ghost"
                      className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 h-5 w-5 p-0.5"
                    >
                      <Save className="w-2.5 h-2.5" />
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] text-slate-700 dark:text-slate-300">
                    نام Sub-preset *
                  </Label>
                  <Input
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="نام sub-preset را وارد کنید..."
                    className="text-sm bg-slate-50 dark:bg-slate-700"
                  />
                </div>
              </Card>

              {/* لیست sub-presets */}
              <Card className="flex-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl flex flex-col p-3">
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                  Sub-preset‌ها ({subPresets.length})
                </h3>

                <div className="overflow-y-auto space-y-2 text-[11px] flex-1">
                  {subPresets.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400 text-center px-2 py-3">
                      <p>هیچ sub-presetی تعریف نشده است</p>
                    </div>
                  ) : (
                    subPresets.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => selectPreset(preset)}
                        className={`p-2.5 rounded-md border cursor-pointer transition-colors ${
                          selectedPresetId === preset.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <p className="font-medium text-[11px] text-slate-900 dark:text-slate-200 line-clamp-1">
                            {preset.name}
                          </p>
                          <div className="flex gap-1">
                            {editingPresetId === preset.id ? (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 h-4 w-4 p-0.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    savePreset(true);
                                  }}
                                >
                                  <Save className="w-2.5 h-2.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 h-4 w-4 p-0.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cancelEdit();
                                  }}
                                >
                                  <X className="w-2.5 h-2.5" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 h-4 w-4 p-0.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditPreset(preset);
                                  }}
                                >
                                  <Edit3 className="w-2.5 h-2.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 h-4 w-4 p-0.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    testPreset(preset);
                                  }}
                                >
                                  <Play className="w-2.5 h-2.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 h-4 w-4 p-0.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deletePreset(preset.id);
                                  }}
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <div className="bg-slate-300 dark:bg-slate-700 px-1 py-0.5 rounded text-[9px] text-center">
                            pan: {preset.pan.toFixed(0)}
                          </div>
                          <div className="bg-slate-300 dark:bg-slate-700 px-1 py-0.5 rounded text-[9px] text-center">
                            tilt: {preset.tilt.toFixed(0)}
                          </div>
                          <div className="bg-slate-300 dark:bg-slate-700 px-1 py-0.5 rounded text-[9px] text-center">
                            zoom: {preset.zoom.toFixed(1)}x
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}