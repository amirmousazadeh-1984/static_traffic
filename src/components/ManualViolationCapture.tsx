// src/components/ManualViolationCapture.tsx

import React, { useState, useRef, useCallback } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Aperture, Save, MousePointer2, Crop } from 'lucide-react';
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
  const t = translations[language];
  const isRTL = language === 'fa';

  const cameras = mockCameras[intersection.id] || [];

  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(
    cameras.length > 0 ? cameras[0].id : null
  );
  const [selectedViolationType, setSelectedViolationType] = useState<string>('red-light');
  const [plateNumber, setPlateNumber] = useState('');
  const [snapshotTaken, setSnapshotTaken] = useState(false);

  // حالت‌های Crop
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
    { id: 'red-light', name: language === 'fa' ? 'عبور از چراغ قرمز' : 'Red Light Violation' },
    { id: 'crosswalk', name: language === 'fa' ? 'تجاوز به خط عابر پیاده' : 'Crosswalk Violation' },
    { id: 'speed', name: language === 'fa' ? 'سرعت غیرمجاز' : 'Speeding' },
    { id: 'lane-change', name: language === 'fa' ? 'تغییر خط ممنوع' : 'Illegal Lane Change' },
    { id: 'illegal-parking', name: language === 'fa' ? 'پارک در محل ممنوع' : 'Illegal Parking' },
  ];

  const selectedCamera = cameras.find(c => c.id === selectedCameraId);

  // تابع گرفتن اسنپ‌شات از منطقه انتخاب‌شده
  const takeCroppedSnapshot = useCallback(() => {
    if (!completedCrop || !canvasRef.current || !imgRef.current) {
      toast.error('منطقه‌ای انتخاب نشده یا تصویر بارگذاری نشده');
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
    toast.success('عکس از منطقه انتخاب‌شده گرفته شد!', { duration: 4000 });
  }, [completedCrop]);

  const saveViolation = () => {
    if (!snapshotTaken) {
      toast.error('ابتدا از منطقه عکس بگیرید');
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

    toast.success(t.violationSaved || 'تخلف با موفقیت ثبت شد', { duration: 5000 });
    setSnapshotTaken(false);
    setPlateNumber('');
    setCrop({ unit: '%', width: 30, height: 30, x: 35, y: 35 });
  };

  return (
    <div className="min-h-[calc(100vh-140px)] bg-slate-100 dark:bg-slate-900 p-4">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t.manualViolationTitle || 'ثبت دستی تخلف'} — {intersection.name}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            با زوم و انتخاب منطقه دقیق، از خودرو متخلف عکس بگیرید.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* نمایش تصویر با قابلیت Crop */}
          <div className="lg:col-span-2">
            <Card className="p-6 shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-medium">{t.selectCamera || 'انتخاب دوربین'}</Label>
                {selectedCamera && (
                  <Badge variant="secondary">
                    {selectedCamera.type === 'ptz' ? 'PTZ' : 'ثابت'} —{' '}
                    {selectedCamera.direction ? selectedCamera.direction : '—'}
                  </Badge>
                )}
              </div>

              <Select value={selectedCameraId || ''} onValueChange={setSelectedCameraId}>
                <SelectTrigger className="w-full mb-6">
                  <SelectValue placeholder="دوربینی انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {cameras.map(cam => (
                    <SelectItem key={cam.id} value={cam.id}>
                      {cam.name} ({cam.type === 'ptz' ? 'PTZ' : 'ثابت'}
                      {cam.direction ? ` - ${cam.direction}` : ''})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                {intersection.imageUrl ? (
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={undefined} // آزاد برای انتخاب هر نسبت
                    ruleOfThirds
                  >
                    <img
                      ref={imgRef}
                      src={intersection.imageUrl}
                      alt="نمای دوربین"
                      className="max-w-full block"
                      draggable={false}
                      onLoad={() => setCompletedCrop(null)}
                    />
                  </ReactCrop>
                ) : (
                  <div className="aspect-video flex items-center justify-center text-slate-500">
                    تصویری موجود نیست
                  </div>
                )}

                {snapshotTaken && (
                  <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    عکس منطقه گرفته شد
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={takeCroppedSnapshot}
                  disabled={!completedCrop || !intersection.imageUrl}
                  className="flex-1 gap-2"
                  size="lg"
                  variant="default"
                >
                  <Crop className="w-5 h-5" />
                  گرفتن عکس از منطقه انتخاب‌شده
                </Button>
              </div>
            </Card>
          </div>

          {/* پنل راست */}
          <div className="flex flex-col gap-4">
            <Card className="p-5 shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <h3 className="text-base font-semibold mb-4">نوع تخلف</h3>
              <div className="grid grid-cols-1 gap-3">
                {violationTypes.map(vt => (
                  <Button
                    key={vt.id}
                    variant={selectedViolationType === vt.id ? 'default' : 'outline'}
                    className="justify-start text-sm"
                    onClick={() => setSelectedViolationType(vt.id)}
                  >
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#ef4444' }} />
                    {vt.name}
                  </Button>
                ))}
              </div>
            </Card>

            <Card className="p-5 shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <Label htmlFor="plate" className="mb-2 block text-sm">
                شماره پلاک (اختیاری)
              </Label>
              <Input
                id="plate"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder={language === 'fa' ? 'مثلاً: ایران ۱۲ - ۳۴۵ ب ۱۲' : 'e.g. IR 12-345 B12'}
                dir={isRTL ? 'rtl' : 'ltr'}
              />

              <Button
                onClick={saveViolation}
                disabled={!snapshotTaken}
                className="w-full mt-6 gap-2"
                size="lg"
              >
                <Save className="w-5 h-5" />
                ذخیره تخلف
              </Button>
            </Card>
          </div>
        </div>

        {/* Canvas مخفی برای Crop */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}