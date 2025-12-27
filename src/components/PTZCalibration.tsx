// src/components/PTZCalibration.tsx

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight as ArrowRightIcon,
  ZoomIn, ZoomOut, Save, Home, Play, Eye, Trash2
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
  };

  const savePreset = () => {
    if (!presetName.trim()) {
      toast.error('لطفاً نام Preset را وارد کنید');
      return;
    }

    const newPreset: PTZPreset = {
      id: `preset-${Date.now()}`,
      name: presetName.trim(),
      pan: offset.x,
      tilt: offset.y,
      zoom: scale,
      focus: 100
    };

    dispatch(addOrUpdatePreset({ intersectionId: intersection.id, preset: newPreset }));
    setPresetName('');
    toast.success('Preset جدید ذخیره شد');
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
    toast.success('Preset حذف شد');
  };

  const loadPreset = (preset: PTZPreset) => {
    setOffset({ x: preset.pan, y: preset.tilt });
    setScale(preset.zoom);
    setPresetName(preset.name);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            کالیبراسیون PTZ — {intersection.name}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            تنظیم دید دوربین چرخان و ذخیره presetهای دلخواه
          </p>
        </div>

        {/* سه ستون با نسبت 50% / 30% / 20% */}
        <div className="grid grid-cols-1 lg:grid-cols-[50%_30%_20%] gap-6">
          {/* ستون 1: تصویر (50%) */}
          <div>
            <Card className="p-4 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">نمای دوربین</h3>
                {isTesting && (
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full">
                    تست فعال
                  </span>
                )}
              </div>

              <div
                className="relative overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-900"
                style={{ width: '100%', height: 520 }}
              >
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
              </div>

              <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 flex gap-4">
                <span>پان: {offset.x.toFixed(1)}</span>
                <span>تیلت: {offset.y.toFixed(1)}</span>
                <span>زوم: {scale.toFixed(1)}x</span>
              </div>
            </Card>
          </div>

          {/* ستون 2: کنترل‌ها (30%) */}
          <div className="space-y-6">
            <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 rounded-xl">
              <h3 className="text-base font-medium text-slate-900 dark:text-slate-100 mb-4">حرکت</h3>
              <div className="grid grid-cols-3 gap-2 w-full max-w-[180px] mx-auto">
                <div />
                <Button size="icon" variant="outline" className="h-10 w-10" onClick={() => moveView(0, -30)}>
                  <ArrowUp className="w-5 h-5" />
                </Button>
                <div />
                <Button size="icon" variant="outline" className="h-10 w-10" onClick={() => moveView(-30, 0)}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="outline" className="h-10 w-10" onClick={resetView}>
                  <Home className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="outline" className="h-10 w-10" onClick={() => moveView(30, 0)}>
                  <ArrowRightIcon className="w-5 h-5" />
                </Button>
                <div />
                <Button size="icon" variant="outline" className="h-10 w-10" onClick={() => moveView(0, 30)}>
                  <ArrowDown className="w-5 h-5" />
                </Button>
                <div />
              </div>
            </Card>

            <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 rounded-xl">
              <h3 className="text-base font-medium text-slate-900 dark:text-slate-100 mb-4">زوم</h3>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => handleZoom('out')}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Slider value={[scale]} onValueChange={([v]) => setScale(v)} min={0.5} max={3} step={0.1} className="flex-1" />
                <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => handleZoom('in')}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 rounded-xl">
              <h3 className="text-base font-medium text-slate-900 dark:text-slate-100 mb-4">ذخیره Preset جدید</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-700 dark:text-slate-300">نام Preset *</Label>
                  <Input
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="مثلاً: دید جنوبی"
                    className="mt-1 text-sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800/50 rounded text-center">
                    <p className="text-[10px] text-slate-600 dark:text-slate-400">پان</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{offset.x.toFixed(1)}</p>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800/50 rounded text-center">
                    <p className="text-[10px] text-slate-600 dark:text-slate-400">تیلت</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{offset.y.toFixed(1)}</p>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800/50 rounded text-center">
                    <p className="text-[10px] text-slate-600 dark:text-slate-400">زوم</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{scale.toFixed(1)}x</p>
                  </div>
                </div>
                <Button className="w-full text-sm" onClick={savePreset}>
                  <Save className="w-4 h-4 ml-1" /> ذخیره Preset
                </Button>
              </div>
            </Card>
          </div>

          {/* ستون 3: Presetها (20%) */}
          <div>
            <Card className="p-4 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 rounded-xl h-full flex flex-col">
              <h3 className="text-base font-medium text-slate-900 dark:text-slate-100 mb-3">
                Preset‌ها ({presets.length})
              </h3>
              
              <div className="overflow-y-auto space-y-2 pr-1 flex-1 max-h-[520px] text-xs">
                {presets.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400 text-center px-2">
                    <p>هیچ presetی تعریف نشده است</p>
                  </div>
                ) : (
                  presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <p className="font-medium text-[11px] text-slate-900 dark:text-slate-200 line-clamp-1">
                          {preset.name}
                        </p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-6 w-6 p-0.5"
                          onClick={() => deletePreset(preset.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-1 mb-2">
                        <div className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-[9px] text-center">پان: {preset.pan.toFixed(0)}</div>
                        <div className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-[9px] text-center">تیلت: {preset.tilt.toFixed(0)}</div>
                        <div className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-[9px] text-center">زوم: {preset.zoom.toFixed(1)}x</div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="flex-1 text-[9px] px-1.5 py-0.5 h-auto" onClick={() => testPreset(preset)}>
                          <Play className="w-2 h-2 ml-0.5" /> تست
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-[9px] px-1.5 py-0.5 h-auto"
                          onClick={() => loadPreset(preset)}
                        >
                          <Eye className="w-2 h-2 ml-0.5" /> بارگذاری
                        </Button>
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