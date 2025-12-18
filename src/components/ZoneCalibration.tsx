import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  ArrowRight,
  Square,
  Compass,
  AlertTriangle,
  Save,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  CheckCircle
} from 'lucide-react';
import { Mask, Intersection } from '../types';

interface ZoneCalibrationProps {
  intersection: Intersection;
  onBack: () => void;
  onComplete: () => void;
}

type CalibrationStep = 'directions' | 'violations';
type SelectedDirection = 'north' | 'south' | 'east' | 'west' | null;

export function ZoneCalibration({ intersection, onBack, onComplete }: ZoneCalibrationProps) {
  const [step, setStep] = useState<CalibrationStep>('directions');
  const [selectedDirection, setSelectedDirection] = useState<SelectedDirection>(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [masks, setMasks] = useState<Mask[]>([
    // Mock data - direction masks
    {
      id: 'dir-mask-north',
      name: 'ناحیه شمال',
      direction: 'north',
      type: 'direction',
      color: '#3b82f6',
      enabled: true,
      area: { x: 35, y: 5, width: 30, height: 40 }
    },
    {
      id: 'dir-mask-south',
      name: 'ناحیه جنوب',
      direction: 'south',
      type: 'direction',
      color: '#3b82f6',
      enabled: true,
      area: { x: 35, y: 55, width: 30, height: 40 }
    },
    // Mock data - violation zones for north
    {
      id: 'vio-mask-north-1',
      name: 'عبور از چراغ قرمز',
      direction: 'north',
      type: 'violation',
      violationType: 'red_light',
      color: '#ef4444',
      enabled: true,
      area: { x: 40, y: 40, width: 20, height: 10 }
    },
    {
      id: 'vio-mask-north-2',
      name: 'خط عابر پیاده',
      direction: 'north',
      type: 'violation',
      violationType: 'crosswalk',
      color: '#f59e0b',
      enabled: true,
      area: { x: 42, y: 30, width: 16, height: 8 }
    }
  ]);

  const [newMask, setNewMask] = useState({
    name: '',
    violationType: ''
  });

  const violationTypes = [
    { value: 'red_light', label: 'عبور از چراغ قرمز', color: '#ef4444' },
    { value: 'crosswalk', label: 'توقف در خط عابر پیاده', color: '#f59e0b' },
    { value: 'wrong_lane', label: 'تغییر خط غیرمجاز', color: '#8b5cf6' },
    { value: 'speeding', label: 'سرعت غیرمجاز', color: '#ef4444' },
    { value: 'no_parking', label: 'پارک غیرمجاز', color: '#ec4899' }
  ];

  const directions = [
    { value: 'north', label: 'شمال', icon: '↑' },
    { value: 'south', label: 'جنوب', icon: '↓' },
    { value: 'east', label: 'شرق', icon: '←' },
    { value: 'west', label: 'غرب', icon: '→' }
  ];

  const getDirectionMasks = () => masks.filter(m => m.type === 'direction');
  const getViolationMasks = (dir: SelectedDirection) => 
    masks.filter(m => m.type === 'violation' && m.direction === dir);

  const toggleMask = (id: string) => {
    setMasks(masks.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const deleteMask = (id: string) => {
    setMasks(masks.filter(m => m.id !== id));
  };

  const directionMasks = getDirectionMasks();
  const currentViolationMasks = selectedDirection ? getViolationMasks(selectedDirection) : [];
  const directionLabel = directions.find(d => d.value === selectedDirection)?.label;

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                کالیبراسیون مناطق تخلف
              </h1>
              <p className="text-gray-600 mt-1">
                {intersection.name}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(step === 'directions' ? 'violations' : 'directions')}>
              تغییر مرحله
            </Button>
            <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={onComplete}>
              <Save className="w-4 h-4" />
              ذخیره و اتمام
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all ${
                step === 'directions' 
                  ? 'bg-blue-500 text-white shadow-lg scale-105' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step === 'directions' ? 'bg-white text-blue-500' : 'bg-gray-300 text-gray-600'
                }`}>
                  1
                </div>
                <div>
                  <p className="font-bold">مرحله اول</p>
                  <p className="text-sm">ماسک‌بندی جهات چهارراه</p>
                </div>
              </div>

              <ChevronRight className="w-6 h-6 text-gray-400" />

              <div className={`flex items-center gap-3 px-6 py-3 rounded-lg transition-all ${
                step === 'violations' 
                  ? 'bg-blue-500 text-white shadow-lg scale-105' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step === 'violations' ? 'bg-white text-blue-500' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <div>
                  <p className="font-bold">مرحله دوم</p>
                  <p className="text-sm">تعریف مناطق تخلف</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Direction Masks */}
        {step === 'directions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>ترسیم ماسک جهات</CardTitle>
                    <Button
                      variant={drawingMode ? 'default' : 'outline'}
                      size="sm"
                      className="gap-2"
                      onClick={() => setDrawingMode(!drawingMode)}
                    >
                      <Square className="w-4 h-4" />
                      {drawingMode ? 'حالت ترسیم فعال' : 'شروع ترسیم'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                    <img 
                      src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80" 
                      alt="Camera View"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Grid Overlay */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>

                    {/* Direction Masks */}
                    {directionMasks.map(mask => mask.enabled && (
                      <div
                        key={mask.id}
                        className="absolute border-2 backdrop-blur-sm cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          left: `${mask.area.x}%`,
                          top: `${mask.area.y}%`,
                          width: `${mask.area.width}%`,
                          height: `${mask.area.height}%`,
                          borderColor: mask.color,
                          backgroundColor: `${mask.color}40`
                        }}
                      >
                        <div 
                          className="absolute top-2 right-2 px-3 py-1 rounded text-sm text-white font-bold"
                          style={{ backgroundColor: mask.color }}
                        >
                          {mask.name}
                        </div>
                      </div>
                    ))}

                    {drawingMode && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-lg p-4 text-center space-y-2">
                          <Square className="w-8 h-8 mx-auto text-blue-600" />
                          <p className="text-sm font-medium">کلیک و کشیدن برای ترسیم ماسک</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900 font-medium mb-2">راهنمای ماسک‌بندی جهات:</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        برای هر جهت یک ناحیه مستطیلی ترسیم کنید
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        مناطق باید کل عرض خیابان در آن جهت را پوشش دهند
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        پس از تکمیل، به مرحله دوم بروید
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>جهات تعریف شده</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {directions.map((dir) => {
                      const mask = directionMasks.find(m => m.direction === dir.value);
                      return (
                        <div
                          key={dir.value}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            mask 
                              ? 'border-green-300 bg-green-50' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{dir.icon}</span>
                              <span className="font-medium">{dir.label}</span>
                            </div>
                            {mask ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-orange-500" />
                            )}
                          </div>
                          {mask && (
                            <div className="flex gap-1 mt-2">
                              <button
                                onClick={() => toggleMask(mask.id)}
                                className="flex-1 px-2 py-1 text-xs bg-white rounded hover:bg-gray-100 transition-colors"
                              >
                                {mask.enabled ? <Eye className="w-3 h-3 inline ml-1" /> : <EyeOff className="w-3 h-3 inline ml-1" />}
                                {mask.enabled ? 'مخفی' : 'نمایش'}
                              </button>
                              <button
                                onClick={() => deleteMask(mask.id)}
                                className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          {!mask && (
                            <Button size="sm" className="w-full mt-2 gap-2" variant="outline">
                              <Plus className="w-3 h-3" />
                              افزودن ماسک
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button
                      className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                      onClick={() => setStep('violations')}
                      disabled={directionMasks.length < 4}
                    >
                      <ChevronRight className="w-4 h-4" />
                      مرحله بعد: تعریف مناطق تخلف
                    </Button>
                    {directionMasks.length < 4 && (
                      <p className="text-xs text-orange-600 mt-2 text-center">
                        ابتدا هر ۴ جهت را ماسک‌بندی کنید
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Violation Zones */}
        {step === 'violations' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Direction Selector */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Label className="text-sm font-medium">انتخاب جهت:</Label>
                    <div className="flex gap-2 flex-1">
                      {directions.map((dir) => (
                        <Button
                          key={dir.value}
                          variant={selectedDirection === dir.value ? 'default' : 'outline'}
                          className="flex-1 gap-2"
                          onClick={() => setSelectedDirection(dir.value as SelectedDirection)}
                        >
                          <span className="text-lg">{dir.icon}</span>
                          {dir.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedDirection && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>مناطق تخلف - جهت {directionLabel}</CardTitle>
                      <Button
                        variant={drawingMode ? 'default' : 'outline'}
                        size="sm"
                        className="gap-2"
                        onClick={() => setDrawingMode(!drawingMode)}
                      >
                        <Square className="w-4 h-4" />
                        {drawingMode ? 'حالت ترسیم فعال' : 'ترسیم منطقه جدید'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                      <img 
                        src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80" 
                        alt="Camera View"
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Grid */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                        <defs>
                          <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid2)" />
                      </svg>

                      {/* Direction Mask (semi-transparent) */}
                      {directionMasks.filter(m => m.direction === selectedDirection && m.enabled).map(mask => (
                        <div
                          key={mask.id}
                          className="absolute border backdrop-blur-sm pointer-events-none"
                          style={{
                            left: `${mask.area.x}%`,
                            top: `${mask.area.y}%`,
                            width: `${mask.area.width}%`,
                            height: `${mask.area.height}%`,
                            borderColor: mask.color,
                            backgroundColor: `${mask.color}20`
                          }}
                        />
                      ))}

                      {/* Violation Masks */}
                      {currentViolationMasks.map(mask => mask.enabled && (
                        <div
                          key={mask.id}
                          className="absolute border-2 backdrop-blur-sm cursor-pointer hover:opacity-80 transition-opacity"
                          style={{
                            left: `${mask.area.x}%`,
                            top: `${mask.area.y}%`,
                            width: `${mask.area.width}%`,
                            height: `${mask.area.height}%`,
                            borderColor: mask.color,
                            backgroundColor: `${mask.color}50`
                          }}
                        >
                          <div 
                            className="absolute top-1 right-1 px-2 py-1 rounded text-xs text-white font-bold"
                            style={{ backgroundColor: mask.color }}
                          >
                            {mask.name}
                          </div>
                        </div>
                      ))}

                      {drawingMode && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                          <div className="bg-white rounded-lg p-4 text-center space-y-2">
                            <AlertTriangle className="w-8 h-8 mx-auto text-orange-600" />
                            <p className="text-sm font-medium">کلیک و کشیدن برای ترسیم منطقه تخلف</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Drawing Form */}
                    {drawingMode && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm">نوع تخلف</Label>
                            <Select
                              value={newMask.violationType}
                              onValueChange={(val) => setNewMask({ ...newMask, violationType: val })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="انتخاب کنید" />
                              </SelectTrigger>
                              <SelectContent>
                                {violationTypes.map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                                      {type.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm">نام منطقه</Label>
                            <Input
                              className="mt-1"
                              value={newMask.name}
                              onChange={(e) => setNewMask({ ...newMask, name: e.target.value })}
                              placeholder="مثال: منطقه چراغ قرمز"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {!selectedDirection && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Compass className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">یک جهت را برای تعریف مناطق تخلف انتخاب کنید</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedDirection ? `مناطق ${directionLabel}` : 'مناطق تخلف'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDirection ? (
                    <div className="space-y-3">
                      {currentViolationMasks.map((mask) => (
                        <div
                          key={mask.id}
                          className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: mask.color }}
                              />
                              <span className="text-sm font-medium">{mask.name}</span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => toggleMask(mask.id)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                {mask.enabled ? 
                                  <Eye className="w-4 h-4 text-blue-600" /> : 
                                  <EyeOff className="w-4 h-4 text-gray-400" />
                                }
                              </button>
                              <button
                                onClick={() => deleteMask(mask.id)}
                                className="p-1 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600">
                            {violationTypes.find(t => t.value === mask.violationType)?.label}
                          </div>
                        </div>
                      ))}

                      {currentViolationMasks.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">هیچ منطقه‌ای تعریف نشده</p>
                        </div>
                      )}

                      <Button 
                        className="w-full gap-2 mt-4" 
                        variant="outline"
                        onClick={() => setDrawingMode(true)}
                      >
                        <Plus className="w-4 h-4" />
                        افزودن منطقه جدید
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">ابتدا یک جهت انتخاب کنید</p>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>جهات تکمیل شده:</span>
                      <span className="font-medium">
                        {directions.filter(d => 
                          getViolationMasks(d.value as SelectedDirection).length > 0
                        ).length}/4
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>کل مناطق تخلف:</span>
                      <span className="font-medium">
                        {masks.filter(m => m.type === 'violation').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
