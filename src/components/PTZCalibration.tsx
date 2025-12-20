import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
  Compass,
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
  const [zoom, setZoom] = useState(1);
  const [focus, setFocus] = useState(50);
  const [presetName, setPresetName] = useState('');
  const [isLivePreview, setIsLivePreview] = useState(false);

  // بارگذاری preset های موجود از دیتابیس
  const [presets, setPresets] = useState<PTZPreset[]>(mockPTZPresets[intersection.id] || []);

  const directions = [
    { value: 'north' as const, label: 'شمال', icon: '↑', defaultPan: 0 },
    { value: 'south' as const, label: 'جنوب', icon: '↓', defaultPan: 180 },
    { value: 'east' as const, label: 'شرق', icon: '←', defaultPan: 90 },
    { value: 'west' as const, label: 'غرب', icon: '→', defaultPan: 270 }
  ];

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    const step = 5;
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
      setZoom(Math.min(30, zoom + 1));
    } else {
      setZoom(Math.max(1, zoom - 1));
    }
  };

  const goToDirection = (dir: SelectedDirection) => {
    setSelectedDirection(dir);
    const directionData = directions.find(d => d.value === dir);
    if (directionData) {
      setPosition({ pan: directionData.defaultPan, tilt: 10 });
      
      // Load preset if exists
      const existingPreset = presets.find(p => p.direction === dir);
      if (existingPreset) {
        setPosition({ pan: existingPreset.pan, tilt: existingPreset.tilt });
        setZoom(existingPreset.zoom);
        setFocus(existingPreset.focus);
        setPresetName(existingPreset.name);
      } else {
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
      // Update existing
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
      // Create new
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
    setSelectedDirection(preset.direction);
    setPosition({ pan: preset.pan, tilt: preset.tilt });
    setZoom(preset.zoom);
    setFocus(preset.focus);
    setIsLivePreview(true);
    toast.info('در حال تست Preset...');
    setTimeout(() => {
      setIsLivePreview(false);
      toast.success('تست Preset تکمیل شد');
    }, 3000);
  };

  const deletePreset = (id: string) => {
    setPresets(presets.filter(p => p.id !== id));
    toast.success('Preset حذف شد');
  };

  const currentPreset = presets.find(p => p.direction === selectedDirection);
  const directionLabel = directions.find(d => d.value === selectedDirection)?.label;
  const completedDirections = [...new Set(presets.map(p => p.direction))].length;

  return (
    <div className="min-h-[calc(100vh-140px)]">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => window.history.back()}>
              <ArrowRightIcon className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                کالیبراسیون دوربین PTZ
              </h1>
              <p className="text-gray-600 mt-1">
                {intersection.name}
              </p>
            </div>
          </div>
          <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => {
            mockPTZPresets[intersection.id] = presets;
            toast.success('کالیبراسیون ذخیره شد');
          }}>
            <Save className="w-4 h-4" />
            ذخیره و اتمام
          </Button>
        </div>

        {/* Progress */}
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-900 font-medium mb-1">
                  پیشرفت کالیبراسیون
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {completedDirections}/4 جهت تکمیل شده
                </p>
              </div>
              <div className="flex gap-2">
                {directions.map((dir) => {
                  const hasPreset = presets.some(p => p.direction === dir.value);
                  return (
                    <div
                      key={dir.value}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold transition-all ${
                        hasPreset 
                          ? 'bg-green-500 text-white' 
                          : 'bg-white text-gray-400 border-2 border-gray-200'
                      }`}
                    >
                      {hasPreset ? <CheckCircle className="w-6 h-6" /> : dir.icon}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PTZ Control and Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Direction Selector */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Label className="text-sm font-medium">انتخاب جهت برای کالیبراسیون:</Label>
                  <div className="flex gap-2 flex-1">
                    {directions.map((dir) => {
                      const hasPreset = presets.some(p => p.direction === dir.value);
                      return (
                        <Button
                          key={dir.value}
                          variant={selectedDirection === dir.value ? 'default' : 'outline'}
                          className={`flex-1 gap-2 ${hasPreset ? 'border-green-500' : ''}`}
                          onClick={() => goToDirection(dir.value)}
                        >
                          {hasPreset && <CheckCircle className="w-4 h-4 text-green-500" />}
                          <span className="text-lg">{dir.icon}</span>
                          {dir.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Camera Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>نمای زنده - جهت {directionLabel}</CardTitle>
                  {isLivePreview && (
                    <Badge className="bg-green-500 animate-pulse">
                      در حال تست Preset
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                  <img 
                    src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80" 
                    alt="PTZ Camera View"
                    className="w-full h-full object-cover transition-transform duration-500"
                    style={{
                      transform: `scale(${1 + (zoom - 1) * 0.05})`
                    }}
                  />
                  
                  {/* Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative">
                      <div className="w-20 h-20 border-2 border-purple-500 rounded-full opacity-50"></div>
                      <div className="absolute top-1/2 left-1/2 w-10 h-px bg-purple-500 -translate-x-1/2"></div>
                      <div className="absolute top-1/2 left-1/2 w-px h-10 bg-purple-500 -translate-y-1/2"></div>
                    </div>
                  </div>

                  {/* Camera Info */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between">
                    <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-xs space-y-1">
                      <div>Pan: {position.pan.toFixed(0)}°</div>
                      <div>Tilt: {position.tilt.toFixed(0)}°</div>
                      <div>Zoom: {zoom}x</div>
                      <div>Focus: {focus}%</div>
                    </div>
                    <div className="bg-purple-500/90 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm font-bold">
                      {directionLabel}
                    </div>
                  </div>

                  {currentPreset && (
                    <div className="absolute bottom-4 left-4 bg-green-500/90 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-xs">
                      <CheckCircle className="w-3 h-3 inline ml-1" />
                      Preset ذخیره شده: {currentPreset.name}
                    </div>
                  )}
                </div>

                {/* PTZ Controls */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {/* Pan/Tilt Control */}
                  <Card className="bg-gray-50">
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium mb-3 text-center">کنترل جهت</p>
                      <div className="space-y-2">
                        <div className="flex justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-12 h-12"
                            onClick={() => handleMove('up')}
                          >
                            <ArrowUp className="w-5 h-5" />
                          </Button>
                        </div>
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-12 h-12"
                            onClick={() => handleMove('left')}
                          >
                            <ArrowLeft className="w-5 h-5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-12 h-12"
                            onClick={() => {
                              const dir = directions.find(d => d.value === selectedDirection);
                              if (dir) setPosition({ pan: dir.defaultPan, tilt: 10 });
                            }}
                          >
                            <Home className="w-5 h-5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-12 h-12"
                            onClick={() => handleMove('right')}
                          >
                            <ArrowRightIcon className="w-5 h-5" />
                          </Button>
                        </div>
                        <div className="flex justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-12 h-12"
                            onClick={() => handleMove('down')}
                          >
                            <ArrowDown className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Zoom Control */}
                  <Card className="bg-gray-50">
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium mb-3">کنترل زوم</p>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 gap-2"
                            onClick={() => handleZoom('out')}
                          >
                            <ZoomOut className="w-4 h-4" />
                            -
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 gap-2"
                            onClick={() => handleZoom('in')}
                          >
                            <ZoomIn className="w-4 h-4" />
                            +
                          </Button>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>زوم</span>
                            <span>{zoom}x</span>
                          </div>
                          <Slider
                            value={[zoom]}
                            onValueChange={([val]) => setZoom(val)}
                            min={1}
                            max={30}
                            step={1}
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>فکوس</span>
                            <span>{focus}%</span>
                          </div>
                          <Slider
                            value={[focus]}
                            onValueChange={([val]) => setFocus(val)}
                            min={0}
                            max={100}
                            step={1}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Save Preset */}
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  ذخیره Preset برای جهت {directionLabel}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">نام Preset</Label>
                    <Input
                      className="mt-2"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder={`پیش‌فرض ${directionLabel}`}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-gray-600 text-xs mb-1">Pan</p>
                      <p className="font-bold">{position.pan}°</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-gray-600 text-xs mb-1">Tilt</p>
                      <p className="font-bold">{position.tilt}°</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-gray-600 text-xs mb-1">Zoom</p>
                      <p className="font-bold">{zoom}x</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-gray-600 text-xs mb-1">Focus</p>
                      <p className="font-bold">{focus}%</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full gap-2 bg-purple-600 hover:bg-purple-700" 
                    onClick={savePreset}
                  >
                    <Save className="w-4 h-4" />
                    {currentPreset ? 'بروزرسانی Preset' : 'ذخیره Preset جدید'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Presets List */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="w-5 h-5" />
                  Preset‌های ذخیره شده
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {presets.map((preset) => {
                    const dir = directions.find(d => d.value === preset.direction);
                    return (
                      <div
                        key={preset.id}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{dir?.icon}</span>
                            <div>
                              <p className="font-medium text-sm">{preset.name}</p>
                              <p className="text-xs text-gray-500">{dir?.label}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => deletePreset(preset.id)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          <div className="bg-white px-2 py-1 rounded">
                            <span className="text-gray-600">Pan:</span> {preset.pan}°
                          </div>
                          <div className="bg-white px-2 py-1 rounded">
                            <span className="text-gray-600">Tilt:</span> {preset.tilt}°
                          </div>
                          <div className="bg-white px-2 py-1 rounded">
                            <span className="text-gray-600">Zoom:</span> {preset.zoom}x
                          </div>
                          <div className="bg-white px-2 py-1 rounded">
                            <span className="text-gray-600">Focus:</span> {preset.focus}%
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1"
                            onClick={() => testPreset(preset)}
                          >
                            <Play className="w-3 h-3" />
                            تست
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1"
                            onClick={() => {
                              setSelectedDirection(preset.direction);
                              setPosition({ pan: preset.pan, tilt: preset.tilt });
                              setZoom(preset.zoom);
                              setFocus(preset.focus);
                              setPresetName(preset.name);
                            }}
                          >
                            <Eye className="w-3 h-3" />
                            ویرایش
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {presets.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Camera className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">هیچ Preset ای ذخیره نشده</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-xs text-gray-600 space-y-2 mb-4">
                    <p className="font-medium">راهنما:</p>
                    <ul className="space-y-1">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1"></div>
                        <span>برای هر جهت یک Preset تعریف کنید</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1"></div>
                        <span>زوم و فوکوس را برای بهترین کیفیت تنظیم کنید</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1"></div>
                        <span>Preset‌ها پس از تشخیص تخلف فراخوانی می‌شوند</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}