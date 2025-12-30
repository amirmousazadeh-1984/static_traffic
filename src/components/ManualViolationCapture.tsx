// src/components/ManualViolationCapture.tsx

import React, { useState, useRef, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Crop, Save } from 'lucide-react';
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

  const [crop, setCrop] = useState<CropType>({
    unit: '%',
    width: 35,
    height: 35,
    x: 32.5,
    y: 32.5,
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
    setCrop({ unit: '%', width: 35, height: 35, x: 32.5, y: 32.5 });
    setCompletedCrop(null);
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
            با انتخاب دوربین و کشیدن منطقه روی تصویر، از خودرو متخلف عکس بگیرید.
          </p>
        </div>

        {/* گرید اصلی — دقیقاً مثل ZoneCalibration */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" >
          {/* ستون چپ: تصویر و Crop — دقیقاً مثل canvas در ZoneCalibration */}
          <div className="lg:col-span-2" style={{ height: '80vh' }}>
            <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl flex flex-col h-full">
              {/* هدر: انتخاب دوربین */}
              <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium">انتخاب دوربین</Label>
                  {selectedCamera && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedCamera.type === 'ptz' ? 'PTZ' : 'ثابت'}
                      {selectedCamera.direction ? ` — ${selectedCamera.direction}` : ''}
                    </Badge>
                  )}
                </div>
                <Select value={selectedCameraId || ''} onValueChange={setSelectedCameraId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="دوربینی انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {cameras.map(cam => (
                      <SelectItem key={cam.id} value={cam.id}>
                        {cam.name} ({cam.type === 'ptz' ? 'PTZ' : 'ثابت'}
                        {cam.direction ? ` — ${cam.direction}` : ''})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* تصویر اصلی با Crop */}
              <div className="flex-1 p-6">
                <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-700 h-full">
                  {intersection.imageUrl ? (
                    <ReactCrop
                      crop={crop}
                      onChange={c => setCrop(c)}
                      onComplete={c => setCompletedCrop(c)}
                      aspect={undefined}
                      ruleOfThirds
                    >
                      <img
                        ref={imgRef}
                        src={intersection.imageUrl}
                        alt="نمای دوربین"
                        className="block max-w-full max-h-full object-contain mx-auto"
                        draggable={false}
                      />
                    </ReactCrop>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500">
                      تصویری موجود نیست
                    </div>
                  )}

                  {snapshotTaken && (
                    <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                      عکس گرفته شد
                    </div>
                  )}
                </div>
              </div>

              {/* دکمه گرفتن عکس — پایین کارت */}
              <div className="p-6 pt-0">
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

          {/* ستون راست: تنظیمات — دقیقاً مثل پنل راست در ZoneCalibration */}
          <div className="flex flex-col gap-5" style={{ height: '80vh' }}>
            {/* نوع تخلف — با اسکرول داخلی */}
            <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl flex flex-col h-full">
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
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
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: vt.color }}
                    />
                    <span className="text-slate-900 dark:text-slate-100 truncate">
                      {vt.name}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* پلاک و ذخیره — پایین صفحه */}
            <Card className="shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-5">
              <Label htmlFor="plate" className="text-sm font-medium mb-3 block">
                شماره پلاک (اختیاری)
              </Label>
              <Input
                id="plate"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder={language === 'fa' ? 'مثلاً: ایران ۱۲ - ۳۴۵ ب ۱۲' : 'e.g. IR 12-345 B12'}
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

        {/* Canvas مخفی */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}