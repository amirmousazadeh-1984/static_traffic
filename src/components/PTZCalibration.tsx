// src/components/PTZCalibration.tsx

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight as ArrowRightIcon,
  ZoomIn, ZoomOut, Save, Home, Play, Eye, Trash2, Edit3, X
} from 'lucide-react';
import { PTZPreset, Intersection } from '../types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { addOrUpdatePreset, removePreset } from '../store/ptzPresetSlice';
import { toast } from 'sonner';

interface PTZCalibrationProps {
  intersection: Intersection;
}

export function PTZCalibration({ intersection }: PTZCalibrationProps) {
  const dispatch = useDispatch<AppDispatch>();
  const presets = useSelector((state: RootState) => state.ptzPresets[intersection.id] || []);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [presetName, setPresetName] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);

  useEffect(() => {
    (window as any).mockPTZPresets = { ...(window as any).mockPTZPresets, [intersection.id]: presets };
  }, [presets, intersection.id]);

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
      toast.error('لطفاً نام Preset را وارد کنید');
      return;
    }

    const targetId = inPlace && editingPresetId ? editingPresetId : (selectedPresetId || `preset-${Date.now()}`);
    const newPreset: PTZPreset = {
      id: targetId,
      name: presetName.trim(),
      pan: offset.x,
      tilt: offset.y,
      zoom: scale,
      focus: 100
    };

    dispatch(addOrUpdatePreset({ intersectionId: intersection.id, preset: newPreset }));
    setPresetName('');
    setSelectedPresetId(null);
    setEditingPresetId(null);
    toast.success(inPlace ? 'تغییرات ذخیره شد' : (selectedPresetId ? 'Preset به‌روزرسانی شد' : 'Preset جدید ذخیره شد'));
  };

  const testPreset = (preset: PTZPreset) => {
    setIsTesting(true);
    setOffset({ x: preset.pan, y: preset.tilt });
    setScale(preset.zoom);

    setTimeout(() => {
      setIsTesting(false);
      toast.success(`تست ${preset.name} تکمیل شد`);
    }, 2500);
  };

  const deletePreset = (id: string) => {
    dispatch(removePreset({ intersectionId: intersection.id, presetId: id }));
    if (selectedPresetId === id || editingPresetId === id) {
      setSelectedPresetId(null);
      setEditingPresetId(null);
      setPresetName('');
      resetView();
    }
    toast.success('Preset حذف شد');
  };

  const selectPreset = (preset: PTZPreset) => {
    setSelectedPresetId(preset.id);
    setOffset({ x: preset.pan, y: preset.tilt });
    setScale(preset.zoom);
    // فقط برای نمایش — نام را در فرم نمی‌نویسیم مگر در حالت ادیت
  };

  const startEditPreset = (preset: PTZPreset) => {
    setOffset({ x: preset.pan, y: preset.tilt });
    setScale(preset.zoom);
    setPresetName(preset.name);
    setSelectedPresetId(preset.id);
    setEditingPresetId(preset.id);
  };

  const cancelEdit = () => {
    if (selectedPresetId) {
      const preset = presets.find(p => p.id === selectedPresetId);
      if (preset) {
        setOffset({ x: preset.pan, y: preset.tilt });
        setScale(preset.zoom);
        setPresetName('');
      }
    }
    setEditingPresetId(null);
    setPresetName('');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 dark:bg-slate-900 p-4">
      <div className="mx-auto">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            کالیبراسیون PTZ — {intersection.name}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            تنظیم دید دوربین چرخان و ذخیره presetهای دلخواه
          </p>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6"
          style={{ height: '80vh' }}
        >
          {/* ستون 1: تصویر */}
          <div className="flex">
            <Card className="w-full border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 rounded-xl flex flex-col">
              <div className="p-4 pb-2 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">نمای دوربین</h3>
                {isTesting && (
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full">
                    تست فعال
                  </span>
                )}
              </div>

              <div className="relative flex-1 overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-900 mx-4 mb-3">
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
                  <div className="grid grid-cols-3 gap-1 bg-black/30 backdrop-blur-sm p-1.5 rounded-lg">
                    <div />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 text-white"
                      onClick={() => moveView(0, -30)}
                    >
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <div />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 text-white"
                      onClick={() => moveView(-30, 0)}
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 text-white"
                      onClick={resetView}
                    >
                      <Home className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 text-white"
                      onClick={() => moveView(30, 0)}
                    >
                      <ArrowRightIcon className="w-3 h-3" />
                    </Button>
                    <div />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 text-white"
                      onClick={() => moveView(0, 30)}
                    >
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                    <div />
                  </div>

                  <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm p-1.5 rounded-lg">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 text-white"
                      onClick={() => handleZoom('out')}
                    >
                      <ZoomOut className="w-3 h-3" />
                    </Button>
                    <Slider
                      value={[scale]}
                      onValueChange={([v]) => setScale(v)}
                      min={0.5}
                      max={3}
                      step={0.1}
                      className="w-16"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 text-white"
                      onClick={() => handleZoom('in')}
                    >
                      <ZoomIn className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-3 text-xs text-slate-600 dark:text-slate-400 flex gap-4">
                <span>pan: {offset.x.toFixed(1)}</span>
                <span>tilt: {offset.y.toFixed(1)}</span>
                <span>zoom: {scale.toFixed(1)}x</span>
              </div>
            </Card>
          </div>

          {/* ستون 2: presetها و فرم */}
          <div className="flex flex-col gap-6 h-full">
            <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 rounded-xl shrink-0">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-base font-medium text-slate-900 dark:text-slate-100">
                  {editingPresetId ? 'ویرایش Preset' : 'ایجاد Preset جدید'}
                </h3>
                {editingPresetId ? (
                  <div className="flex gap-1">
                    <Button
                      onClick={() => savePreset(true)}
                      size="icon"
                      variant="ghost"
                      className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 h-6 w-6 p-0.5"
                    >
                      <Save className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      size="icon"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 h-6 w-6 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => savePreset(false)}
                    size="icon"
                    variant="ghost"
                    className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 h-6 w-6 p-0.5"
                  >
                    <Save className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-slate-700 dark:text-slate-300">نام Preset *</Label>
                  <Input
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="نام preset را وارد کنید..."
                    className="mt-1 text-sm bg-slate-50 dark:bg-slate-700"
                  />
                </div>
              </div>
            </Card>

            {/* لیست presetها با اسکرول */}
            <Card className="flex-1 border  border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 rounded-xl flex flex-col min-h-0 p-4">
              <h3 className="text-base font-medium text-slate-900 dark:text-slate-100 mb-2">
                Preset‌ها ({presets.length})
              </h3>

              <div className="overflow-y-auto pr-1 space-y-2 text-xs flex-1 min-h-0">
                {presets.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400 text-center px-2 py-4">
                    <p>هیچ presetی تعریف نشده است</p>
                  </div>
                ) : (
                  presets.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => selectPreset(preset)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                        selectedPresetId === preset.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-[11px] text-slate-900 dark:text-slate-200 line-clamp-1">
                          {preset.name}
                        </p>
                        <div className="flex gap-1">
                          {editingPresetId === preset.id ? (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 h-5 w-5 p-0.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  savePreset(true);
                                }}
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 h-5 w-5 p-0.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelEdit();
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 h-5 w-5 p-0.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditPreset(preset);
                                }}
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 h-5 w-5 p-0.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  testPreset(preset);
                                }}
                              >
                                <Play className="w-3 h-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 h-5 w-5 p-0.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deletePreset(preset.id);
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <div className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-[9px] text-center">
                          pan: {preset.pan.toFixed(0)}
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-[9px] text-center">
                          tilt: {preset.tilt.toFixed(0)}
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-[9px] text-center">
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
  );
}