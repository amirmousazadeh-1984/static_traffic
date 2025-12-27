// components/ZoneCalibration.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Intersection } from '../types';
import { mockMasks, violationTypes } from '../data/mockDatabase';
import {
  Square,
  Pentagon,
  MousePointer2,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Save,
  ZoomIn,
  ZoomOut,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';

interface ZoneCalibrationProps {
  intersection: Intersection;
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

export function ZoneCalibration({ intersection }: ZoneCalibrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
  const [selectedViolationType, setSelectedViolationType] = useState('red-light');

  // بارگذاری ماسک‌های موجود
  useEffect(() => {
    const existingMasks = mockMasks[intersection.id] || [];
    const loadedShapes: Shape[] = existingMasks.map(mask => ({
      id: mask.id,
      type: 'rectangle' as const,
      points: [
        { x: mask.area.x, y: mask.area.y },
        { x: mask.area.x + mask.area.width, y: mask.area.y + mask.area.height }
      ],
      color: mask.color,
      name: mask.name,
      direction: mask.direction,
      violationType: mask.violationType,
      layer: mask.type === 'direction' ? 'direction' : 'violation'
    }));
    setShapes(loadedShapes);
  }, [intersection.id]);

  // رسم کانواس
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // پس‌زمینه مینیمال (به جای تصویر)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // شبکه مینیمال برای راهنمایی
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
    shapes.forEach(shape => {
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
        ctx.font = '14px sans-serif';
        ctx.fillText(shape.name, start.x + 8, start.y + 24);
      }

      ctx.restore();
    });

    // رسم شکل در حال کشیدن
    if (isDrawing && currentPoints.length > 0) {
      ctx.save();
      ctx.scale(zoom, zoom);

      const color = calibrationStep === 'direction' ? '#3b82f6' : 
                    violationTypes.find(v => v.id === selectedViolationType)?.color || '#ef4444';

      if (activeTool === 'rectangle' && currentPoints.length === 1) {
        // فقط نقطه شروع
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(currentPoints[0].x, currentPoints[0].y, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (activeTool === 'polygon') {
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        currentPoints.forEach(p => ctx.lineTo(p.x, p.y));

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();

        currentPoints.forEach(p => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      ctx.restore();
    }
  }, [shapes, selectedShape, zoom, selectedDirection, showDirectionMasks, showViolationMasks, isDrawing, currentPoints, calibrationStep, selectedViolationType, activeTool]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (activeTool === 'select') {
      const clicked = shapes.find(s => {
        if (s.type === 'rectangle' && s.points.length === 2) {
          const [start, end] = s.points;
          return x >= start.x && x <= end.x && y >= start.y && y <= end.y;
        }
        return false;
      });
      setSelectedShape(clicked?.id || null);
    } else if (activeTool === 'rectangle') {
      if (!isDrawing) {
        setIsDrawing(true);
        setCurrentPoints([{ x, y }]);
      } else {
        const color = calibrationStep === 'direction' ? '#3b82f6' : 
                      violationTypes.find(v => v.id === selectedViolationType)?.color || '#ef4444';

        const newShape: Shape = {
          id: `shape-${Date.now()}`,
          type: 'rectangle',
          points: [currentPoints[0], { x, y }],
          color,
          name: calibrationStep === 'direction' 
            ? `منطقه ${selectedDirection}`
            : violationTypes.find(v => v.id === selectedViolationType)?.name || 'تخلف',
          direction: selectedDirection,
          violationType: calibrationStep === 'violation' ? selectedViolationType : undefined,
          layer: calibrationStep
        };

        setShapes([...shapes, newShape]);
        setIsDrawing(false);
        setCurrentPoints([]);
        toast.success('منطقه اضافه شد');
      }
    } else if (activeTool === 'polygon') {
      if (!isDrawing) {
        setIsDrawing(true);
        setCurrentPoints([{ x, y }]);
      } else {
        setCurrentPoints([...currentPoints, { x, y }]);
      }
    }
  };

  const finishPolygon = () => {
    if (currentPoints.length < 3) {
      toast.error('حداقل ۳ نقطه نیاز است');
      return;
    }

    const color = calibrationStep === 'direction' ? '#3b82f6' : 
                  violationTypes.find(v => v.id === selectedViolationType)?.color || '#ef4444';

    const newShape: Shape = {
      id: `shape-${Date.now()}`,
      type: 'polygon',
      points: currentPoints,
      color,
      name: calibrationStep === 'direction' 
        ? `منطقه ${selectedDirection}`
        : violationTypes.find(v => v.id === selectedViolationType)?.name || 'تخلف',
      direction: selectedDirection,
      violationType: calibrationStep === 'violation' ? selectedViolationType : undefined,
      layer: calibrationStep
    };

    setShapes([...shapes, newShape]);
    setIsDrawing(false);
    setCurrentPoints([]);
    toast.success('منطقه اضافه شد');
  };

  const deleteSelectedShape = () => {
    if (!selectedShape) return;
    setShapes(shapes.filter(s => s.id !== selectedShape));
    setSelectedShape(null);
    toast.success('منطقه حذف شد');
  };

  const directionShapes = shapes.filter(s => s.layer === 'direction' && s.direction === selectedDirection);
  const violationShapes = shapes.filter(s => s.layer === 'violation' && s.direction === selectedDirection);

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ستون کناری - ابزارها */}
          <div className="space-y-6">
            {/* انتخاب جهت */}
            <Card className="p-5 border border-slate-200 shadow-sm">
              <Label className="text-sm font-medium mb-3 block">جهت</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['north', 'south', 'east', 'west'] as const).map((dir) => (
                  <Button
                    key={dir}
                    variant={selectedDirection === dir ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDirection(dir)}
                  >
                    {dir === 'north' ? 'شمال' : dir === 'south' ? 'جنوب' : dir === 'east' ? 'شرق' : 'غرب'}
                  </Button>
                ))}
              </div>
            </Card>

            {/* مرحله کالیبراسیون */}
            <Card className="p-5 border border-slate-200 shadow-sm">
              <Label className="text-sm font-medium mb-3 block">مرحله</Label>
              <Tabs value={calibrationStep} onValueChange={(v) => setCalibrationStep(v as CalibrationStep)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="direction">منطقه اصلی</TabsTrigger>
                  <TabsTrigger value="violation">تخلف</TabsTrigger>
                </TabsList>
              </Tabs>

              {calibrationStep === 'violation' && (
                <div className="mt-4 space-y-2">
                  <Label className="text-xs">نوع تخلف</Label>
                  {violationTypes.map((vType) => (
                    <Button
                      key={vType.id}
                      variant={selectedViolationType === vType.id ? 'default' : 'outline'}
                      size="sm"
                      className="w-full justify-start text-xs"
                      style={{
                        backgroundColor: selectedViolationType === vType.id ? vType.color + '20' : undefined,
                        borderColor: vType.color
                      }}
                      onClick={() => setSelectedViolationType(vType.id)}
                    >
                      <div className="w-3 h-3 rounded-full ml-2" style={{ backgroundColor: vType.color }} />
                      {vType.name}
                    </Button>
                  ))}
                </div>
              )}
            </Card>

            {/* ابزارهای رسم */}
            <Card className="p-5 border border-slate-200 shadow-sm">
              <Label className="text-sm font-medium mb-3 block">ابزار</Label>
              <div className="space-y-2">
                <Button
                  variant={activeTool === 'select' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTool('select')}
                >
                  <MousePointer2 className="w-4 h-4 ml-2" />
                  انتخاب
                </Button>
                <Button
                  variant={activeTool === 'rectangle' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTool('rectangle')}
                >
                  <Square className="w-4 h-4 ml-2" />
                  مستطیل
                </Button>
                <Button
                  variant={activeTool === 'polygon' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveTool('polygon')}
                >
                  <Pentagon className="w-4 h-4 ml-2" />
                  چندضلعی
                </Button>

                {activeTool === 'polygon' && isDrawing && (
                  <Button size="sm" variant="secondary" className="w-full" onClick={finishPolygon}>
                    اتمام ({currentPoints.length} نقطه)
                  </Button>
                )}
              </div>
            </Card>

            {/* نمایش لایه‌ها */}
            <Card className="p-5 border border-slate-200 shadow-sm">
              <Label className="text-sm font-medium mb-3 block">نمایش</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">منطقه اصلی</Label>
                  <Switch checked={showDirectionMasks} onCheckedChange={setShowDirectionMasks} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">مناطق تخلف</Label>
                  <Switch checked={showViolationMasks} onCheckedChange={setShowViolationMasks} />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Label className="text-xs mb-2 block">بزرگنمایی {zoom.toFixed(1)}x</Label>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Slider value={[zoom]} onValueChange={([v]) => setZoom(v)} min={0.5} max={2} step={0.1} />
                  <Button size="icon" variant="outline" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* عملیات */}
            <Card className="p-5 border border-slate-200 shadow-sm">
              <div className="space-y-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  disabled={!selectedShape}
                  onClick={deleteSelectedShape}
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف منطقه
                </Button>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => toast.success('کالیبراسیون ذخیره شد')}
                >
                  <Save className="w-4 h-4 ml-2" />
                  ذخیره
                </Button>
              </div>
            </Card>

            {/* لیست مناطق */}
            <Card className="p-5 border border-slate-200 shadow-sm">
              <Label className="text-sm font-medium mb-3 block">مناطق ({directionShapes.length + violationShapes.length})</Label>
              <div className="space-y-2 text-xs">
                {directionShapes.map(s => (
                  <div
                    key={s.id}
                    className={`p-2 rounded cursor-pointer ${selectedShape === s.id ? 'bg-blue-100' : 'bg-slate-50'}`}
                    onClick={() => setSelectedShape(s.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </div>
                  </div>
                ))}
                {violationShapes.map(s => (
                  <div
                    key={s.id}
                    className={`p-2 rounded cursor-pointer ${selectedShape === s.id ? 'bg-blue-100' : 'bg-slate-50'}`}
                    onClick={() => setSelectedShape(s.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </div>
                  </div>
                ))}
                {directionShapes.length + violationShapes.length === 0 && (
                  <p className="text-center text-slate-500 py-4">منطقه‌ای تعریف نشده</p>
                )}
              </div>
            </Card>
          </div>

          {/* کانواس اصلی */}
          <div className="lg:col-span-3">
            <Card className="p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900">
                  کالیبراسیون — جهت {selectedDirection === 'north' ? 'شمال' : selectedDirection === 'south' ? 'جنوب' : selectedDirection === 'east' ? 'شرق' : 'غرب'}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {activeTool === 'select' ? 'انتخاب' : activeTool === 'rectangle' ? 'مستطیل' : 'چندضلعی'}
                </Badge>
              </div>

              <div className="relative bg-slate-900 rounded-xl overflow-hidden" style={{ height: '700px' }}>
                <canvas
                  ref={canvasRef}
                  width={1200}
                  height={700}
                  onClick={handleCanvasClick}
                  className="absolute inset-0 cursor-crosshair"
                  style={{ width: '100%', height: '100%' }}
                />

                {isDrawing && activeTool === 'polygon' && (
                  <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg text-sm">
                    {currentPoints.length} نقطه — برای اتمام دکمه بزنید
                  </div>
                )}
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-slate-700">
                  <strong>راهنما:</strong>{' '}
                  {activeTool === 'select' && 'روی منطقه کلیک کنید'}
                  {activeTool === 'rectangle' && 'دو نقطه برای مستطیل کلیک کنید'}
                  {activeTool === 'polygon' && 'نقاط را کلیک کنید و سپس اتمام بزنید'}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}