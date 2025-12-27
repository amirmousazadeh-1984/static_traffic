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
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 dark:bg-slate-900">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              کالیبراسیون PTZ — {intersection.name}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              تنظیم دید دوربین چرخان و ذخیره presetهای دلخواه
            </p>
          </div>
        </div>

        {/* سه ستون اصلی */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ستون 1: تصویر واقعی (چپ) */}
          <div>
            <Card className="p-4 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">نمای دوربین</h3>
                {isTesting && (
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
                    تست فعال
                  </span>
                )}
              </div>

              <div
                className="relative overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-900"
                style={{ width: '100%', height: 500 }}
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

              <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex gap-4">
                <span>Pan: {offset.x.toFixed(1)}</span>
                <span>Tilt: {offset.y.toFixed(1)}</span>
                <span>Zoom: {scale.toFixed(1)}x</span>
              </div>
            </Card>
          </div>

          {/* ستون 2: کنترل‌ها (وسط) */}
          <div className="space-y-6">
            <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">حرکت</h3>
              <div className="grid grid-cols-3 gap-2 w-full max-w-[200px] mx-auto">
                <div />
                <Button size="icon" variant="outline" onClick={() => moveView(0, -25)}>
                  <ArrowUp className="w-5 h-5" />
                </Button>
                <div />
                <Button size="icon" variant="outline" onClick={() => moveView(-25, 0)}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="outline" onClick={resetView}>
                  <Home className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => moveView(25, 0)}>
                  <ArrowRightIcon className="w-5 h-5" />
                </Button>
                <div />
                <Button size="icon" variant="outline" onClick={() => moveView(0, 25)}>
                  <ArrowDown className="w-5 h-5" />
                </Button>
                <div />
              </div>
            </Card>

            <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">زوم</h3>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={() => handleZoom('out')}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Slider value={[scale]} onValueChange={([v]) => setScale(v)} min={0.5} max={3} step={0.1} className="flex-1" />
                <Button size="icon" variant="outline" onClick={() => handleZoom('in')}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            <Card className="p-6 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">ذخیره Preset جدید</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-700 dark:text-slate-300">نام Preset *</Label>
                  <Input
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="مثلاً: دید جنوبی با زوم بالا"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800/50 rounded text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Pan</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{offset.x.toFixed(1)}</p>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800/50 rounded text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Tilt</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{offset.y.toFixed(1)}</p>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800/50 rounded text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Zoom</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{scale.toFixed(1)}x</p>
                  </div>
                </div>
                <Button className="w-full" onClick={savePreset}>
                  <Save className="w-4 h-4 ml-2" /> ذخیره Preset
                </Button>
              </div>
            </Card>
          </div>

          {/* ستون 3: Presetهای ذخیره‌شده (راست) */}
          <div>
            <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 h-full flex flex-col">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Preset‌های ذخیره‌شده ({presets.length})
              </h3>
              
              <div className="overflow-y-auto space-y-3 pr-1 flex-1 max-h-[500px]">
                {presets.length === 0 ? (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-6 text-sm">
                    هیچ Presetی تعریف نشده است
                  </p>
                ) : (
                  presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-xs text-slate-900 dark:text-slate-100">{preset.name}</p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-6 w-6"
                          onClick={() => deletePreset(preset.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[10px] mb-2">
                        <div className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded text-center">Pan: {preset.pan.toFixed(1)}</div>
                        <div className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded text-center">Tilt: {preset.tilt.toFixed(1)}</div>
                        <div className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded text-center">Zoom: {preset.zoom.toFixed(1)}x</div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="flex-1 text-[10px] px-2 py-1 h-auto" onClick={() => testPreset(preset)}>
                          <Play className="w-2.5 h-2.5 ml-1" /> تست
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-[10px] px-2 py-1 h-auto"
                          onClick={() => loadPreset(preset)}
                        >
                          <Eye className="w-2.5 h-2.5 ml-1" /> بارگذاری
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