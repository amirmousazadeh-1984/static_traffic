import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Home,
  Focus,
  RotateCw,
  Play,
  Square,
  Camera as CameraIcon,
  Video,
  Settings
} from 'lucide-react';

export function PTZControl() {
  const [position, setPosition] = useState({ pan: 0, tilt: 0 });
  const [zoom, setZoom] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [autoTracking, setAutoTracking] = useState(true);
  const [focus, setFocus] = useState(50);

  const presets = [
    { id: 1, name: 'شمال چهارراه', pan: 0, tilt: 0 },
    { id: 2, name: 'جنوب چهارراه', pan: 180, tilt: 0 },
    { id: 3, name: 'شرق چهارراه', pan: 90, tilt: 0 },
    { id: 4, name: 'غرب چهارراه', pan: -90, tilt: 0 },
    { id: 5, name: 'نمای کلی', pan: 0, tilt: 45 }
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

  const goToPreset = (preset: typeof presets[0]) => {
    setPosition({ pan: preset.pan, tilt: preset.tilt });
  };

  const goHome = () => {
    setPosition({ pan: 0, tilt: 0 });
    setZoom(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">کنترل دوربین PTZ</h2>
          <p className="text-sm text-gray-600 mt-1">
            کنترل دستی جهت، زوم و تنظیمات دوربین چرخان
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={autoTracking ? 'default' : 'outline'}
            className="gap-2"
            onClick={() => setAutoTracking(!autoTracking)}
          >
            <RotateCw className="w-4 h-4" />
            {autoTracking ? 'ردیابی خودکار فعال' : 'ردیابی خودکار'}
          </Button>
          <Button
            variant={isRecording ? 'destructive' : 'outline'}
            className="gap-2"
            onClick={() => setIsRecording(!isRecording)}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4" />
                توقف ضبط
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                شروع ضبط
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera View */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>نمای زنده دوربین</CardTitle>
                <div className="flex items-center gap-2">
                  {isRecording && (
                    <Badge className="bg-red-500 animate-pulse">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                        در حال ضبط
                      </span>
                    </Badge>
                  )}
                  {autoTracking && (
                    <Badge className="bg-blue-500">
                      ردیابی خودکار
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <img 
                  src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80" 
                  alt="PTZ Camera View"
                  className="w-full h-full object-cover"
                  style={{
                    transform: `scale(${1 + (zoom - 1) * 0.1})`
                  }}
                />
                
                {/* Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative">
                    <div className="w-16 h-16 border-2 border-red-500 rounded-full opacity-50"></div>
                    <div className="absolute top-1/2 left-1/2 w-8 h-px bg-red-500 -translate-x-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-px h-8 bg-red-500 -translate-y-1/2"></div>
                  </div>
                </div>

                {/* Camera Info Overlay */}
                <div className="absolute top-4 left-4 right-4 flex justify-between">
                  <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-xs space-y-1">
                    <div>Pan: {position.pan.toFixed(0)}°</div>
                    <div>Tilt: {position.tilt.toFixed(0)}°</div>
                    <div>Zoom: {zoom}x</div>
                  </div>
                  <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-xs">
                    <div className="flex items-center gap-2">
                      <Focus className="w-3 h-3" />
                      Focus: {focus}%
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-xs">
                  {new Date().toLocaleString('fa-IR')}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="gap-2">
                  <CameraIcon className="w-4 h-4" />
                  اسکرین‌شات
                </Button>
                <Button size="sm" variant="outline" className="gap-2">
                  <Settings className="w-4 h-4" />
                  تنظیمات تصویر
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Presets */}
          <Card>
            <CardHeader>
              <CardTitle>موقعیت‌های ذخیره شده</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {presets.map(preset => (
                  <Button
                    key={preset.id}
                    variant="outline"
                    className="h-auto flex-col items-start p-3 hover:border-blue-500 hover:bg-blue-50"
                    onClick={() => goToPreset(preset)}
                  >
                    <span className="text-xs text-gray-500">#{preset.id}</span>
                    <span className="text-sm font-medium mt-1">{preset.name}</span>
                    <span className="text-xs text-gray-400 mt-1">
                      {preset.pan}° / {preset.tilt}°
                    </span>
                  </Button>
                ))}
                <Button
                  variant="outline"
                  className="h-auto flex-col items-center justify-center p-3 border-dashed hover:border-blue-500 hover:bg-blue-50"
                >
                  <span className="text-2xl">+</span>
                  <span className="text-xs mt-1">ذخیره موقعیت</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* PTZ Joystick */}
          <Card>
            <CardHeader>
              <CardTitle>کنترل جهت (Pan/Tilt)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-16 h-16"
                    onClick={() => handleMove('up')}
                  >
                    <ArrowUp className="w-6 h-6" />
                  </Button>
                </div>
                <div className="flex justify-center gap-2">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-16 h-16"
                    onClick={() => handleMove('left')}
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-16 h-16"
                    onClick={goHome}
                  >
                    <Home className="w-6 h-6" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-16 h-16"
                    onClick={() => handleMove('right')}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </Button>
                </div>
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-16 h-16"
                    onClick={() => handleMove('down')}
                  >
                    <ArrowDown className="w-6 h-6" />
                  </Button>
                </div>
                <div className="pt-4 border-t border-gray-200 text-center text-xs text-gray-600">
                  از دکمه‌های جهت‌دار یا کلیدهای جهت‌نما استفاده کنید
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zoom Control */}
          <Card>
            <CardHeader>
              <CardTitle>کنترل زوم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => handleZoom('out')}
                  >
                    <ZoomOut className="w-5 h-5" />
                    -
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => handleZoom('in')}
                  >
                    <ZoomIn className="w-5 h-5" />
                    +
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">سطح زوم</span>
                    <span className="font-medium">{zoom}x</span>
                  </div>
                  <Slider
                    value={[zoom]}
                    onValueChange={([value]) => setZoom(value)}
                    min={1}
                    max={30}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>1x</span>
                    <span>30x</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Focus Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Focus className="w-5 h-5" />
                کنترل فوکوس
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">فوکوس دستی</span>
                    <span className="font-medium">{focus}%</span>
                  </div>
                  <Slider
                    value={[focus]}
                    onValueChange={([value]) => setFocus(value)}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <Button variant="outline" className="w-full gap-2">
                  <Focus className="w-4 h-4" />
                  فوکوس خودکار
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>وضعیت سیستم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">اتصال دوربین</span>
                  <Badge className="bg-green-500">متصل</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">حالت ردیابی</span>
                  <Badge className={autoTracking ? 'bg-blue-500' : 'bg-gray-400'}>
                    {autoTracking ? 'فعال' : 'غیرفعال'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">وضعیت ضبط</span>
                  <Badge className={isRecording ? 'bg-red-500' : 'bg-gray-400'}>
                    {isRecording ? 'در حال ضبط' : 'متوقف'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">کیفیت سیگنال</span>
                  <span className="font-medium text-green-600">عالی (98%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
