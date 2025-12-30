// src/components/ManualViolationCapture.tsx

import React, { useState, useRef, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Crop, Save, ZoomIn, ZoomOut, Home, Move } from 'lucide-react';
import ReactCrop, { Crop as CropType } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { toast } from 'sonner';
import { Intersection } from '../types';
import { mockCameras } from '../data/mockDatabase';
import { translations, type Language } from '../locales';

interface ManualViolationCaptureProps {
  intersection: Intersection;
  language: Language;
}

export function ManualViolationCapture({ intersection, language }: ManualViolationCaptureProps) {
  const t = translations[language] || {};
  const isRTL = language === 'fa';

  const cameras = mockCameras[intersection.id] || [];

  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(
    cameras.length > 0 ? cameras[0].id : null
  );
  const [selectedViolationType, setSelectedViolationType] = useState<string>('red-light');
  const [plateNumber, setPlateNumber] = useState('');
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  // حالت‌های زوم و پن
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [crop, setCrop] = useState<CropType>({
    unit: '%',
    width: 30,
    height: 30,
    x: 35,
    y: 35,
  });
  const [completedCrop, setCompletedCrop] = useState<CropType | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const violationTypes = [
    { id: 'red-light', name: language === 'fa' ? 'عبور از چراغ قرمز' : 'Red Light Violation', color: '#ef4444' },
    { id: 'crosswalk', name: language === 'fa' ? 'تجاوز به خط عابر پیاده' : 'Crosswalk Violation', color: '#f97316' },
    { id: 'speed', name: language === 'fa' ? 'سرعت غیرمجاز' : 'Speeding', color: '#8b5cf6' },
    { id: 'lane-change', name: language === 'fa' ? 'تغییر خط ممنوع' : 'Illegal Lane Change', color: '#ec4899' },
    { id: 'illegal-parking', name: language === 'fa' ? 'پارک در محل ممنوع' : 'Illegal Parking', color: '#10b981' },
  ];

  const selectedCamera = cameras.find(c => c.id === selectedCameraId);

  // زوم با اسکرول
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.5, Math.min(6, prev * delta)));
  }, []);

  // درگ برای جابجایی
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  // کنترل‌های زوم
  const zoomIn = () => setScale(prev => Math.min(6, prev * 1.2));
  const zoomOut = () => setScale(prev => Math.max(0.5, prev / 1.2));
  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const takeCroppedSnapshot = useCallback(() => {
    if (!completedCrop || !canvasRef.current || !imgRef.current) {
      toast.error('لطفاً یک منطقه روی تصویر انتخاب کنید');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    setSnapshotTaken(true);
    toast.success('عکس از منطقه انتخاب‌شده گرفته شد', { duration: 4000 });
  }, [completedCrop]);

  const saveViolation = () => {
    if (!snapshotTaken) {
      toast.error('ابتدا عکس بگیرید');
      return;
    }

    const imageDataUrl = canvasRef.current?.toDataURL('image/jpeg', 0.95);

    console.log('تخلف دستی ثبت شد:', {
      intersectionId: intersection.id,
      cameraId: selectedCameraId,
      violationType: selectedViolationType,
      plateNumber: plateNumber || null,
      timestamp: new Date().toISOString(),
      croppedImage: imageDataUrl,
      cropArea: completedCrop,
    });

    toast.success('تخلف با موفقیت ثبت شد', { duration: 5000 });
    setSnapshotTaken(false);
    setPlateNumber('');
    setCrop({ unit: '%', width: 30, height: 30, x: 35, y: 35 });
    setCompletedCrop(null);
    resetView();
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-100 dark:bg-slate-900 p-4">
      <div className="max-w-[1800px] mx-auto">
        {/* هدر */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            ثبت دستی تخلف — {intersection.name}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            با زوم، جابجایی و انتخاب منطقه دقیق، از خودرو متخلف عکس بگیرید.
          </p>
        </div>

        {/* گرید اصلی */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full" style={{ height: '80vh' }}>
          {/* ستون چپ: تصویر با کنترل‌های روی تصویر */}
          <div className="lg:col-span-2 flex flex-col h-full">
            <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl flex flex-col h-full">
              {/* انتخاب دوربین */}
              <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    انتخاب دوربین
                  </Label>
                
                </div>
      <Select  onValueChange={setSelectedCameraId} 
    align={isRTL ? 'end' : 'start'}  
    dir={isRTL ? 'rtl' : 'ltr'} >
  <SelectTrigger className="w-full" >
    <SelectValue placeholder="دوربینی انتخاب کنید" />
  </SelectTrigger>
  <SelectContent 
    className="z-50 min-w-[260px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-2xl rounded-lg"
    sideOffset={8}
    align={isRTL ? 'end' : 'start'}  
    dir={isRTL ? 'rtl' : 'ltr'}       
  >
    {cameras.length > 0 ? (
      cameras.map(cam => (
        <SelectItem 
          key={cam.id} 
          value={cam.id}
          className="text-sm py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700"
        >
          <div className={`flex items-center ${isRTL ? 'justify-between flex-row-reverse' : 'justify-between'} gap-3`}>
            <span className="font-medium truncate">{cam.name}</span>
            <Badge 
              variant="outline" 
              className={`text-[10px] ${isRTL ? 'mr-auto' : 'ml-auto'} px-2 py-0.5`}
            >
              {cam.type === 'ptz' ? 'PTZ' : 'ثابت'}
              {cam.direction ? ` — ${cam.direction}` : ''}
            </Badge>
          </div>
        </SelectItem>
      ))
    ) : (
      <div className="py-8 text-center text-sm text-slate-500">
        دوربینی تعریف نشده
      </div>
    )}
  </SelectContent>
</Select>
              </div>


              {/* تصویر بزرگ + کنترل‌های روی تصویر (بالا چپ/راست بسته به زبان) */}
              <div className="flex-1 px-6 py-1 min-h-0 relative">
                <div
                  className="relative bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 h-full shadow-inner"
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* تصویر با زوم و پن */}
                  {intersection.imageUrl ? (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                        transition: isPanning ? 'none' : 'transform 0.15s ease-out',
                        transformOrigin: 'center center',
                      }}
                    >
                      <ReactCrop
                        crop={crop}
                        onChange={c => setCrop(c)}
                        onComplete={c => setCompletedCrop(c)}
                        aspect={undefined}
                        ruleOfThirds={scale > 1.2}
                      >
                        <img
                          ref={imgRef}
                          src={intersection.imageUrl}
                          alt="نمای دوربین"
                          className="max-w-none shadow-2xl rounded-lg"
                          draggable={false}
                        />
                      </ReactCrop>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500">
                      تصویری موجود نیست
                    </div>
                  )}

                  {/* کنترل‌های زوم و جابجایی — یک باکس واحد در بالا چپ/راست */}
                  <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} bg-black/70 backdrop-blur-md rounded-xl px-3 shadow-2xl border border-slate-600`}>
                    <div className="flex flex-col gap-3">
                      {/* دکمه‌های زوم */}
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={zoomOut} className="h-9 w-9 text-white hover:bg-white/20">
                          <ZoomOut className="w-5 h-5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={zoomIn} className="h-9 w-9 text-white hover:bg-white/20">
                          <ZoomIn className="w-5 h-5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={resetView} className="h-9 w-9 text-white hover:bg-white/20">
                          <Home className="w-5 h-5" />
                                              </Button>
                                               <div className="flex items-center gap-2 text-white text-xs bg-white/10 rounded-lg px-3 py-1.5">
                        <Move className="w-4 h-4" />
                       
                      </div>
                      </div>

             
                     
                    </div>
                  </div>

                  {/* نشانگر عکس گرفته شده — وسط بالا */}
                  {snapshotTaken && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-2xl border border-green-400">
                      عکس گرفته شد ✓
                    </div>
                  )}
                </div>
              </div>
              {/* دکمه گرفتن عکس */}
              <div className="px-6 pb-6 flex-shrink-0">
                <Button
                  onClick={takeCroppedSnapshot}
                  disabled={!completedCrop || !intersection.imageUrl}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Crop className="w-5 h-5" />
                  گرفتن عکس از منطقه انتخاب‌شده
                </Button>
              </div>
            </Card>
          </div>

          {/* ستون راست */}
          <div className="flex flex-col gap-6 h-full">
            <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl flex flex-col flex-1 min-h-0">
              <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  نوع تخلف
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-5 pt-4 space-y-3 text-[11px]">
                {violationTypes.map(vt => (
                  <div
                    key={vt.id}
                    onClick={() => setSelectedViolationType(vt.id)}
                    className={`p-3 rounded-md cursor-pointer flex items-center gap-3 transition-colors ${
                      selectedViolationType === vt.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700'
                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: vt.color }} />
                    <span className="text-slate-900 dark:text-slate-100 truncate">{vt.name}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-5 flex-shrink-0">
              <Label htmlFor="plate" className="text-sm font-medium mb-3 block">
                شماره پلاک (اختیاری)
              </Label>
              <Input
                id="plate"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder={language === 'fa' ? 'وارد کردن شماره پلاک' : 'Enter Plate Number'}
                dir={isRTL ? 'rtl' : 'ltr'}
                className="mb-6"
              />
              <Button
                onClick={saveViolation}
                disabled={!snapshotTaken}
                className="w-full gap-2"
                size="lg"
              >
                <Save className="w-5 h-5" />
                ذخیره تخلف
              </Button>
            </Card>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}