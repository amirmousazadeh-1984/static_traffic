// src/components/PTZCalibration.tsx

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight as ArrowRightIcon,
  ZoomIn, ZoomOut, Save, Camera, Home, Play, Eye, Trash2
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
  const presets = useSelector((state: RootState) => 
    state.ptzPresets[intersection.id] || []
  );

  const [position, setPosition] = useState({ pan: 0, tilt: 0 });
  const [zoom, setZoom] = useState(8);
  const [focus, setFocus] = useState(60);
  const [presetName, setPresetName] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  // ذخیره در mockDB برای سازگاری با سایر قسمت‌ها (اختیاری)
  useEffect(() => {
    const mockDB = (window as any).mockPTZPresets || {};
    mockDB[intersection.id] = presets;
    (window as any).mockPTZPresets = mockDB;
  }, [presets, intersection.id]);

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 10;
    switch (direction) {
      case 'up':
        setPosition(prev => ({ ...prev, tilt: Math.min(90, prev.tilt + step) }));
        break;
      case 'down':
        setPosition(prev => ({ ...prev, tilt: Math.max(-90, prev.tilt - step) }));
        break;
      case 'left':
        setPosition(prev => ({ ...prev, pan: (prev.pan - step + 360) % 360 }));
        break;
      case 'right':
        setPosition(prev => ({ ...prev, pan: (prev.pan + step) % 360 }));
        break;
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in') {
      setZoom(Math.min(30, zoom + 2));
    } else {
      setZoom(Math.max(1, zoom - 2));
    }
  };

  const resetToHome = () => {
    setPosition({ pan: 0, tilt: 0 });
    setZoom(8);
    setFocus(60);
  };

  const savePreset = () => {
    if (!presetName.trim()) {
      toast.error('لطفاً نام Preset را وارد کنید');
      return;
    }

    const newPreset: PTZPreset = {
      id: `preset-${Date.now()}`,
      name: presetName.trim(),
      pan: position.pan,
      tilt: position.tilt,
      zoom,
      focus
    };

    dispatch(addOrUpdatePreset({ intersectionId: intersection.id, preset: newPreset }));
    setPresetName('');
    toast.success('Preset جدید ذخیره شد');
  };

  const testPreset = (preset: PTZPreset) => {
    setIsTesting(true);
    setPosition({ pan: preset.pan, tilt: preset.tilt });
    setZoom(preset.zoom);
    setFocus(preset.focus);

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
    setPosition({ pan: preset.pan, tilt: preset.tilt });
    setZoom(preset.zoom);
    setFocus(preset.focus);
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
              ایجاد preset‌های دلخواه برای کنترل دوربین چرخان
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* کنترل PTZ */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">نمای فعلی دوربین</h3>
                {isTesting && (
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
                    در حال تست
                  </span>
                )}
              </div>

              <div className="relative bg-slate-100 dark:bg-slate-800/50 rounded-xl aspect-video flex items-center justify-center border border-slate-300 dark:border-slate-600">
                <Camera className="w-20 h-20 text-slate-400 dark:text-slate-500" />
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-2 rounded-lg shadow text-sm">
                  <div>Pan: {position.pan.toFixed(1)}°</div>
                  <div>Tilt: {position.tilt.toFixed(1)}°</div>
                  <div>Zoom: {zoom}x</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5 mt-6">
                <Card className="p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <p className="text-sm font-medium text-center mb-4 text-slate-700 dark:text-slate-300">جهت</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div />
                    <Button size="icon" variant="outline" onClick={() => handleMove('up')}>
                      <ArrowUp className="w-5 h-5" />
                    </Button>
                    <div />
                    <Button size="icon" variant="outline" onClick={() => handleMove('left')}>
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={resetToHome}>
                      <Home className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => handleMove('right')}>
                      <ArrowRightIcon className="w-5 h-5" />
                    </Button>
                    <div />
                    <Button size="icon" variant="outline" onClick={() => handleMove('down')}>
                      <ArrowDown className="w-5 h-5" />
                    </Button>
                    <div />
                  </div>
                </Card>

                <Card className="p-5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <p className="text-sm font-medium text-center mb-4 text-slate-700 dark:text-slate-300">زوم و فوکوس</p>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-400">زوم</span>
                        <span className="text-slate-900 dark:text-slate-100">{zoom}x</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="outline" onClick={() => handleZoom('out')}>
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <Slider value={[zoom]} onValueChange={([v]) => setZoom(v)} min={1} max={30} step={1} />
                        <Button size="icon" variant="outline" onClick={() => handleZoom('in')}>
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-400">فوکوس</span>
                        <span className="text-slate-900 dark:text-slate-100">{focus}%</span>
                      </div>
                      <Slider value={[focus]} onValueChange={([v]) => setFocus(v)} min={0} max={100} step={5} />
                    </div>
                  </div>
                </Card>
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
                    placeholder="مثلاً: دید عریض جنوبی"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Pan</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{position.pan.toFixed(1)}°</p>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Tilt</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{position.tilt.toFixed(1)}°</p>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Zoom</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{zoom}x</p>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center">
                    <p className="text-xs text-slate-600 dark:text-slate-400">Focus</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{focus}%</p>
                  </div>
                </div>
                <Button className="w-full" onClick={savePreset}>
                  <Save className="w-4 h-4 ml-2" /> ذخیره Preset
                </Button>
              </div>
            </Card>
          </div>

          {/* لیست Presetها */}
          <div className="space-y-6">
            <Card className="p-6 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Preset‌های ذخیره‌شده</h3>
                <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded">
                  {presets.length} preset
                </span>
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {presets.length === 0 ? (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">
                    هیچ Presetی تعریف نشده است
                  </p>
                ) : (
                  presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{preset.name}</p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => deletePreset(preset.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="bg-white dark:bg-slate-900 px-2 py-1 rounded text-center">Pan: {preset.pan}°</div>
                        <div className="bg-white dark:bg-slate-900 px-2 py-1 rounded text-center">Tilt: {preset.tilt}°</div>
                        <div className="bg-white dark:bg-slate-900 px-2 py-1 rounded text-center">Zoom: {preset.zoom}x</div>
                        <div className="bg-white dark:bg-slate-900 px-2 py-1 rounded text-center">Focus: {preset.focus}%</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => testPreset(preset)}>
                          <Play className="w-3 h-3 ml-1" /> تست
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => loadPreset(preset)}
                        >
                          <Eye className="w-3 h-3 ml-1" /> بارگذاری
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <p className="font-medium">نکات:</p>
                <ul className="list-disc pr-4 space-y-1">
                  <li>هر preset یک "دید مستقل" است</li>
                  <li>در کالیبراسیون مناطق، هر preset به‌عنوان یک لایه قابل انتخاب خواهد بود</li>
                  <li>نام preset می‌تواند هر چیزی باشد</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}