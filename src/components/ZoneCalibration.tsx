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
  viewD: string;
  layer: 'direction' | 'violation';
}

export function ZoneCalibration({ intersection }: ZoneCalibrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ptzPresetsFromRedux = useSelector((state: RootState) => 
    state.ptzPresets[intersection.id] || []
  );

  const cameras = mockCameras[intersection.id] || [];
  const fixedDirections = Array.from(
    new Set(
      cameras
        .filter(cam => cam.type === 'fixed' && cam.direction)
        .map(cam => cam.direction!)
    )
  );

  const ptzPresets = ptzPresetsFromRedux.length > 0
    ? ptzPresetsFromRedux
    : mockPTZPresets[intersection.id] || [];

  const availableViews: View[] = [
    ...fixedDirections.map(dir => ({
      id: dir,
      label: dir === 'north' ? 'شمال' : dir === 'south' ? 'جنوب' : dir === 'east' ? 'شرق' : 'غرب',
      type: 'fixed' as const,
      direction: dir,
    })),
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

  const [violationTypes] = useState([
    { id: 'red-light', name: 'عبور از چراغ قرمز', color: '#ef4444' },
    { id: 'crosswalk', name: 'تجاوز به خط عابر', color: '#f97316' },
    { id: 'speed', name: 'سرعت غیرمجاز', color: '#8b5cf6' },
    { id: 'lane-change', name: 'تغییر خط ممنوع', color: '#ec4899' },
    { id: 'illegal-parking', name: 'پارک ممنوع', color: '#10b981' },
  ]);
  const [selectedViolationType, setSelectedViolationType] = useState(violationTypes[0].id);

  // بارگذاری ماسک‌ها
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

  // رسم کانواس
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
      const shouldShow = (shape.layer === 'direction' && showDirectionMasks) ||
                         (shape.layer === 'violation' && showViolationMasks);
      if (!shouldShow) return;

      ctx.save();
      ctx.scale(zoom, zoom);

      if (shape.points.length === 2) {
        const [p1, p2] = shape.points;
        const x = Math.min(p1.x, p2.x);
        const y = Math.min(p1.y, p2.y);
        const w = Math.abs(p2.x - p1.x);
        const h = Math.abs(p2.y - p1.y);

        ctx.fillStyle = shape.color + '40';
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.id === selectedShapeId ? 2.5 : 1.5;
        ctx.setLineDash(shape.id === selectedShapeId ? [5, 3] : []);
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = shape.color;
        ctx.font = '12px Vazirmatn, sans-serif';
        ctx.fillText(shape.name, x + 6, y + 14);
      }

      ctx.restore();
    });
  }, [shapes, selectedShapeId, zoom, selectedViewId, showDirectionMasks, showViolationMasks]);

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
        ? `منطقه اصلی (${availableViews.find(v => v.id === selectedViewId)?.label || '—'})`
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
      toast.success('منطقه اضافه شد');
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
    <div className="min-h-[calc(100vh-140px)] bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-[1800px] mx-auto">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          کالیبراسیون مناطق — {intersection.name}
        </h2>

        {/* سه ستون: 50% | 25% | 25% */}
        <div className="grid grid-cols-1 lg:grid-cols-[50%_25%_25%] gap-4 h-[calc(100vh-200px)]">
          {/* کانوس — 50% */}
          <Card className="p-3 border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 rounded-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {currentView?.label || 'هیچ دیدی انتخاب نشده'}
              </h3>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                {activeTool === 'select' ? 'انتخاب' : 'مستطیل'}
              </Badge>
            </div>

            {selectedViewId ? (
              <div className="relative bg-slate-900 rounded flex-1 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={1000}
                  height={600}
                  onClick={handleCanvasClick}
                  className="w-full h-full cursor-crosshair"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center flex-1 bg-slate-100 dark:bg-slate-800 rounded border border-dashed border-slate-300 dark:border-slate-600">
                <p className="text-slate-500 dark:text-slate-400 text-sm">ابتدا یک دید انتخاب کنید</p>
              </div>
            )}

          
          </Card>

          {/* ستون 1 (چپ) — 25% */}
          <div className="space-y-3 overflow-y-auto pr-1">
            {/* انتخاب دید */}
            <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg">
              <Label className="text-xs font-medium text-slate-900 dark:text-slate-100 mb-2 block">
                جهات قابل کالیبراسیون
              </Label>
              {availableViews.length > 0 ? (
                <div className="space-y-1.5">
                  {availableViews.map(view => (
                    <Button
                      key={view.id}
                      variant={selectedViewId === view.id ? 'default' : 'outline'}
                      size="sm"
                      className="text-[11px] justify-start h-8 px-2"
                      onClick={() => setSelectedViewId(view.id)}
                    >
                      {view.label}
                      {view.type === 'ptz' && (
                        <Badge className="mr-1 text-[9px] bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-1.5 py-0">
                          PTZ
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> هیچ دیدی موجود نیست
                </p>
              )}
            </Card>

            {/* مرحله */}
            <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg">
              <Label className="text-xs font-medium text-slate-900 dark:text-slate-100 mb-2 block">
                مرحله
              </Label>
              <div className="flex gap-1">
                <Button
                  variant={calibrationStep === 'direction' ? 'default' : 'outline'}
                  size="sm"
                  className="text-[10px] h-7 flex-1 px-1"
                  onClick={() => setCalibrationStep('direction')}
                >
                  اصلی
                </Button>
                <Button
                  variant={calibrationStep === 'violation' ? 'default' : 'outline'}
                  size="sm"
                  className="text-[10px] h-7 flex-1 px-1"
                  onClick={() => setCalibrationStep('violation')}
                >
                  تخلف
                </Button>
              </div>

              {calibrationStep === 'violation' && (
                <div className="mt-2 space-y-1">
                  <Label className="text-[10px] text-slate-700 dark:text-slate-300">نوع تخلف</Label>
                  {violationTypes.map(vType => (
                    <Button
                      key={vType.id}
                      variant={selectedViolationType === vType.id ? 'default' : 'outline'}
                      size="sm"
                      className="w-full justify-start text-[10px] h-7 px-1.5"
                      style={{
                        backgroundColor: selectedViolationType === vType.id ? vType.color + '15' : undefined,
                        borderColor: vType.color,
                        color: selectedViolationType === vType.id ? vType.color : undefined,
                      }}
                      onClick={() => setSelectedViolationType(vType.id)}
                    >
                      <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: vType.color }} />
                      {vType.name}
                    </Button>
                  ))}
                </div>
              )}
            </Card>

            {/* ابزارها */}
            <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg">
              <Label className="text-xs font-medium text-slate-900 dark:text-slate-100 mb-2 block">
                ابزار
              </Label>
              <div className="space-y-1.5">
                <Button
                  variant={activeTool === 'select' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full text-[11px] justify-start h-8"
                  onClick={() => setActiveTool('select')}
                >
                  <MousePointer2 className="w-3 h-3 ml-1 mr-1" /> انتخاب
                </Button>
                <Button
                  variant={activeTool === 'rectangle' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full text-[11px] justify-start h-8"
                  onClick={() => setActiveTool('rectangle')}
                >
                  مستطیل
                </Button>
              </div>
            </Card>
          </div>

          {/* ستون 2 (راست) — 25% */}
          <div className="space-y-3 overflow-y-auto pr-1">
            {/* نمایش/زوم */}
            <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg">
              <Label className="text-xs font-medium text-slate-900 dark:text-slate-100 mb-2 block">
                نمایش
              </Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-slate-700 dark:text-slate-300">منطقه اصلی</Label>
                  <Switch
                    checked={showDirectionMasks}
                    onCheckedChange={setShowDirectionMasks}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-slate-700 dark:text-slate-300">مناطق تخلف</Label>
                  <Switch
                    checked={showViolationMasks}
                    onCheckedChange={setShowViolationMasks}
                    className="data-[state=checked]:bg-red-600"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Label className="text-[10px] text-slate-700 dark:text-slate-300 mb-1">
                    زوم: {zoom.toFixed(1)}x
                  </Label>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="h-6 w-6 p-0" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                      <ZoomOut className="w-3 h-3" />
                    </Button>
                    <Slider value={[zoom]} onValueChange={([v]) => setZoom(v)} min={0.5} max={2} step={0.1} className="flex-1" />
                    <Button size="icon" variant="outline" className="h-6 w-6 p-0" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                      <ZoomIn className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* عملیات */}
            <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg">
              <div className="space-y-1.5">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full text-[11px] h-8"
                  disabled={!selectedShapeId}
                  onClick={deleteSelectedShape}
                >
                  <Trash2 className="w-3 h-3 ml-1 mr-1" /> حذف
                </Button>
                <Button
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] h-8"
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
                    toast.success('ذخیره شد');
                  }}
                >
                  <Save className="w-3 h-3 ml-1 mr-1" /> ذخیره
                </Button>
              </div>
            </Card>

            {/* لیست مناطق */}
            <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg flex-1 flex flex-col">
              <Label className="text-xs font-medium text-slate-900 dark:text-slate-100 mb-2 block">
                مناطق ({directionShapes.length + violationShapes.length})
              </Label>
              <div className="overflow-y-auto space-y-1 flex-1 text-[10px]">
                {[...directionShapes, ...violationShapes].map(shape => (
                  <div
                    key={shape.id}
                    className={`p-1.5 rounded cursor-pointer ${
                      selectedShapeId === shape.id 
                        ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700' 
                        : 'bg-slate-100 dark:bg-slate-700'
                    }`}
                    onClick={() => setSelectedShapeId(shape.id)}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded" style={{ backgroundColor: shape.color }} />
                      <span className="text-slate-900 dark:text-slate-100">{shape.name}</span>
                    </div>
                  </div>
                ))}
                {directionShapes.length + violationShapes.length === 0 && (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-2">
                    منطقه‌ای تعریف نشده
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}