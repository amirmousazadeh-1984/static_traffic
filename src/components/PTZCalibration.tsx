// components/PTZCalibration.tsx

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { 
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight as ArrowRightIcon,
  ZoomIn,
  ZoomOut,
  Save,
  Camera,
  CheckCircle,
  Home,
  Play,
  Eye,
  Trash2
} from 'lucide-react';
import { PTZPreset, Intersection } from '../types';
import { mockPTZPresets } from '../data/mockDatabase';
import { toast } from 'sonner';

interface PTZCalibrationProps {
  intersection: Intersection;
}

type SelectedDirection = 'north' | 'south' | 'east' | 'west';

export function PTZCalibration({ intersection }: PTZCalibrationProps) {
  const [selectedDirection, setSelectedDirection] = useState<SelectedDirection>('north');
  const [position, setPosition] = useState({ pan: 0, tilt: 0 });
  const [zoom, setZoom] = useState(8);
  const [focus, setFocus] = useState(60);
  const [presetName, setPresetName] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const [presets, setPresets] = useState<PTZPreset[]>(mockPTZPresets[intersection.id] || []);

  const directions = [
    { value: 'north' as const, label: 'شمال', icon: '↑', defaultPan: 0 },
    { value: 'south' as const, label: 'جنوب', icon: '↓', defaultPan: 180 },
    { value: 'east' as const, label: 'شرق', icon: '←', defaultPan: 90 },
    { value: 'west' as const, label: 'غرب', icon: '→', defaultPan: 270 }
  ];

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

  const goToDirection = (dir: SelectedDirection) => {
    setSelectedDirection(dir);
    const directionData = directions.find(d => d.value === dir);
    if (directionData) {
      const existingPreset = presets.find(p => p.direction === dir);
      if (existingPreset) {
        setPosition({ pan: existingPreset.pan, tilt: existingPreset.tilt });
        setZoom(existingPreset.zoom);
        setFocus(existingPreset.focus);
        setPresetName(existingPreset.name);
      } else {
        setPosition({ pan: directionData.defaultPan, tilt: 10 });
        setZoom(8);
        setFocus(60);
        setPresetName('');
      }
    }
  };

  const savePreset = () => {
    const name = presetName || `پیش‌فرض ${directions.find(d => d.value === selectedDirection)?.label}`;

    const existingIndex = presets.findIndex(p => p.direction === selectedDirection);
    if (existingIndex >= 0) {
      const updated = [...presets];
      updated[existingIndex] = {
        ...updated[existingIndex],
        name,
        pan: position.pan,
        tilt: position.tilt,
        zoom,
        focus
      };
      setPresets(updated);
      toast.success('Preset بروزرسانی شد');
    } else {
      const newPreset: PTZPreset = {
        id: `preset-${selectedDirection}-${Date.now()}`,
        name,
        direction: selectedDirection,
        pan: position.pan,
        tilt: position.tilt,
        zoom,
        focus
      };
      setPresets([...presets, newPreset]);
      toast.success('Preset جدید ذخیره شد');
    }
  };

  const testPreset = (preset: PTZPreset) => {
    setIsTesting(true);
    setSelectedDirection(preset.direction);
    setPosition({ pan: preset.pan, tilt: preset.tilt });
    setZoom(preset.zoom);
    setFocus(preset.focus);

    setTimeout(() => {
      setIsTesting(false);
      toast.success('تست Preset تکمیل شد');
    }, 2500);
  };

  const deletePreset = (id: string) => {
    setPresets(presets.filter(p => p.id !== id));
    toast.success('Preset حذف شد');
  };

  const currentPreset = presets.find(p => p.direction === selectedDirection);
  const completedDirections = [...new Set(presets.map(p => p.direction))].length;
  const directionLabel = directions.find(d => d.value === selectedDirection)?.label;

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50">
      <div className="max-w-[1800px] mx-auto px-6 py-8">

        {/* هدر مینیمال */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">کالیبراسیون PTZ — {intersection.name}</h2>
            <p className="text-sm text-slate-600 mt-1">تنظیم جهت و زوم برای هر چهارراه</p>
          </div>
          <Button
            className="gap-2"
            onClick={() => {
              mockPTZPresets[intersection.id] = presets;
              toast.success('تمام Presetها ذخیره شدند');
            }}
          >
            <Save className="w-4 h-4" />
            ذخیره نهایی
          </Button>
        </div>

        {/* پیشرفت */}
        <Card className="p-5 border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">پیشرفت کالیبراسیون</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{completedDirections} از ۴ جهت</p>
            </div>
            <div className="flex gap-3">
              {directions.map((dir) => {
                const hasPreset = presets.some(p => p.direction === dir.value);
                return (
                  <div
                    key={dir.value}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold border-2 ${
                      hasPreset 
                        ? 'bg-green-100 border-green-300 text-green-700' 
                        : 'bg-slate-100 border-slate-300 text-slate-500'
                    }`}
                  >
                    {hasPreset ? <CheckCircle className="w-6 h-6" /> : dir.icon}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ستون چپ - کنترل‌ها و پیش‌نمایش */}
          <div className="lg:col-span-2 space-y-6">

            {/* انتخاب جهت */}
            <Card className="p-5 border border-slate-200 shadow-sm">
              <Label className="text-sm font-medium mb-3 block">جهت فعلی</Label>
              <div className="grid grid-cols-4 gap-3">
                {directions.map((dir) => {
                  const hasPreset = presets.some(p => p.direction === dir.value);
                  return (
                    <Button
                      key={dir.value}
                      variant={selectedDirection === dir.value ? 'default' : 'outline'}
                      size="lg"
                      className="h-20 flex flex-col gap-1"
                      onClick={() => goToDirection(dir.value)}
                    >
                      <span className="text-2xl">{dir.icon}</span>
                      <span className="text-xs">{dir.label}</span>
                      {hasPreset && <CheckCircle className="w-4 h-4 text-green-600" />}
                    </Button>
                  );
                })}
              </div>
            </Card>

            {/* پیش‌نمایش PTZ */}
            <Card className="p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900">نمای PTZ — {directionLabel}</h3>
                {isTesting && <Badge className="bg-green-100 text-green-800">در حال تست</Badge>}
              </div>

              <div className="relative bg-slate-100 rounded-xl aspect-video flex items-center justify-center border border-slate-300">
                <Camera className="w-20 h-20 text-slate-400" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow text-sm">
                  <div>Pan: {position.pan}°</div>
                  <div>Tilt: {position.tilt}°</div>
                  <div>Zoom: {zoom}x</div>
                </div>
              </div>

              {/* کنترل‌های PTZ */}
              <div className="grid grid-cols-2 gap-5 mt-6">
                <Card className="p-5 border border-slate-200">
                  <p className="text-sm font-medium text-center mb-4">جهت</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div />
                    <Button size="icon" variant="outline" onClick={() => handleMove('up')}>
                      <ArrowUp className="w-5 h-5" />
                    </Button>
                    <div />
                    <Button size="icon" variant="outline" onClick={() => handleMove('left')}>
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => {
                      const dir = directions.find(d => d.value === selectedDirection);
                      if (dir) setPosition({ pan: dir.defaultPan, tilt: 10 });
                    }}>
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

                <Card className="p-5 border border-slate-200">
                  <p className="text-sm font-medium text-center mb-4">زوم و فوکوس</p>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>زوم</span>
                        <span>{zoom}x</span>
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
                        <span>فوکوس</span>
                        <span>{focus}%</span>
                      </div>
                      <Slider value={[focus]} onValueChange={([v]) => setFocus(v)} min={0} max={100} step={5} />
                    </div>
                  </div>
                </Card>
              </div>
            </Card>

            {/* ذخیره Preset */}
            <Card className="p-6 border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-4">ذخیره Preset برای {directionLabel}</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">نام Preset (اختیاری)</Label>
                  <Input
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder={`پیش‌فرض ${directionLabel}`}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <p className="text-xs text-slate-600">Pan</p>
                    <p className="font-bold">{position.pan}°</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <p className="text-xs text-slate-600">Tilt</p>
                    <p className="font-bold">{position.tilt}°</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <p className="text-xs text-slate-600">Zoom</p>
                    <p className="font-bold">{zoom}x</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <p className="text-xs text-slate-600">Focus</p>
                    <p className="font-bold">{focus}%</p>
                  </div>
                </div>
                <Button className="w-full" onClick={savePreset}>
                  <Save className="w-4 h-4 ml-2" />
                  {currentPreset ? 'بروزرسانی Preset' : 'ذخیره Preset جدید'}
                </Button>
              </div>
            </Card>
          </div>

          {/* ستون راست - لیست Presetها */}
          <div className="space-y-6">
            <Card className="p-6 border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 mb-5">Presetهای ذخیره شده</h3>
              <div className="space-y-4">
                {presets.length === 0 ? (
                  <p className="text-center text-slate-500 py-8 text-sm">هیچ Preset ذخیره نشده</p>
                ) : (
                  presets.map((preset) => {
                    const dir = directions.find(d => d.value === preset.direction);
                    return (
                      <div
                        key={preset.id}
                        className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{dir?.icon}</span>
                            <div>
                              <p className="font-medium text-sm">{preset.name}</p>
                              <p className="text-xs text-slate-600">{dir?.label}</p>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => deletePreset(preset.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div className="bg-white px-3 py-1 rounded">Pan: {preset.pan}°</div>
                          <div className="bg-white px-3 py-1 rounded">Tilt: {preset.tilt}°</div>
                          <div className="bg-white px-3 py-1 rounded">Zoom: {preset.zoom}x</div>
                          <div className="bg-white px-3 py-1 rounded">Focus: {preset.focus}%</div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => testPreset(preset)}>
                            <Play className="w-3 h-3 ml-1" />
                            تست
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-xs"
                            onClick={() => {
                              setSelectedDirection(preset.direction);
                              setPosition({ pan: preset.pan, tilt: preset.tilt });
                              setZoom(preset.zoom);
                              setFocus(preset.focus);
                              setPresetName(preset.name);
                            }}
                          >
                            <Eye className="w-3 h-3 ml-1" />
                            ویرایش
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-slate-200 text-xs text-slate-600 space-y-2">
                <p className="font-medium">راهنما:</p>
                <ul className="space-y-1">
                  <li>• برای هر جهت یک Preset تنظیم کنید</li>
                  <li>• زوم مناسب برای شناسایی پلاک انتخاب کنید</li>
                  <li>• پس از تشخیص تخلف، PTZ به Preset می‌رود</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}