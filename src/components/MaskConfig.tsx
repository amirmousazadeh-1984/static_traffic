import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Square, 
  Save,
  RotateCcw,
  Settings2,
  MapPin
} from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Mask {
  id: string;
  name: string;
  direction: string;
  color: string;
  enabled: boolean;
  violationType: string;
  area: { x: number; y: number; width: number; height: number };
}

export function MaskConfig() {
  const [selectedCamera, setSelectedCamera] = useState('north');
  const [drawingMode, setDrawingMode] = useState(false);
  const [masks, setMasks] = useState<Mask[]>([
    {
      id: '1',
      name: 'منطقه عبور از چراغ قرمز',
      direction: 'شمال',
      color: '#ef4444',
      enabled: true,
      violationType: 'red_light',
      area: { x: 20, y: 30, width: 30, height: 40 }
    },
    {
      id: '2',
      name: 'خط عابر پیاده',
      direction: 'شمال',
      color: '#f59e0b',
      enabled: true,
      violationType: 'crosswalk',
      area: { x: 55, y: 60, width: 25, height: 15 }
    }
  ]);

  const cameraDirections = [
    { value: 'north', label: 'دوربین شمال' },
    { value: 'south', label: 'دوربین جنوب' },
    { value: 'east', label: 'دوربین شرق' },
    { value: 'west', label: 'دوربین غرب' }
  ];

  const violationTypes = [
    { value: 'red_light', label: 'عبور از چراغ قرمز', color: '#ef4444' },
    { value: 'crosswalk', label: 'توقف در خط عابر', color: '#f59e0b' },
    { value: 'wrong_lane', label: 'تغییر خط غیرمجاز', color: '#8b5cf6' },
    { value: 'no_parking', label: 'پارک غیرمجاز', color: '#ec4899' },
    { value: 'speeding', label: 'سرعت غیرمجاز', color: '#ef4444' }
  ];

  const toggleMask = (id: string) => {
    setMasks(masks.map(mask => 
      mask.id === id ? { ...mask, enabled: !mask.enabled } : mask
    ));
  };

  const deleteMask = (id: string) => {
    setMasks(masks.filter(mask => mask.id !== id));
  };

  const currentMasks = masks.filter(m => {
    const directionMap: Record<string, string> = {
      north: 'شمال',
      south: 'جنوب',
      east: 'شرق',
      west: 'غرب'
    };
    return m.direction === directionMap[selectedCamera];
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">تنظیمات ماسک‌بندی مناطق</h2>
          <p className="text-sm text-gray-600 mt-1">
            تعریف مناطق تخلف و پیکربندی دوربین‌های ثابت
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            بازنشانی
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4" />
            ذخیره تغییرات
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera View and Drawing Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>نمای دوربین و ترسیم ماسک</CardTitle>
                <div className="flex items-center gap-3">
                  <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cameraDirections.map(dir => (
                        <SelectItem key={dir.value} value={dir.value}>
                          {dir.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Drawn Masks */}
                {currentMasks.map(mask => mask.enabled && (
                  <div
                    key={mask.id}
                    className="absolute border-2 backdrop-blur-sm cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      left: `${mask.area.x}%`,
                      top: `${mask.area.y}%`,
                      width: `${mask.area.width}%`,
                      height: `${mask.area.height}%`,
                      borderColor: mask.color,
                      backgroundColor: `${mask.color}20`
                    }}
                  >
                    <div 
                      className="absolute top-1 right-1 px-2 py-1 rounded text-xs text-white"
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
                      <p className="text-xs text-gray-600">برای انصراف دکمه ESC را فشار دهید</p>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-xs">
                  <div className="flex items-center justify-between">
                    <span>برای ویرایش ماسک روی آن کلیک کنید</span>
                    <span>{currentMasks.length} ماسک فعال</span>
                  </div>
                </div>
              </div>

              {/* Drawing Tools */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600">نوع تخلف</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="انتخاب نوع تخلف" />
                      </SelectTrigger>
                      <SelectContent>
                        {violationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: type.color }}
                              />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">نام ماسک</Label>
                    <input
                      type="text"
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="مثال: منطقه عبور از چراغ قرمز"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PTZ Configuration */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                تنظیمات دوربین PTZ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">سرعت چرخش</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">آهسته</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="fast">سریع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">سرعت زوم</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">آهسته</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="fast">سریع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">حداکثر زوم</Label>
                  <Select defaultValue="10x">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5x">5x</SelectItem>
                      <SelectItem value="10x">10x</SelectItem>
                      <SelectItem value="20x">20x</SelectItem>
                      <SelectItem value="30x">30x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">زمان ضبط (ثانیه)</Label>
                  <Select defaultValue="10">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Masks List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>ماسک‌های تعریف شده</CardTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  جدید
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentMasks.map(mask => (
                  <div
                    key={mask.id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: mask.color }}
                        />
                        <span className="text-sm font-medium">{mask.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleMask(mask.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          {mask.enabled ? (
                            <Eye className="w-4 h-4 text-blue-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteMask(mask.id)}
                          className="p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>نوع تخلف:</span>
                        <Badge variant="secondary" className="text-xs">
                          {violationTypes.find(t => t.value === mask.violationType)?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>وضعیت:</span>
                        <Badge className={mask.enabled ? 'bg-green-500' : 'bg-gray-400'}>
                          {mask.enabled ? 'فعال' : 'غیرفعال'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}

                {currentMasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">هیچ ماسکی تعریف نشده</p>
                    <p className="text-xs mt-1">برای شروع دکمه "جدید" را کلیک کنید</p>
                  </div>
                )}
              </div>

              {/* Summary */}
              {currentMasks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-600 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>تعداد کل ماسک‌ها:</span>
                      <span className="font-medium text-gray-900">{masks.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>ماسک‌های فعال:</span>
                      <span className="font-medium text-green-600">
                        {masks.filter(m => m.enabled).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>ماسک‌های غیرفعال:</span>
                      <span className="font-medium text-gray-400">
                        {masks.filter(m => !m.enabled).length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
