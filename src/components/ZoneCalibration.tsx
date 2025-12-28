// src/components/ZoneCalibration.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Intersection, Mask } from '../types';
import { mockMasks, mockCameras, mockPTZPresets } from '../data/mockDatabase';
import { MousePointer2, Trash2, Save, AlertTriangle, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { SubPresetCalibration } from './SubPresetCalibration';

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

type ShapeType = 'rectangle' | 'polygon';

interface Shape {
  id: string;
  type: ShapeType;
  points: { x: number; y: number }[];
  color: string;
  name: string;
  viewId: string;
  layer: 'direction' | 'violation';
}

export function ZoneCalibration({ intersection }: ZoneCalibrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ptzPresetsFromRedux = useSelector((state: RootState) => state.ptzPresets[intersection.id] || []);

  const cameras = mockCameras[intersection.id] || [];
  const fixedDirections = Array.from(
    new Set(cameras.filter(cam => cam.type === 'fixed' && cam.direction).map(cam => cam.direction!))
  );

  const ptzPresets = ptzPresetsFromRedux.length > 0 ? ptzPresetsFromRedux : mockPTZPresets[intersection.id] || [];

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
    })),
  ];

  const [selectedViewId, setSelectedViewId] = useState<string | null>(
    availableViews.length > 0 ? availableViews[0].id : null
  );
  const [calibrationStep, setCalibrationStep] = useState<'direction' | 'violation'>('direction');
  const [activeTool, setActiveTool] = useState<'select' | 'rectangle' | 'polygon'>('select');
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoom] = useState(1); // برای سادگی، زوم حذف شد
  const [showDirectionMasks, setShowDirectionMasks] = useState(true);
  const [showViolationMasks, setShowViolationMasks] = useState(true);
