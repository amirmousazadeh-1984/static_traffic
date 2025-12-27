// src/components/ZoneCalibration.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Intersection } from '../types';
import { mockMasks } from '../data/mockDatabase';
import {
  Square,
  Pentagon,
  MousePointer2,
  Trash2,
  Save,
  ZoomIn,
  ZoomOut,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface ZoneCalibrationProps {
  intersection: Intersection;
  onChangeTab?: (tab: string) => void;
}

type DrawingTool = 'select' | 'rectangle' | 'polygon';
type CalibrationStep = 'direction' | 'violation';

interface Point {
  x: number;
  y: number;
}

interface Shape {
  id: string;
  type: 'rectangle' | 'polygon';
  points: Point[];
  color: string;
  name: string;
  direction?: 'north' | 'south' | 'east' | 'west';
  violationType?: string;
  layer: 'direction' | 'violation';
}

export function ZoneCalibration({ intersection, onChangeTab }: ZoneCalibrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // لیست mock تخلفات — ⚠️ باید به Redux یا API واقعی جایگزین شود
  const [violationTypes, setViolationTypes] = useState<
    { id: string; name: string; color: string }[]
  >([
    { id: '1', name: 'عبور از چراغ قرمز', color: '#ef4444' },
    { id: '2', name: 'تجاوز به خط عابر', color: '#f97316' },
    { id: '3', name: 'سرعت غیرمجاز', color: '#8b5cf6' },
    { id: '4', name: 'تغییر خط ممنوع', color: '#ec4899' },
    { id: '5', name: 'پارک ممنوع', color: '#10b981' },
  ]);

  const [selectedDirection, setSelectedDirection] = useState<'north' | 'south' | 'east' | 'west'>('north');
  const [calibrationStep, setCalibrationStep] = useState<CalibrationStep>('direction');
  const [activeTool, setActiveTool] = useState<DrawingTool>('select');
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [zoom, setZoom] = useState(1);
  const [showDirectionMasks, setShowDirectionMasks] = useState(true);
  const [showViolationMasks, setShowViolationMasks] = useState(true);
  const [selectedViolationType, setSelectedViolationType] = useState<string>(
    violationTypes[0]?.id || ''
  );

  // بارگذاری ماسک‌های موجود از mock
  useEffect(() => {
    const existingMasks = mockMasks[intersection.id] || [];
    const loadedShapes: Shape[] = existingMasks.map((mask) => ({
      id: mask.id,
      type: 'rectangle',
      points: [
        { x: mask.area.x, y: mask.area.y },
        { x: mask.area.x + mask.area.width, y: mask.area.y + mask.area.height },
      ],
      color: mask.color,
      name: mask.name,
      direction: mask.direction,
      violationType: mask.violationType,
      layer: mask.type === 'direction' ? 'direction' : 'violation',
    }));
    setShapes(loadedShapes);
  }, [intersection.id]);

  // همگام‌سازی selectedViolationType با لیست
  useEffect(() => {
    if (violationTypes.length > 0 && !violationTypes.find((v) => v.id === selectedViolationType)) {
      setSelectedViolationType(violationTypes[0].id);
    }
  }, [violationTypes, selectedViolationType]);

  // رسم روی کانواس
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // شبکه
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // رسم شکل‌ها
    shapes.forEach((shape) => {
      const shouldShow =
        shape.direction === selectedDirection &&
        ((shape.layer === 'direction' && showDirectionMasks) ||
          (shape.layer === 'violation' && showViolationMasks));

      if (!shouldShow) return;

      ctx.save();
      ctx.scale(zoom, zoom);

      if (shape.type === 'rectangle' && shape.points.length === 2) {
        const [start, end] = shape.points;
        const width = end.x - start.x;
        const height = end.y - start.y;

        ctx.fillStyle = shape.color + '40';
        ctx.fillRect(start.x, start.y, width, height);

        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.id === selectedShape ? 3 : 2;
        ctx.setLineDash(shape.id === selectedShape ? [6, 4] : []);
        ctx.strokeRect(start.x, start.y, width, height);

        ctx.fillStyle = shape.color;
        ctx.font = '14px Vazirmatn, sans-serif';
        ctx.textAlign = 'start';
        ctx.textBaseline = 'top';
        ctx.fillText(shape.name, start.x + 8, start.y + 8);
      }

      ctx.restore();
    });

    // پیش‌نمایش
    if (isDrawing && currentPoints.length > 0) {
      ctx.save();
      ctx.scale(zoom, zoom);

      const color =
        calibrationStep === 'direction'
          ? '#3b82f6'
          : violationTypes.find((v) => v.id === selectedViolationType)?.color || '#ef4444';

      if (activeTool === 'rectangle' && currentPoints.length === 1) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(currentPoints[0].x, currentPoints[0].y, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }, [
    shapes,
    selectedShape,
    zoom,
    selectedDirection,
    showDirectionMasks,
    showViolationMasks,
    isDrawing,
    currentPoints,
    calibrationStep,
    selectedViolationType,
    violationTypes,
    activeTool,
  ]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (activeTool === 'select') {
      const clicked = shapes.find((s) => {
        if (s.type === 'rectangle' && s.points.length === 2) {
          const [start, end] = s.points;
          return (
            x >= Math.min(start.x, end.x) &&
            x <= Math.max(start.x, end.x) &&
            y >= Math.min(start.y, end.y) &&
            y <= Math.max(start.y, end.y)
          );
        }
        return false;
      });
      setSelectedShape(clicked?.id || null);
    } else if (activeTool === 'rectangle') {
      if (!isDrawing) {
        setIsDrawing(true);
        setCurrentPoints([{ x, y }]);
      } else {
        const color =
          calibrationStep === 'direction'
            ? '#3b82f6'
            : violationTypes.find((v) => v.id === selectedViolationType)?.color || '#ef4444';

        const violationName =
          violationTypes.find((v) => v.id === selectedViolationType)?.name || 'تخلف';

        const newShape: Shape = {
          id: `shape-${Date.now()}`,
          type: 'rectangle',
          points: [currentPoints[0], { x, y }],
          color,
          name:
            calibrationStep === 'direction'
              ? `منطقه ${selectedDirection}`
              : violationName,
          direction: selectedDirection,
          violationType: calibrationStep === 'violation' ? selectedViolationType : undefined,
          layer: calibrationStep,
        };

        setShapes([...shapes, newShape]);
        setIsDrawing(false);
        setCurrentPoints([]);
        toast.success('منطقه جدید اضافه شد');
      }
    }
  };

  const deleteSelectedShape = () => {
    if (!selectedShape) return;
    setShapes(shapes.filter((s) => s.id !== selectedShape));
    setSelectedShape(null);
    toast.success('منطقه حذف شد');
  };

  const directionShapes = shapes.filter(
    (s) => s.layer === 'direction' && s.direction === selectedDirection
  );
  const violationShapes = shapes.filter(
    (s) => s.layer === 'violation' && s.direction === selectedDirection
  );

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 dark:bg-slate-900">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ستون ابزارها */}
          <div className="space-y-6">
            {/* جهت */}
            <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <Label className="text-sm font-medium mb-3 block text-slate-900 dark:text-slate-100">
                جهت
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {(['north', 'south', 'east', 'west'] as const).map((dir) => (
                  <Button
                    key={dir}
                    variant={selectedDirection === dir ? 'default' : 'outline'}
                    size="sm"
                    className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={() => setSelectedDirection(dir)}
                  >
                    {dir === 'north'
                      ? 'شمال'
                      : dir === 'south'
                      ? 'جنوب'
                      : dir === 'east'
                      ? 'شرق'
                      : 'غرب'}
                  </Button>
                ))}
              </div>
            </Card>

            {/* مرحله کالیبراسیون */}
            <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <Label className="text-sm font-medium mb-3 block text-slate-900 dark:text-slate-100">
                مرحله
              </Label>
              <Tabs
                value={calibrationStep}
                onValueChange={(v) => setCalibrationStep(v as CalibrationStep)}
              >
                <TabsList className="grid w-full grid-cols-2 bg-transparent">
                  <TabsTrigger
                    value="direction"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
                  >
                    منطقه اصلی
                  </TabsTrigger>
                  <TabsTrigger
                    value="violation"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
                  >
                    مناطق تخلف
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {calibrationStep === 'violation' && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-xs text-slate-700 dark:text-slate-300">نوع تخلف</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs"
                      onClick={() => onChangeTab?.('violations')}
                    >
                      <Plus className="w-3 h-3" />
                      تخلف جدید
                    </Button>
                  </div>

                  {violationTypes.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                      هنوز هیچ تخلفی تعریف نشده.
                    </p>
                  ) : (
                    violationTypes.map((vType) => (
                      <Button
                        key={vType.id}
                        variant={selectedViolationType === vType.id ? 'default' : 'outline'}
                        size="sm"
                        className="w-full justify-start text-xs"
                        style={{
                          backgroundColor:
                            selectedViolationType === vType.id ? vType.color + '20' : undefined,
                          borderColor: vType.color,
                          color: selectedViolationType === vType.id ? vType.color : undefined,
                        }}
                        onClick={() => setSelectedViolationType(vType.id)}
                      >
                        <div
                          className="w-3 h-3 rounded-full ml-2"
                          style={{ backgroundColor: vType.color }}
                        />
                        {vType.name}
                      </Button>
                    ))
                  )}
                </div>
              )}
            </Card>

            {/* ابزارهای رسم */}
            <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <Label className="text-sm font-medium mb-3 block text-slate-900 dark:text-slate-100">
                ابزار رسم
              </Label>
              <div className="space-y-2">
                <Button
                  variant={activeTool === 'select' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTool('select')}
                >
                  <MousePointer2 className="w-4 h-4 ml-2" /> انتخاب
                </Button>
                <Button
                  variant={activeTool === 'rectangle' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTool('rectangle')}
                >
                  <Square className="w-4 h-4 ml-2" /> مستطیل
                </Button>
              </div>
            </Card>

            {/* نمایش و زوم */}
            <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <Label className="text-sm font-medium mb-3 block text-slate-900 dark:text-slate-100">
                نمایش
              </Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-slate-700 dark:text-slate-300">
                    منطقه اصلی
                  </Label>
                  <Switch
                    checked={showDirectionMasks}
                    onCheckedChange={setShowDirectionMasks}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-slate-700 dark:text-slate-300">
                    مناطق تخلف
                  </Label>
                  <Switch
                    checked={showViolationMasks}
                    onCheckedChange={setShowViolationMasks}
                    className="data-[state=checked]:bg-red-600"
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Label className="text-xs mb-2 block text-slate-700 dark:text-slate-300">
                  بزرگنمایی {zoom.toFixed(1)}x
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Slider
                    value={[zoom]}
                    onValueChange={([v]) => setZoom(v)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* عملیات */}
            <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <div className="space-y-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  disabled={!selectedShape}
                  onClick={deleteSelectedShape}
                >
                  <Trash2 className="w-4 h-4 ml-2" /> حذف منطقه
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => toast.success('کالیبراسیون ذخیره شد')}
                >
                  <Save className="w-4 h-4 ml-2" /> ذخیره کالیبراسیون
                </Button>
              </div>
            </Card>

            {/* لیست مناطق */}
            <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <Label className="text-sm font-medium mb-3 block text-slate-900 dark:text-slate-100">
                مناطق تعریف شده ({directionShapes.length + violationShapes.length})
              </Label>
              <div className="space-y-2 text-xs max-h-96 overflow-y-auto">
                {[...directionShapes, ...violationShapes].map((s) => (
                  <div
                    key={s.id}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedShape === s.id ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-slate-100 dark:bg-slate-700'
                    }`}
                    onClick={() => setSelectedShape(s.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-slate-900 dark:text-slate-100">{s.name}</span>
                    </div>
                  </div>
                ))}
                {directionShapes.length + violationShapes.length === 0 && (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">
                    هنوز منطقه‌ای تعریف نشده
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* کانواس */}
          <div className="lg:col-span-3">
            <Card className="p-6 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  کالیبراسیون — جهت{' '}
                  {selectedDirection === 'north'
                    ? 'شمال'
                    : selectedDirection === 'south'
                    ? 'جنوب'
                    : selectedDirection === 'east'
                    ? 'شرق'
                    : 'غرب'}
                </h3>
                <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-600">
                  {activeTool === 'select'
                    ? 'انتخاب'
                    : activeTool === 'rectangle'
                    ? 'مستطیل'
                    : 'چندضلعی'}
                </Badge>
              </div>

              <div className="relative bg-slate-900 rounded-xl overflow-hidden" style={{ height: '700px' }}>
                <canvas
                  ref={canvasRef}
                  width={1200}
                  height={700}
                  onClick={handleCanvasClick}
                  className="absolute inset-0 cursor-crosshair select-none"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  <strong>راهنما:</strong>{' '}
                  {activeTool === 'select' && 'روی یک منطقه کلیک کنید تا آن را انتخاب کنید'}
                  {activeTool === 'rectangle' && 'دو نقطه کلیک کنید تا مستطیل رسم شود'}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}