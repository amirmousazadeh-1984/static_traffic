import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Intersection, Mask } from '../types';
import { mockMasks, violationTypes } from '../data/mockDatabase';
import {
  Square,
  Circle,
  Pentagon,
  Move,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  MousePointer2
} from 'lucide-react';
import { toast } from 'sonner';

interface ZoneCalibrationProps {
  intersection: Intersection;
}

type DrawingTool = 'select' | 'rectangle' | 'polygon' | 'circle';
type CalibrationStep = 'direction' | 'violation';

interface Point {
  x: number;
  y: number;
}

interface Shape {
  id: string;
  type: 'rectangle' | 'polygon' | 'circle';
  points: Point[];
  color: string;
  name: string;
  direction?: 'north' | 'south' | 'east' | 'west';
  violationType?: string;
  layer: 'direction' | 'violation';
}

export function ZoneCalibration({ intersection }: ZoneCalibrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
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

  // تصویر پیش‌فرض چهارراه
  const intersectionImage = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=800&fit=crop';

  // بارگذاری ماسک‌های موجود
  useEffect(() => {
    const existingMasks = mockMasks[intersection.id] || [];
    const loadedShapes: Shape[] = existingMasks.map(mask => {
      const centerX = mask.area.x + mask.area.width / 2;
      const centerY = mask.area.y + mask.area.height / 2;
      
      return {
        id: mask.id,
        type: 'rectangle',
        points: [
          { x: mask.area.x, y: mask.area.y },
          { x: mask.area.x + mask.area.width, y: mask.area.y + mask.area.height }
        ],
        color: mask.color,
        name: mask.name,
        direction: mask.direction,
        violationType: mask.violationType,
        layer: mask.type === 'direction' ? 'direction' : 'violation'
      };
    });
    setShapes(loadedShapes);
  }, [intersection.id]);

  // رسم کانواس
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // پاک کردن کانواس
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // رسم تصویر چهارراه
    const img = new Image();
    img.src = intersectionImage;
    img.onload = () => {
      ctx.save();
      ctx.scale(zoom, zoom);
      ctx.drawImage(img, 0, 0, canvas.width / zoom, canvas.height / zoom);
      ctx.restore();

      // رسم شکل‌ها
      shapes.forEach(shape => {
        // فیلتر بر اساس جهت و لایه
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
          
          // پر کردن با شفافیت
          ctx.fillStyle = shape.color + '33';
          ctx.fillRect(start.x, start.y, width, height);
          
          // کادر
          ctx.strokeStyle = shape.color;
          ctx.lineWidth = shape.id === selectedShape ? 3 : 2;
          ctx.setLineDash(shape.id === selectedShape ? [5, 5] : []);
          ctx.strokeRect(start.x, start.y, width, height);
          
          // نام
          ctx.fillStyle = shape.color;
          ctx.font = '14px IRANSans';
          ctx.fillText(shape.name, start.x + 5, start.y + 20);
        } else if (shape.type === 'polygon' && shape.points.length > 2) {
          ctx.beginPath();
          ctx.moveTo(shape.points[0].x, shape.points[0].y);
          shape.points.forEach(point => ctx.lineTo(point.x, point.y));
          ctx.closePath();
          
          ctx.fillStyle = shape.color + '33';
          ctx.fill();
          
          ctx.strokeStyle = shape.color;
          ctx.lineWidth = shape.id === selectedShape ? 3 : 2;
          ctx.setLineDash(shape.id === selectedShape ? [5, 5] : []);
          ctx.stroke();
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
          // نمایش preview مستطیل
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          const start = currentPoints[0];
          // این فقط یک preview است، نقطه دوم در حین حرکت ماوس تعیین می‌شود
        } else if (activeTool === 'polygon') {
          ctx.beginPath();
          ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
          currentPoints.forEach(point => ctx.lineTo(point.x, point.y));
          
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // نقاط
          currentPoints.forEach(point => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fill();
          });
        }
        
        ctx.restore();
      }
    };
  }, [shapes, selectedShape, zoom, selectedDirection, showDirectionMasks, showViolationMasks, isDrawing, currentPoints, calibrationStep, selectedViolationType, activeTool, intersectionImage]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (activeTool === 'select') {
      // انتخاب شکل
      const clickedShape = shapes.find(shape => {
        if (shape.type === 'rectangle' && shape.points.length === 2) {
          const [start, end] = shape.points;
          return x >= start.x && x <= end.x && y >= start.y && y <= end.y;
        }
        return false;
      });
      
      setSelectedShape(clickedShape?.id || null);
    } else if (activeTool === 'rectangle') {
      if (!isDrawing) {
        setIsDrawing(true);
        setCurrentPoints([{ x, y }]);
      } else {
        // اتمام رسم مستطیل
        const newShape: Shape = {
          id: `shape-${Date.now()}`,
          type: 'rectangle',
          points: [currentPoints[0], { x, y }],
          color: calibrationStep === 'direction' ? '#3b82f6' : 
                 violationTypes.find(v => v.id === selectedViolationType)?.color || '#ef4444',
          name: calibrationStep === 'direction' 
            ? `منطقه ${selectedDirection === 'north' ? 'شمال' : selectedDirection === 'south' ? 'جنوب' : selectedDirection === 'east' ? 'شرق' : 'غرب'}`
            : violationTypes.find(v => v.id === selectedViolationType)?.name || 'منطقه تخلف',
          direction: selectedDirection,
          violationType: calibrationStep === 'violation' ? selectedViolationType : undefined,
          layer: calibrationStep
        };
        
        setShapes([...shapes, newShape]);
        setIsDrawing(false);
        setCurrentPoints([]);
        toast.success('منطقه جدید اضافه شد');
      }
    } else if (activeTool === 'polygon') {
      if (!isDrawing) {
        setIsDrawing(true);
        setCurrentPoints([{ x, y }]);
      } else {
        // اضافه کردن نقطه جدید
        setCurrentPoints([...currentPoints, { x, y }]);
      }
    }
  };

  const finishPolygon = () => {
    if (currentPoints.length < 3) {
      toast.error('چندضلعی باید حداقل 3 نقطه داشته باشد');
      return;
    }

    const newShape: Shape = {
      id: `shape-${Date.now()}`,
      type: 'polygon',
      points: currentPoints,
      color: calibrationStep === 'direction' ? '#3b82f6' : 
             violationTypes.find(v => v.id === selectedViolationType)?.color || '#ef4444',
      name: calibrationStep === 'direction' 
        ? `منطقه ${selectedDirection === 'north' ? 'شمال' : selectedDirection === 'south' ? 'جنوب' : selectedDirection === 'east' ? 'شرق' : 'غرب'}`
        : violationTypes.find(v => v.id === selectedViolationType)?.name || 'منطقه تخلف',
      direction: selectedDirection,
      violationType: calibrationStep === 'violation' ? selectedViolationType : undefined,
      layer: calibrationStep
    };
    
    setShapes([...shapes, newShape]);
    setIsDrawing(false);
    setCurrentPoints([]);
    toast.success('منطقه جدید اضافه شد');
  };

  const deleteSelectedShape = () => {
    if (!selectedShape) return;
    setShapes(shapes.filter(s => s.id !== selectedShape));
    setSelectedShape(null);
    toast.success('منطقه حذف شد');
  };

  const saveCalibration = () => {
    // ذخیره در دیتابیس
    toast.success('کالیبراسیون با موفقیت ذخیره شد');
  };

  const directionShapes = shapes.filter(s => s.layer === 'direction' && s.direction === selectedDirection);
  const violationShapes = shapes.filter(s => s.layer === 'violation' && s.direction === selectedDirection);

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-50">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ستون راست - ابزارها */}
          <div className="space-y-6">
            {/* انتخاب جهت */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">انتخاب جهت</h3>
              <div className="grid grid-cols-2 gap-2">
                {(['north', 'south', 'east', 'west'] as const).map((dir) => (
                  <Button
                    key={dir}
                    variant={selectedDirection === dir ? 'default' : 'outline'}
                    onClick={() => setSelectedDirection(dir)}
                    size="sm"
                  >
                    {dir === 'north' && 'شمال'}
                    {dir === 'south' && 'جنوب'}
                    {dir === 'east' && 'شرق'}
                    {dir === 'west' && 'غرب'}
                  </Button>
                ))}
              </div>
            </Card>

            {/* مرحله کالیبراسیون */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">مرحله کالیبراسیون</h3>
              <Tabs value={calibrationStep} onValueChange={(v) => setCalibrationStep(v as CalibrationStep)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="direction">منطقه اصلی</TabsTrigger>
                  <TabsTrigger value="violation">مناطق تخلف</TabsTrigger>
                </TabsList>
              </Tabs>

              {calibrationStep === 'violation' && (
                <div className="mt-4 space-y-2">
                  <Label>نوع تخلف</Label>
                  {violationTypes.map((vType) => (
                    <Button
                      key={vType.id}
                      variant={selectedViolationType === vType.id ? 'default' : 'outline'}
                      onClick={() => setSelectedViolationType(vType.id)}
                      size="sm"
                      className="w-full justify-start"
                      style={{
                        backgroundColor: selectedViolationType === vType.id ? vType.color : undefined,
                        borderColor: vType.color
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full ml-2"
                        style={{ backgroundColor: vType.color }}
                      />
                      {vType.name}
                    </Button>
                  ))}
                </div>
              )}
            </Card>

            {/* ابزارهای رسم */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">ابزارهای رسم</h3>
              <div className="space-y-2">
                <Button
                  variant={activeTool === 'select' ? 'default' : 'outline'}
                  onClick={() => setActiveTool('select')}
                  className="w-full justify-start"
                >
                  <MousePointer2 className="w-4 h-4 ml-2" />
                  انتخاب
                </Button>
                <Button
                  variant={activeTool === 'rectangle' ? 'default' : 'outline'}
                  onClick={() => setActiveTool('rectangle')}
                  className="w-full justify-start"
                >
                  <Square className="w-4 h-4 ml-2" />
                  مستطیل
                </Button>
                <Button
                  variant={activeTool === 'polygon' ? 'default' : 'outline'}
                  onClick={() => setActiveTool('polygon')}
                  className="w-full justify-start"
                >
                  <Pentagon className="w-4 h-4 ml-2" />
                  چندضلعی
                </Button>
                
                {activeTool === 'polygon' && isDrawing && (
                  <Button
                    onClick={finishPolygon}
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    اتمام چندضلعی ({currentPoints.length} نقطه)
                  </Button>
                )}
              </div>
            </Card>

            {/* کنترل‌های نمایش */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">نمایش لایه‌ها</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>مناطق اصلی</Label>
                  <Switch
                    checked={showDirectionMasks}
                    onCheckedChange={setShowDirectionMasks}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>مناطق تخلف</Label>
                  <Switch
                    checked={showViolationMasks}
                    onCheckedChange={setShowViolationMasks}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Label className="mb-2 block">بزرگنمایی: {zoom.toFixed(1)}x</Label>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
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
                    size="sm"
                    variant="outline"
                    onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* عملیات */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">عملیات</h3>
              <div className="space-y-2">
                <Button
                  onClick={deleteSelectedShape}
                  disabled={!selectedShape}
                  variant="destructive"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف منطقه انتخاب شده
                </Button>
                <Button
                  onClick={saveCalibration}
                  size="sm"
                  className="w-full justify-start bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 ml-2" />
                  ذخیره کالیبراسیون
                </Button>
              </div>
            </Card>

            {/* لیست مناطق */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">مناطق تعریف شده</h3>
              
              {directionShapes.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-2">مناطق اصلی</p>
                  {directionShapes.map(shape => (
                    <div
                      key={shape.id}
                      className={`p-2 mb-2 rounded cursor-pointer ${
                        selectedShape === shape.id ? 'bg-blue-100 border border-blue-300' : 'bg-slate-50'
                      }`}
                      onClick={() => setSelectedShape(shape.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: shape.color }}
                        />
                        <span className="text-sm">{shape.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {violationShapes.length > 0 && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">مناطق تخلف</p>
                  {violationShapes.map(shape => (
                    <div
                      key={shape.id}
                      className={`p-2 mb-2 rounded cursor-pointer ${
                        selectedShape === shape.id ? 'bg-blue-100 border border-blue-300' : 'bg-slate-50'
                      }`}
                      onClick={() => setSelectedShape(shape.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: shape.color }}
                        />
                        <span className="text-sm">{shape.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {directionShapes.length === 0 && violationShapes.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  هنوز منطقه‌ای تعریف نشده
                </p>
              )}
            </Card>
          </div>

          {/* ستون چپ - کانواس */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-lg">
                  کالیبراسیون {calibrationStep === 'direction' ? 'منطقه اصلی' : 'مناطق تخلف'} - جهت{' '}
                  {selectedDirection === 'north' && 'شمال'}
                  {selectedDirection === 'south' && 'جنوب'}
                  {selectedDirection === 'east' && 'شرق'}
                  {selectedDirection === 'west' && 'غرب'}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {activeTool === 'select' && 'حالت انتخاب'}
                    {activeTool === 'rectangle' && 'رسم مستطیل'}
                    {activeTool === 'polygon' && 'رسم چندضلعی'}
                  </Badge>
                </div>
              </div>

              <div
                ref={containerRef}
                className="relative bg-slate-900 rounded-lg overflow-hidden"
                style={{ height: '700px' }}
              >
                <canvas
                  ref={canvasRef}
                  width={1200}
                  height={700}
                  onClick={handleCanvasClick}
                  className="cursor-crosshair"
                  style={{ width: '100%', height: '100%' }}
                />
                
                {isDrawing && activeTool === 'polygon' && (
                  <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg">
                    <p className="text-sm">
                      {currentPoints.length} نقطه - برای اتمام دکمه "اتمام چندضلعی" را بزنید
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-slate-700">
                  💡 <strong>راهنما:</strong>{' '}
                  {activeTool === 'select' && 'روی منطقه‌ها کلیک کنید تا آنها را انتخاب کنید'}
                  {activeTool === 'rectangle' && 'یک نقطه برای شروع و یک نقطه برای اتمام مستطیل کلیک کنید'}
                  {activeTool === 'polygon' && 'برای هر گوشه چندضلعی کلیک کنید و سپس دکمه "اتمام چندضلعی" را بزنید'}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