const [editingShapeId, setEditingShapeId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [showSubPresetModal, setShowSubPresetModal] = useState<{ maskId: string; maskName: string } | null>(null);

  const [violationTypes] = useState([
    { id: 'red-light', name: 'عبور از چراغ قرمز', color: '#ef4444' },
    { id: 'crosswalk', name: 'تجاوز به خط عابر', color: '#f97316' },
    { id: 'speed', name: 'سرعت غیرمجاز', color: '#8b5cf6' },
    { id: 'lane-change', name: 'تغییر خط ممنوع', color: '#ec4899' },
    { id: 'illegal-parking', name: 'پارک ممنوع', color: '#10b981' },
  ]);
  const [selectedViolationType, setSelectedViolationType] = useState(violationTypes[0].id);
const startEditing = (shapeId: string, currentName: string) => {
  setEditingShapeId(shapeId);
  setEditedName(currentName);
};

const cancelEditing = () => {
  setEditingShapeId(null);
  setEditedName('');
};

const saveEditedName = () => {
  if (!editingShapeId) return;
  setShapes(shapes.map(s => 
    s.id === editingShapeId ? { ...s, name: editedName } : s
  ));
  setEditingShapeId(null);
  toast.success('نام منطقه به‌روزرسانی شد');
};
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
        type: mask.points?.length > 2 ? 'polygon' : 'rectangle',
        points: mask.points?.length > 2
          ? mask.points
          : [
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
    setSelectedShapeId(null);
  }, [intersection.id]);

  const getColor = () => {
    if (calibrationStep === 'direction') return '#3b82f6';
    const vt = violationTypes.find(v => v.id === selectedViolationType);
    return vt?.color || '#ef4444';
  };

  const getName = () => {
    if (calibrationStep === 'direction') {
      return `منطقه اصلی (${availableViews.find(v => v.id === selectedViewId)?.label || '—'})`;
    }
    const vt = violationTypes.find(v => v.id === selectedViolationType);
    return vt?.name || 'تخلف';
  };

  // ================================
  // رسم روی کانوَس
  // ================================
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

      ctx.fillStyle = shape.color + '40';
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.id === selectedShapeId ? 2 : 1;
      ctx.setLineDash(shape.id === selectedShapeId ? [5, 3] : []);

      if (shape.type === 'rectangle' && shape.points.length === 2) {
        const [p1, p2] = shape.points;
        const x = Math.min(p1.x, p2.x);
        const y = Math.min(p1.y, p2.y);
        const w = Math.abs(p2.x - p1.x);
        const h = Math.abs(p2.y - p1.y);

        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = shape.color;
        ctx.font = '12px Vazirmatn, sans-serif';
        ctx.fillText(shape.name, x + 6, y + 14);
      } else if (shape.type === 'polygon' && shape.points.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // نمایش handle‌ها در حالت انتخاب
        if (shape.id === selectedShapeId) {
          ctx.fillStyle = '#fff';
          ctx.strokeStyle = shape.color;
          shape.points.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          });
        }

        // نام
        const cx = shape.points.reduce((sum, p) => sum + p.x, 0) / shape.points.length;
        const cy = shape.points.reduce((sum, p) => sum + p.y, 0) / shape.points.length;
        ctx.fillStyle = shape.color;
        ctx.font = '12px Vazirmatn, sans-serif';
        ctx.fillText(shape.name, cx + 6, cy + 6);
      }

      ctx.restore();
    });
  }, [shapes, selectedShapeId, zoom, selectedViewId, showDirectionMasks, showViolationMasks]);

  // ================================
  // مدیریت کلیک روی کانوَس
  // ================================
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'select') {
      // انتخاب شکل
      let clickedShapeId: string | null = null;

      // بررسی معکوس (آخرین شکل بالاتر است)
      for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        if (shape.viewId !== selectedViewId) continue;

        if (shape.type === 'rectangle' && shape.points.length === 2) {
          const [p1, p2] = shape.points;
          const left = Math.min(p1.x, p2.x);
          const top = Math.min(p1.y, p2.y);
          const right = Math.max(p1.x, p2.x);
          const bottom = Math.max(p1.y, p2.y);
          if (x >= left && x <= right && y >= top && y <= bottom) {
            clickedShapeId = shape.id;
            break;
          }
        } else if (shape.type === 'polygon') {
          // الگوریتم نقطه در چندضلعی (ray casting)
          const inside = isPointInPolygon({ x, y }, shape.points);
          if (inside) {
            clickedShapeId = shape.id;
            break;
          }
        }
      }

      setSelectedShapeId(clickedShapeId);
    } else if (activeTool === 'rectangle') {
      if (!isDrawing) {
        setIsDrawing(true);
        const newRect: Shape = {
          id: `rect-${Date.now()}`,
          type: 'rectangle',
          points: [{ x, y }, { x, y }],
          color: getColor(),
          name: getName(),
          viewId: selectedViewId!,
          layer: calibrationStep,
        };
        setShapes([...shapes, newRect]);
        setSelectedShapeId(newRect.id);
      } else {
        const updated = shapes.map(s =>
          s.id === selectedShapeId ? { ...s, points: [s.points[0], { x, y }] } : s
        );
        setShapes(updated);
        setIsDrawing(false);
        toast.success('مستطیل ایجاد شد');
      }
    } else if (activeTool === 'polygon') {
      if (!selectedViewId) return;

      if (!isDrawing) {
        // شروع رسم چندضلعی جدید
        const newPoly: Shape = {
          id: `poly-${Date.now()}`,
          type: 'polygon',
          points: [{ x, y }],
          color: getColor(),
          name: getName(),
          viewId: selectedViewId!,
          layer: calibrationStep,
        };
        setShapes([...shapes, newPoly]);
        setSelectedShapeId(newPoly.id);
        setIsDrawing(true);
      } else {
        // افزودن نقطه جدید به چندضلعی انتخاب‌شده
        const updated = shapes.map(s => {
          if (s.id === selectedShapeId && s.type === 'polygon') {
            return { ...s, points: [...s.points, { x, y }] };
          }
          return s;
        });
        setShapes(updated);
      }
    }
  };

  // تکمیل چندضلعی با کلیک راست یا دابل‌کلیک
  const handleCanvasDoubleClick = () => {
    if (activeTool === 'polygon' && isDrawing && selectedShapeId) {
      const updated = shapes.map(s => {
        if (s.id === selectedShapeId && s.type === 'polygon' && s.points.length >= 3) {
          // حذف نقطه تکراری اگر نیاز باشد
          return s;
        } else if (s.id === selectedShapeId && s.points.length < 3) {
          // حداقل ۳ نقطه لازم است
          toast.error('حداقل ۳ نقطه برای چندضلعی لازم است');
          return { ...s, points: [] };
        }
        return s;
      }).filter(s => !(s.id === selectedShapeId && s.points.length < 3));

      setShapes(updated);
      setIsDrawing(false);
      setSelectedShapeId(null);
      toast.success('چندضلعی کامل شد');
    }
  };

  // حرکت موس برای رسم مستطیل/چندضلعی به‌صورت زنده
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !selectedShapeId || activeTool !== 'rectangle') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const updated = shapes.map(s =>
      s.id === selectedShapeId ? { ...s, points: [s.points[0], { x, y }] } : s
    );
    setShapes(updated);
  };

  // ================================
  // توابع کمکی
  // ================================
  function isPointInPolygon(point: { x: number; y: number }, vs: { x: number; y: number }[]) {
    let x = point.x, y = point.y;
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      let xi = vs[i].x, yi = vs[i].y;
      let xj = vs[j].x, yj = vs[j].y;
      let intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  const deleteSelectedShape = () => {
    if (!selectedShapeId) return;
    setShapes(shapes.filter(s => s.id !== selectedShapeId));
    setSelectedShapeId(null);
    toast.success('منطقه حذف شد');
  };

  // ذخیره
  const handleSave = () => {
    const masksToSave: Mask[] = shapes.map(shape => {
      if (shape.type === 'rectangle' && shape.points.length === 2) {
        const [p1, p2] = shape.points;
        return {
          id: shape.id,
          name: shape.name,
          color: shape.color,
          type: shape.layer,
          area: {
            x: Math.min(p1.x, p2.x),
            y: Math.min(p1.y, p2.y),
            width: Math.abs(p2.x - p1.x),
            height: Math.abs(p2.y - p1.y),
          },
          points: undefined,
          direction: availableViews.find(v => v.id === shape.viewId && v.type === 'fixed')?.direction,
          ptzPresetId: availableViews.find(v => v.id === shape.viewId && v.type === 'ptz')?.presetId,
        };
      } else {
        return {
          id: shape.id,
          name: shape.name,
          color: shape.color,
          type: shape.layer,
          area: undefined,
          points: shape.points,
          direction: availableViews.find(v => v.id === shape.viewId && v.type === 'fixed')?.direction,
          ptzPresetId: availableViews.find(v => v.id === shape.viewId && v.type === 'ptz')?.presetId,
        };
      }
    });
    mockMasks[intersection.id] = masksToSave;
    toast.success('ذخیره شد');
  };

  const currentView = availableViews.find(v => v.id === selectedViewId);
  const directionShapes = shapes.filter(s => s.viewId === selectedViewId && s.layer === 'direction');
  const violationShapes = shapes.filter(s => s.viewId === selectedViewId && s.layer === 'violation');

 useEffect(() => {
  if (!selectedViewId) {
    setActiveTool('select');
  }
}, [selectedViewId]);

  return (

  <div className="min-h-[calc(100vh-140px)] bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-[1800px] mx-auto">
        
        <div className="mb-4">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
        کالیبراسیون مناطق — {intersection.name}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
           کالیبره کردن جهات و preset ها و ترسیم ماسک های اصلی و ماسک های تخلفات برای هر جهت
          </p>
</div>
      {/* Container اصلی با ارتفاع 80vh و عرض ستون‌های 50% / 25% / 25% */}
      <div className="grid grid-cols-1 lg:grid-cols-[50%_24%_24%] gap-4" style={{ height: '80vh' }}>
        {/* ستون اول: کانواس (50%) */}
        <Card className="flex flex-col border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-3">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {currentView?.label || 'هیچ دیدی انتخاب نشده'}
            </h3>
            <div className="flex gap-1.5">
              <Button
                variant={activeTool === 'select' ? 'default' : 'outline'}
                size="sm"
                className="text-[10px] h-6 px-2"
                onClick={() => setActiveTool('select')}
              >
                <MousePointer2 className="w-3 h-3 mr-1" /> انتخاب
              </Button>
              <Button
                variant={activeTool === 'rectangle' ? 'default' : 'outline'}
                size="sm"
                className="text-[10px] h-6 px-2"
                onClick={() => setActiveTool('rectangle')}
              >
                مستطیل
              </Button>
              <Button
                variant={activeTool === 'polygon' ? 'default' : 'outline'}
                size="sm"
                className="text-[10px] h-6 px-2"
                onClick={() => setActiveTool('polygon')}
              >
                چندضلعی
              </Button>
            </div>
          </div>

          {selectedViewId ? (
            <div className="relative bg-slate-900 flex-1 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={1000}
                height={600}
                onClick={handleCanvasClick}
                onDoubleClick={handleCanvasDoubleClick}
                onMouseMove={handleCanvasMouseMove}
                className="w-full h-full cursor-crosshair"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1 bg-slate-100 dark:bg-slate-800 rounded border border-dashed border-slate-300 dark:border-slate-600">
              <p className="text-slate-500 dark:text-slate-400 text-sm">ابتدا یک دید انتخاب کنید</p>
            </div>
          )}
        </Card>
{/* ستون دوم: دو بخش با ارتفاع برابر */}
<div className="flex flex-col gap-4 h-full">
  {/* بخش اول: جهات و presetها */}
  <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg flex flex-col" style={{ height: 'calc(50% - 8px)' }}>
    <Label className="text-xs font-medium text-slate-900 dark:text-slate-100 mb-2 block">
      جهات دوربین‌های ثابت
    </Label>
    {fixedDirections.length > 0 ? (
      <div className="space-y-1.5 mb-3 overflow-y-auto flex-1">
        {fixedDirections.map(dir => {
          const label = dir === 'north' ? 'شمال' : dir === 'south' ? 'جنوب' : dir === 'east' ? 'شرق' : 'غرب';
          const isSelected = selectedViewId === dir;
          return (
            <Button
              key={dir}
              variant="outline"
              size="sm"
              className={`text-[11px] justify-start h-8 px-2 w-full text-left ${
                isSelected
                  ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
              onClick={() => setSelectedViewId(dir)}
            >
              {label}
            </Button>
          );
        })}
      </div>
    ) : (
      <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3">دوربین ثابتی تعریف نشده</p>
    )}

    <Label className="text-xs font-medium text-slate-900 dark:text-slate-100 mb-2 block">
      preset های دوربین های چرخان
    </Label>
    {ptzPresets.length > 0 ? (
      <div className="space-y-1.5 overflow-y-auto flex-1">
        {ptzPresets.map(preset => {
          const isSelected = selectedViewId === preset.id;
          return (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              className={`text-[11px] justify-start h-8 px-2 w-full text-left flex items-center ${
                isSelected
                  ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
              onClick={() => setSelectedViewId(preset.id)}
            >
              {preset.name}
              <Badge className="mr-1 text-[9px] bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-1.5 py-0">
                PTZ
              </Badge>
            </Button>
          );
        })}
      </div>
    ) : (
      <p className="text-[10px] text-slate-500 dark:text-slate-400">preset تعریف نشده است</p>
    )}
  </Card>

  {/* بخش دوم: ترسیم مناطق */}
  <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg flex flex-col" style={{ height: 'calc(50% - 8px)' }}>
    <Label className="text-xs font-medium text-slate-900 dark:text-slate-100 mb-2 block">
      ترسیم مناطق کالیبراسیون
    </Label>
    <div className="flex gap-1 mb-2">
      <Button
        variant="outline"
        size="sm"
        className={`text-[10px] h-7 flex-1 px-1 ${
          calibrationStep === 'direction'
            ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-300'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
        }`}
        onClick={() => setCalibrationStep('direction')}
      >
        ترسیم ماسک اصلی
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={`text-[10px] h-7 flex-1 px-1 ${
          calibrationStep === 'violation'
            ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-300'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
        }`}
        onClick={() => setCalibrationStep('violation')}
      >
        ترسیم ماسک تخلفات
      </Button>
    </div>

    {calibrationStep === 'violation' && (
      <div className="mt-2 space-y-1 flex-1 overflow-y-auto">
        <Label className="text-[10px] text-slate-700 dark:text-slate-300 mb-1">نوع تخلف</Label>
        {violationTypes.map(vType => {
          const isSelected = selectedViolationType === vType.id;
          return (
            <Button
              key={vType.id}
              variant="outline"
              size="sm"
              className={`w-full justify-start text-[10px] h-7 px-1.5 flex items-center ${
                isSelected
                  ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
              onClick={() => setSelectedViolationType(vType.id)}
            >
              <div
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: vType.color }}
              />
              {vType.name}
            </Button>
          );
        })}
      </div>
    )}
  </Card>
</div>

      {/* ستون سوم: لیست مناطق (25%) */}
<Card className="flex flex-col border border-slate-200 dark:border-slate-700 dark:border-s slate-700 bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
  <div className="p-3 flex justify-between items-center">
    <Label className="text-xs font-medium text-slate-900 dark:text-slate-100">
      مناطق تعریف شده ({shapes.filter(s => s.viewId === selectedViewId).length})
    </Label>
    {directionShapes.length + violationShapes.length > 0 && (
      <Button
        size="sm"
        variant="ghost"
        className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 h-5 w-5 p-0"
        onClick={handleSave}
      >
        <Save className="w-3 h-3" />
      </Button>
    )}
  </div>

  <div className="flex-1 overflow-y-auto p-3 pt-0 space-y-2 text-[11px]">
    {[...directionShapes, ...violationShapes].map(shape => (
      <div
        key={shape.id}
        className={`p-3 rounded-md cursor-pointer flex items-center justify-between ${
          selectedShapeId === shape.id
            ? 'bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700'
            : 'bg-slate-100 dark:bg-slate-700'
        }`}
        onClick={() => {
          if (!editingShapeId) {
            setSelectedShapeId(shape.id);
          }
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-2 h-2 rounded flex-shrink-0" style={{ backgroundColor: shape.color }} />
          {editingShapeId === shape.id ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent border-b border-blue-400 outline-none text-slate-900 dark:text-slate-100 text-[11px] py-0.5"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-slate-900 dark:text-slate-100 truncate">{shape.name}</span>
          )}
        </div>

        <div className="flex gap-1 mr-1 flex-shrink-0">
          {editingShapeId === shape.id ? (
            <>
              
              <Button
                size="sm"
                variant="ghost"
                className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  saveEditedName();
                }}
              >
                <Save className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  cancelEditing();
                }}
              >
                ✕
              </Button>
            </>
          ) : (
              <>
                {shape.layer === 'violation' && editingShapeId !== shape.id && (
  <Button
    size="sm"
    variant="outline"
    className="text-[10px] h-5 px-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
    onClick={(e) => {
      e.stopPropagation();
      setShowSubPresetModal({ maskId: shape.id, maskName: shape.name });
    }}
  >
    Sub-preset
  </Button>
)}
              <Button
                size="sm"
                variant="ghost"
                className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(shape.id, shape.name);
                }}
              >
                 <Edit3 className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedShapeId(shape.id);
                  deleteSelectedShape();
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    ))}
{showSubPresetModal && selectedViewId && (
  <SubPresetCalibration
    intersection={intersection}
    maskId={showSubPresetModal.maskId}
    maskName={showSubPresetModal.maskName}
    onClose={() => setShowSubPresetModal(null)}
  />
)}
    {directionShapes.length + violationShapes.length === 0 && (
      <p className="text-center text-slate-500 dark:text-slate-400 py-2">
        منطقه‌ای برای این Preset تعریف نشده است
      </p>
    )}
  </div>
</Card>
      </div>
    </div>
  </div>
  

  );
  
  
  
  

}
