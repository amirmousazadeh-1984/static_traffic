// src/components/ZoneCalibration.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Intersection, PTZPreset, Mask } from '../types';
import {
  mockMasks,
  mockCameras,
  mockPTZPresets
} from '../data/mockDatabase';
import {
  MousePointer2, Trash2, Save, ZoomIn, ZoomOut, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface ZoneCalibrationProps {
  intersection: Intersection;
}

type View = {
  id: string;
  label: string;
  type: 'fixed' | 'ptz';
  direction?: 'north' | 'south' | 'east' | 'west';
  presetId?: string;
};

type CalibrationStep = 'direction' | 'violation';

interface Shape {
  id: string;
  type: 'rectangle';
  points: { x: number; y: number }[];
  color: string;
  name: string;
  viewId: string;
  layer: 'direction' | 'violation';
}

export function ZoneCalibration({ intersection }: ZoneCalibrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ptzPresetsFromRedux = useSelector((state: RootState) => 
    state.ptzPresets[intersection.id] || []
  );

  // استخراج دوربین‌های ثابت از mockCameras
  const cameras = mockCameras[intersection.id] || [];
  const fixedDirections = Array.from(
    new Set(
      cameras
        .filter(cam => cam.type === 'fixed' && cam.direction)
        .map(cam => cam.direction!)
    )
  );

  // presetها را اول از Redux بگیر، اگر نبود از mock استفاده کن (برای سازگاری)
  const ptzPresets = ptzPresetsFromRedux.length > 0
    ? ptzPresetsFromRedux
    : mockPTZPresets[intersection.id] || [];

  const availableViews: View[] = [
    // دوربین‌های ثابت
    ...fixedDirections.map(dir => ({
      id: dir,
      label: dir === 'north' ? 'شمال' : dir === 'south' ? 'جنوب' : dir === 'east' ? 'شرق' : 'غرب',
      type: 'fixed' as const,
      direction: dir,
    })),
    // presetهای PTZ
    ...ptzPresets.map(preset => ({
      id: preset.id,
      label: preset.name,
      type: 'ptz' as const,
      presetId: preset.id,
    }))
  ];

  const [selectedViewId, setSelectedViewId] = useState<string | null>(
    availableViews.length > 0 ? availableViews[0].id : null
  );
  const [calibrationStep, setCalibrationStep] = useState<'direction' | 'violation'>('direction');
  const [activeTool, setActiveTool] = useState<'select' | 'rectangle'>('select');
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStartPoint, setCurrentStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showDirectionMasks, setShowDirectionMasks] = useState(true);
  const [showViolationMasks, setShowViolationMasks] = useState(true);

  // لیست انواع تخلف (برای مرحله violation)
  const [violationTypes] = useState([
    { id: 'red-light', name: 'عبور از چراغ قرمز', color: '#ef4444' },
    { id: 'crosswalk', name: 'تجاوز به خط عابر', color: '#f97316' },
    { id: 'speed', name: 'سرعت غیرمجاز', color: '#8b5cf6' },
    { id: 'lane-change', name: 'تغییر خط ممنوع', color: '#ec4899' },
    { id: 'illegal-parking', name: 'پارک ممنوع', color: '#10b981' },
  ]);
  const [selectedViolationType, setSelectedViolationType] = useState(violationTypes[0].id);

  // بارگذاری ماسکهای ذخیره‌شده
  useEffect(() => {
    const existingMasks = mockMasks[intersection.id] || [];
    const loadedShapes: Shape[] = existingMasks.map(mask => {
      let viewId: string;
      if (mask.ptzPresetId) {
        viewId = mask.ptzPresetId;
      } else if (mask.direction) {
        viewId = mask.direction;
      } else {
        return null;
      }
      return {
        id: mask.id,
        type: 'rectangle',
        points: [
          { x: mask.area.x, y: mask.area.y },
          { x: mask.area.x + mask.area.width, y: mask.area.y + mask.area.height },
        ],
        color: mask.color,
        name: mask.name,
        viewId,
        layer: mask.type === 'direction' ? 'direction' : 'violation',
      };
    }).filter(Boolean) as Shape[];

    setShapes(loadedShapes);
  }, [intersection.id]);

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
    shapes.forEach(shape => {
      if (shape.viewId !== selectedViewId) return;

      const shouldShow =
        (shape.layer === 'direction' && showDirectionMasks) ||
        (shape.layer === 'violation' && showViolationMasks);

      if (!shouldShow) return;

      ctx.save();
      ctx.scale(zoom, zoom);

      if (shape.points.length === 2) {
        const x1 = shape.points[0].x;
        const y1 = shape.points[0].y;
        const x2 = shape.points[1].x;
        const y2 = shape.points[1].y;
        const x = Math.min(x1, x2);
        const y = Math.min(y1, y2);
        const w = Math.abs(x2 - x1);
        const h = Math.abs(y2 - y1);

        ctx.fillStyle = shape.color + '40';
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.id === selectedShapeId ? 3 : 2;
        ctx.setLineDash(shape.id === selectedShapeId ? [6, 4] : []);
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = shape.color;
        ctx.font = '14px Vazirmatn, sans-serif';
        ctx.fillText(shape.name, x + 8, y + 8);
      }

      ctx.restore();
    });
  }, [
    shapes, selectedShapeId, zoom, selectedViewId,
    showDirectionMasks, showViolationMasks
  ]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'rectangle') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (!isDrawing) {
      setIsDrawing(true);
      setCurrentStartPoint({ x, y });
    } else {
      const color = calibrationStep === 'direction'
        ? '#3b82f6'
        : violationTypes.find(v => v.id === selectedViolationType)?.color || '#ef4444';

      const name = calibrationStep === 'direction'
        ? `منطقه اصلی (${availableViews.find(v => v.id === selectedViewId)?.label || 'نامشخص'})`
        : violationTypes.find(v => v.id === selectedViolationType)?.name || 'تخلف';

      const newShape: Shape = {
        id: `shape-${Date.now()}`,
        type: 'rectangle',
        points: [currentStartPoint!, { x, y }],
        color,
        name,
        viewId: selectedViewId!,
        layer: calibrationStep,
      };

      setShapes([...shapes, newShape]);
      setIsDrawing(false);
      setCurrentStartPoint(null);
      toast.success('منطقه جدید اضافه شد');
    }
  };

  const deleteSelectedShape = () => {
    if (!selectedShapeId) return;
    setShapes(shapes.filter(s => s.id !== selectedShapeId));
    setSelectedShapeId(null);
    toast.success('منطقه حذف شد');
  };

  const currentView = availableViews.find(v => v.id === selectedViewId);
  const directionShapes = shapes.filter(s => s.viewId === selectedViewId && s.layer === 'direction');
  const violationShapes = shapes.filter(s => s.viewId === selectedViewId && s.layer === 'violation');

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 dark:bg-slate-900">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ستون ابزارها */}
          <div className="space-y-6">
            {/* انتخاب دید */}
            <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <Label className="text-sm font-medium mb-3 block text-slate-900 dark:text-slate-100">
               جهات موجود برای کالیبراسیون
              </Label>
              {availableViews.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {availableViews.map(view => (
                    <Button
                      key={view.id}
                      variant={selectedViewId === view.id ? 'default' : 'outline'}
                      size="sm"
                      className="justify-start text-right"
                      onClick={() => setSelectedViewId(view.id)}
                    >
                      {view.label}
                      {view.type === 'ptz' && (
                        <Badge className="mr-2 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          Preset (PTZ)
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  هیچ دوربین یا presetی موجود نیست
                </p>
              )}
            </Card>

            {/* مرحله کالیبراسیون */}
            <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <Label className="text-sm font-medium mb-3 block text-slate-900 dark:text-slate-100">
                مرحله
              </Label>
              <div className="flex gap-2">
                <Button
                  variant={calibrationStep === 'direction' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setCalibrationStep('direction')}
                >
                  منطقه اصلی
                </Button>
                <Button
                  variant={calibrationStep === 'violation' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setCalibrationStep('violation')}
                >
                  مناطق تخلف
                </Button>
              </div>

              {calibrationStep === 'violation' && (
                <div className="mt-4 space-y-2">
                  <Label className="text-xs text-slate-700 dark:text-slate-300">نوع تخلف</Label>
                  {violationTypes.map(vType => (
                    <Button
                      key={vType.id}
                      variant={selectedViolationType === vType.id ? 'default' : 'outline'}
                      size="sm"
                      className="w-full justify-start text-xs"
                      style={{
                        backgroundColor: selectedViolationType === vType.id ? vType.color + '20' : undefined,
                        borderColor: vType.color,
                        color: selectedViolationType === vType.id ? vType.color : undefined,
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

            {/* ابزار رسم */}
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
                  مستطیل
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
                  <Label className="text-xs text-slate-700 dark:text-slate-300">منطقه اصلی</Label>
                  <Switch checked={showDirectionMasks} onCheckedChange={setShowDirectionMasks} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-slate-700 dark:text-slate-300">مناطق تخلف</Label>
                  <Switch checked={showViolationMasks} onCheckedChange={setShowViolationMasks} />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Label className="text-xs mb-2 block text-slate-700 dark:text-slate-300">
                  بزرگنمایی {zoom.toFixed(1)}x
                </Label>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Slider value={[zoom]} onValueChange={([v]) => setZoom(v)} min={0.5} max={2} step={0.1} className="flex-1" />
                  <Button size="icon" variant="outline" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
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
                  disabled={!selectedShapeId}
                  onClick={deleteSelectedShape}
                >
                  <Trash2 className="w-4 h-4 ml-2" /> حذف منطقه
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    const masksToSave: Mask[] = shapes.map(shape => ({
                      id: shape.id,
                      name: shape.name,
                      color: shape.color,
                      type: shape.layer,
                      area: {
                        x: Math.min(shape.points[0].x, shape.points[1].x),
                        y: Math.min(shape.points[0].y, shape.points[1].y),
                        width: Math.abs(shape.points[1].x - shape.points[0].x),
                        height: Math.abs(shape.points[1].y - shape.points[0].y),
                      },
                      direction: availableViews.find(v => v.id === shape.viewId && v.type === 'fixed')?.direction,
                      ptzPresetId: availableViews.find(v => v.id === shape.viewId && v.type === 'ptz')?.presetId,
                    }));

                    mockMasks[intersection.id] = masksToSave;
                    toast.success('کالیبراسیون ذخیره شد');
                  }}
                >
                  <Save className="w-4 h-4 ml-2" /> ذخیره کالیبراسیون
                </Button>
              </div>
            </Card>

            {/* لیست مناطق */}
            <Card className="p-5 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
              <Label className="text-sm font-medium mb-3 block text-slate-900 dark:text-slate-100">
                مناطق ({directionShapes.length + violationShapes.length})
              </Label>
              <div className="space-y-2 text-xs max-h-96 overflow-y-auto">
                {[...directionShapes, ...violationShapes].map(shape => (
                  <div
                    key={shape.id}
                    className={`p-2 rounded cursor-pointer ${
                      selectedShapeId === shape.id 
                        ? 'bg-blue-100 dark:bg-blue-900/30' 
                        : 'bg-slate-100 dark:bg-slate-700'
                    }`}
                    onClick={() => setSelectedShapeId(shape.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: shape.color }} />
                      <span className="text-slate-900 dark:text-slate-100">{shape.name}</span>
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
                  کالیبراسیون — {currentView?.label || 'هیچ دیدی انتخاب نشده'}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {activeTool === 'select' ? 'انتخاب' : 'مستطیل'}
                </Badge>
              </div>

              {selectedViewId ? (
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
              ) : (
                <div className="flex items-center justify-center h-[700px] bg-slate-100 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-600">
                  <p className="text-slate-500 dark:text-slate-400">ابتدا یک دید انتخاب کنید</p>
                </div>
              )}

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  <strong>راهنما:</strong>{' '}
                  {activeTool === 'select' && 'روی یک منطقه کلیک کنید تا آن را انتخاب کنید'}
                  {activeTool === 'rectangle' && 'دو بار کلیک کنید تا مستطیل ایجاد شود'}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}