import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ArrowRight,
  Camera,
  Compass,
  Settings,
  Activity,
  Eye,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Intersection, Camera as CameraType, Direction } from '../types';

interface IntersectionDetailsProps {
  intersection: Intersection;
  onBack: () => void;
  onStartCalibration: (type: 'zones' | 'ptz') => void;
  onOpenDashboard: () => void;
}

export function IntersectionDetails({ 
  intersection, 
  onBack, 
  onStartCalibration,
  onOpenDashboard 
}: IntersectionDetailsProps) {
  const cameras: CameraType[] = [
    {
      id: 'cam-001',
      name: 'دوربین ثابت شمال',
      type: 'fixed',
      direction: 'north',
      status: 'active',
      ipAddress: '192.168.1.101'
    },
    {
      id: 'cam-002',
      name: 'دوربین ثابت جنوب',
      type: 'fixed',
      direction: 'south',
      status: 'active',
      ipAddress: '192.168.1.102'
    },
    {
      id: 'cam-003',
      name: 'دوربین ثابت شرق',
      type: 'fixed',
      direction: 'east',
      status: 'active',
      ipAddress: '192.168.1.103'
    },
    {
      id: 'cam-004',
      name: 'دوربین ثابت غرب',
      type: 'fixed',
      direction: 'west',
      status: 'active',
      ipAddress: '192.168.1.104'
    },
    {
      id: 'cam-ptz',
      name: 'دوربین چرخان PTZ',
      type: 'ptz',
      direction: 'north',
      status: 'active',
      ipAddress: '192.168.1.105'
    }
  ];

  const directions: Direction[] = [
    {
      id: 'dir-north',
      name: 'شمال',
      direction: 'north',
      maskDefined: true,
      violationZonesCount: 3
    },
    {
      id: 'dir-south',
      name: 'جنوب',
      direction: 'south',
      maskDefined: true,
      violationZonesCount: 2
    },
    {
      id: 'dir-east',
      name: 'شرق',
      direction: 'east',
      maskDefined: false,
      violationZonesCount: 0
    },
    {
      id: 'dir-west',
      name: 'غرب',
      direction: 'west',
      maskDefined: true,
      violationZonesCount: 2
    }
  ];

  const getDirectionIcon = (direction: string) => {
    const rotation: Record<string, string> = {
      north: '0',
      east: '90',
      south: '180',
      west: '270'
    };
    return <Compass className="w-5 h-5" style={{ transform: `rotate(${rotation[direction]}deg)` }} />;
  };

  const fixedCameras = cameras.filter(c => c.type === 'fixed');
  const ptzCamera = cameras.find(c => c.type === 'ptz');
  const activeCameras = cameras.filter(c => c.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {intersection.name}
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {intersection.location}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={onOpenDashboard}
            >
              <Eye className="w-4 h-4" />
              نمایش داشبورد
            </Button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">وضعیت سیستم</p>
                  <p className="text-lg font-bold mt-1 text-green-600">فعال</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">دوربین‌های فعال</p>
                  <p className="text-2xl font-bold mt-1">{activeCameras}/{cameras.length}</p>
                </div>
                <Camera className="w-8 h-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">جهات کالیبره شده</p>
                  <p className="text-2xl font-bold mt-1">
                    {directions.filter(d => d.maskDefined).length}/4
                  </p>
                </div>
                <Compass className="w-8 h-8 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">تخلفات امروز</p>
                  <p className="text-2xl font-bold mt-1 text-orange-600">
                    {intersection.todayViolations}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Intersection Diagram */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="w-5 h-5" />
              نقشه چهارراه و جهات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gray-900 rounded-lg p-8 aspect-square max-w-2xl mx-auto">
              {/* Intersection Visual */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Roads */}
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Vertical Road */}
                  <div className="absolute w-1/3 h-full bg-gray-700"></div>
                  {/* Horizontal Road */}
                  <div className="absolute w-full h-1/3 bg-gray-700"></div>
                  {/* Center Square */}
                  <div className="absolute w-1/3 h-1/3 bg-gray-600 border-4 border-yellow-400"></div>
                  
                  {/* Direction Labels */}
                  {directions.map((dir) => {
                    const positions: Record<string, { top?: string; bottom?: string; left?: string; right?: string }> = {
                      north: { top: '8%', left: '50%' },
                      south: { bottom: '8%', left: '50%' },
                      east: { right: '8%', top: '50%' },
                      west: { left: '8%', top: '50%' }
                    };
                    
                    return (
                      <div
                        key={dir.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={positions[dir.direction]}
                      >
                        <div className={`px-4 py-3 rounded-lg text-white text-center ${
                          dir.maskDefined ? 'bg-green-500' : 'bg-red-500/80'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            {getDirectionIcon(dir.direction)}
                            <span className="font-bold">{dir.name}</span>
                          </div>
                          <div className="text-xs">
                            {dir.maskDefined ? (
                              <span>{dir.violationZonesCount} منطقه تخلف</span>
                            ) : (
                              <span>نیاز به کالیبراسیون</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Fixed Cameras Indicators */}
                  {fixedCameras.map((cam) => {
                    const positions: Record<string, { top?: string; bottom?: string; left?: string; right?: string }> = {
                      north: { top: '2%', left: '50%' },
                      south: { bottom: '2%', left: '50%' },
                      east: { right: '2%', top: '50%' },
                      west: { left: '2%', top: '50%' }
                    };
                    
                    return (
                      <div
                        key={cam.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={positions[cam.direction]}
                      >
                        <div className="bg-blue-500 p-2 rounded-full">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    );
                  })}

                  {/* PTZ Camera in Center */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="bg-purple-500 p-3 rounded-full border-4 border-white shadow-lg">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-purple-500 text-white px-2 py-1 rounded">
                      PTZ
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cameras List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                دوربین‌های نصب شده
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cameras.map((camera) => (
                  <div
                    key={camera.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          camera.type === 'ptz' ? 'bg-purple-100' : 'bg-blue-100'
                        }`}>
                          <Camera className={`w-5 h-5 ${
                            camera.type === 'ptz' ? 'text-purple-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{camera.name}</p>
                          <p className="text-xs text-gray-500">{camera.ipAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {camera.type === 'ptz' && (
                          <Badge className="bg-purple-500">PTZ</Badge>
                        )}
                        <Badge className={camera.status === 'active' ? 'bg-green-500' : 'bg-red-500'}>
                          {camera.status === 'active' ? 'فعال' : 'غیرفعال'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {getDirectionIcon(camera.direction)}
                      <span>جهت: {
                        camera.direction === 'north' ? 'شمال' :
                        camera.direction === 'south' ? 'جنوب' :
                        camera.direction === 'east' ? 'شرق' : 'غرب'
                      }</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Directions Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="w-5 h-5" />
                وضعیت جهات چهارراه
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {directions.map((direction) => (
                  <div
                    key={direction.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          direction.maskDefined ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {getDirectionIcon(direction.direction)}
                        </div>
                        <div>
                          <p className="font-medium">{direction.name}</p>
                          <p className="text-xs text-gray-500">
                            {direction.maskDefined 
                              ? `${direction.violationZonesCount} منطقه تخلف تعریف شده`
                              : 'نیاز به کالیبراسیون'
                            }
                          </p>
                        </div>
                      </div>
                      {direction.maskDefined ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calibration Actions */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              تنظیمات و کالیبراسیون
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Compass className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">کالیبراسیون مناطق تخلف</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      تعریف جهات چهارراه و مناطق تخلف در هر جهت
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        مرحله اول: ماسک‌بندی جهات
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        مرحله دوم: تعریف مناطق تخلف
                      </li>
                    </ul>
                    <Button
                      className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                      onClick={() => onStartCalibration('zones')}
                    >
                      <Settings className="w-4 h-4" />
                      شروع کالیبراسیون مناطق
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-400 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Camera className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">کالیبراسیون دوربین PTZ</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      تعریف Preset‌ها برای هر جهت با زوم و فوکوس دلخواه
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        تنظیم زاویه برای هر جهت
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        تنظیم زوم و فوکوس
                      </li>
                    </ul>
                    <Button
                      className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                      onClick={() => onStartCalibration('ptz')}
                    >
                      <Camera className="w-4 h-4" />
                      شروع کالیبراسیون PTZ
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
