import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Intersection } from '../types';
import { mockCameras, mockDirections, mockViolations, mockPTZPresets } from '../data/mockDatabase';
import { 
  Camera, 
  MapPin, 
  Activity, 
  AlertTriangle, 
  Monitor,
  Wifi,
  WifiOff,
  Settings,
  Grid3x3,
  Video,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';

interface IntersectionDetailsProps {
  intersection: Intersection;
  onStartZoneCalibration: () => void;
  onStartPTZCalibration: () => void;
  onOpenDashboard: () => void;
}

export function IntersectionDetails({
  intersection,
  onStartZoneCalibration,
  onStartPTZCalibration,
  onOpenDashboard
}: IntersectionDetailsProps) {
  const cameras = mockCameras[intersection.id] || [];
  const directions = mockDirections[intersection.id] || [];
  const ptzPresets = mockPTZPresets[intersection.id] || [];
  const violations = mockViolations.filter(v => v.intersectionId === intersection.id);

  const recentViolations = violations.slice(0, 5);
  const verifiedCount = violations.filter(v => v.status === 'verified').length;
  const pendingCount = violations.filter(v => v.status === 'pending').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'تایید شده';
      case 'pending':
        return 'در انتظار';
      case 'rejected':
        return 'رد شده';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)]">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* هدر */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{intersection.name}</h2>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>{intersection.location}</span>
              </div>
            </div>
            <Button
              onClick={onOpenDashboard}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700"
            >
              <Monitor className="w-5 h-5 ml-2" />
              باز کردن داشبورد نظارت
            </Button>
          </div>
        </div>

        {/* آمار سریع */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 mb-1">دوربین‌ها</p>
                <p className="text-3xl font-bold text-blue-900">{cameras.length}</p>
              </div>
              <Camera className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">تخلفات تایید شده</p>
                <p className="text-3xl font-bold text-green-900">{verifiedCount}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 mb-1">در انتظار بررسی</p>
                <p className="text-3xl font-bold text-orange-900">{pendingCount}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-600 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 mb-1">Preset های PTZ</p>
                <p className="text-3xl font-bold text-purple-900">{ptzPresets.length}</p>
              </div>
              <Video className="w-10 h-10 text-purple-600 opacity-50" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ستون چپ - دوربین‌ها و جهات */}
          <div className="lg:col-span-2 space-y-6">
            {/* دوربین‌ها */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  دوربین‌های نصب شده
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cameras.map((camera) => (
                  <div
                    key={camera.id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {camera.type === 'ptz' ? (
                          <Video className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Camera className="w-5 h-5 text-blue-600" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-900">{camera.name}</p>
                          <p className="text-xs text-slate-500">{camera.type === 'ptz' ? 'دوربین چرخان' : 'دوربین ثابت'}</p>
                        </div>
                      </div>
                      {camera.status === 'active' ? (
                        <Wifi className="w-5 h-5 text-green-600" />
                      ) : (
                        <WifiOff className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p className="flex items-center gap-2">
                        <span className="text-slate-500">IP:</span>
                        <span className="font-mono">{camera.ipAddress}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-slate-500">جهت:</span>
                        <Badge variant="outline" className="text-xs">
                          {camera.direction === 'north' && 'شمال'}
                          {camera.direction === 'south' && 'جنوب'}
                          {camera.direction === 'east' && 'شرق'}
                          {camera.direction === 'west' && 'غرب'}
                        </Badge>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* جهات و مناطق */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Grid3x3 className="w-5 h-5 text-blue-600" />
                  جهات و مناطق تعریف شده
                </h3>
                <Button onClick={onStartZoneCalibration} variant="outline" size="sm">
                  <Settings className="w-4 h-4 ml-2" />
                  کالیبراسیون مناطق
                </Button>
              </div>

              <div className="space-y-3">
                {directions.map((direction) => (
                  <div
                    key={direction.id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{direction.name}</p>
                          <p className="text-sm text-slate-600">
                            {direction.violationZonesCount} منطقه تخلف تعریف شده
                          </p>
                        </div>
                      </div>
                      {direction.maskDefined ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3 ml-1" />
                          کالیبره شده
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-700">
                          <AlertTriangle className="w-3 h-3 ml-1" />
                          نیاز به کالیبراسیون
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* کالیبراسیون PTZ */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-600" />
                  Preset های دوربین PTZ
                </h3>
                <Button onClick={onStartPTZCalibration} variant="outline" size="sm">
                  <Settings className="w-4 h-4 ml-2" />
                  کالیبراسیون PTZ
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {ptzPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-3 bg-purple-50 rounded-lg border border-purple-200"
                  >
                    <p className="font-semibold text-sm text-slate-900 mb-2">{preset.name}</p>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p>Pan: {preset.pan}° | Tilt: {preset.tilt}°</p>
                      <p>Zoom: {preset.zoom}x | Focus: {(preset.focus * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ستون راست - تخلفات اخیر */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-lg flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                تخلفات اخیر
              </h3>

              <div className="space-y-3">
                {recentViolations.map((violation) => (
                  <div
                    key={violation.id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={violation.imageUrl}
                        alt="تخلف"
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 mb-1 truncate">
                          {violation.plateNumber}
                        </p>
                        <p className="text-xs text-slate-600 mb-1">{violation.violationType}</p>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(violation.status)}
                          <span className="text-xs text-slate-600">{getStatusText(violation.status)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 pt-2 border-t">
                      <p>{violation.date} - {violation.time}</p>
                    </div>
                  </div>
                ))}

                {recentViolations.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>تخلفی ثبت نشده است</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
