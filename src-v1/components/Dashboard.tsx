import { useState, useEffect } from 'react';
import { Camera, AlertTriangle, Clock, CheckCircle, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface Violation {
  id: string;
  camera: string;
  type: string;
  time: string;
  status: 'pending' | 'captured' | 'completed';
  location: string;
}

export function Dashboard() {
  const [violations, setViolations] = useState<Violation[]>([
    {
      id: '001',
      camera: 'دوربین ثابت شمال',
      type: 'عبور از چراغ قرمز',
      time: '14:23:45',
      status: 'completed',
      location: 'شمال چهارراه'
    },
    {
      id: '002',
      camera: 'دوربین ثابت جنوب',
      type: 'توقف در خط عابر',
      time: '14:25:12',
      status: 'captured',
      location: 'جنوب چهارراه'
    }
  ]);

  const [ptzStatus, setPtzStatus] = useState({
    position: 'شمال',
    zoom: '3x',
    isTracking: true,
    targetViolation: '002'
  });

  const [stats, setStats] = useState({
    todayViolations: 127,
    activeTracking: 1,
    ptzHealth: 'عملکرد عالی',
    fixedCameras: 4
  });

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              تخلفات امروز
            </CardTitle>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.todayViolations}</div>
            <p className="text-xs text-gray-500 mt-2">+12 نسبت به دیروز</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              ردیابی فعال
            </CardTitle>
            <Video className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeTracking}</div>
            <p className="text-xs text-gray-500 mt-2">دوربین PTZ در حال ضبط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              دوربین‌های ثابت
            </CardTitle>
            <Camera className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.fixedCameras}/4</div>
            <p className="text-xs text-green-600 mt-2">همه دوربین‌ها فعال</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              وضعیت PTZ
            </CardTitle>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">{stats.ptzHealth}</div>
            <p className="text-xs text-gray-500 mt-2">آخرین بررسی: 2 دقیقه پیش</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Feeds */}
        <div className="lg:col-span-2 space-y-6">
          {/* PTZ Camera */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>دوربین PTZ - لایو</CardTitle>
                {ptzStatus.isTracking && (
                  <Badge className="bg-red-500">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      در حال ردیابی
                    </span>
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <img 
                  src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80" 
                  alt="PTZ Camera View"
                  className="w-full h-full object-cover"
                />
                {/* Crosshair overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 border-2 border-red-500">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-red-500"></div>
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-500"></div>
                  </div>
                </div>
                {/* Info overlay */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <div className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm space-y-1">
                    <div>موقعیت: {ptzStatus.position}</div>
                    <div>زوم: {ptzStatus.zoom}</div>
                  </div>
                  {ptzStatus.isTracking && (
                    <div className="bg-red-500/90 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
                      ردیابی تخلف #{ptzStatus.targetViolation}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-xs">
                  <Clock className="w-3 h-3 inline-block ml-1" />
                  {new Date().toLocaleTimeString('fa-IR')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fixed Cameras Grid */}
          <Card>
            <CardHeader>
              <CardTitle>دوربین‌های ثابت</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {['شمال', 'جنوب', 'شرق', 'غرب'].map((direction, idx) => (
                  <div key={direction} className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                    <img 
                      src={`https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80&sig=${idx}`}
                      alt={`${direction} Camera`}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 px-2 py-1 rounded text-white text-xs flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      فعال
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
                      {direction}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Violations */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>تخلفات اخیر</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {violations.map((violation) => (
                  <div 
                    key={violation.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="font-medium text-sm">#{violation.id}</span>
                      </div>
                      <Badge 
                        className={
                          violation.status === 'completed' 
                            ? 'bg-green-500' 
                            : violation.status === 'captured' 
                            ? 'bg-blue-500' 
                            : 'bg-yellow-500'
                        }
                      >
                        {violation.status === 'completed' 
                          ? 'تکمیل شده' 
                          : violation.status === 'captured' 
                          ? 'در حال ضبط' 
                          : 'در انتظار'}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="font-medium text-gray-900">{violation.type}</div>
                      <div className="flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        {violation.camera}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {violation.time}
                      </div>
                      <div className="text-xs text-gray-500 pt-1 border-t border-gray-200 mt-2">
                        {violation.location}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                  مشاهده همه تخلفات
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
