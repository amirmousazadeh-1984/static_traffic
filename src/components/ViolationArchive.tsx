import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Trash2,
  Calendar,
  AlertTriangle,
  Camera,
  Clock,
  MapPin,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface ViolationRecord {
  id: string;
  plateNumber: string;
  violationType: string;
  location: string;
  camera: string;
  date: string;
  time: string;
  status: 'pending' | 'verified' | 'rejected';
  imageUrl: string;
  videoUrl: string;
  ptzAngle: string;
  zoomLevel: string;
}

export function ViolationArchive() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedViolation, setSelectedViolation] = useState<ViolationRecord | null>(null);

  const violations: ViolationRecord[] = [
    {
      id: 'V2024121801',
      plateNumber: '۱۲ ص ۳۴۵ ایران ۶۷',
      violationType: 'عبور از چراغ قرمز',
      location: 'شمال چهارراه ولیعصر',
      camera: 'دوربین ثابت شمال',
      date: '۱۴۰۳/۰۹/۲۸',
      time: '۱۴:۲۳:۴۵',
      status: 'verified',
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80',
      videoUrl: '#',
      ptzAngle: '45° شمال',
      zoomLevel: '10x'
    },
    {
      id: 'V2024121802',
      plateNumber: '۸۹ الف ۱۲۳ ایران ۴۵',
      violationType: 'توقف در خط عابر پیاده',
      location: 'جنوب چهارراه ولیعصر',
      camera: 'دوربین ثابت جنوب',
      date: '۱۴۰۳/۰۹/۲۸',
      time: '۱۴:۲۵:۱۲',
      status: 'pending',
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80&sig=2',
      videoUrl: '#',
      ptzAngle: '180° جنوب',
      zoomLevel: '8x'
    },
    {
      id: 'V2024121803',
      plateNumber: '۳۴ ب ۵۶۷ ایران ۸۹',
      violationType: 'تغییر خط غیرمجاز',
      location: 'شرق چهارراه ولیعصر',
      camera: 'دوربین ثابت شرق',
      date: '۱۴۰۳/۰۹/۲۸',
      time: '۱۴:۳۰:۲۳',
      status: 'verified',
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80&sig=3',
      videoUrl: '#',
      ptzAngle: '90° شرق',
      zoomLevel: '12x'
    },
    {
      id: 'V2024121804',
      plateNumber: '۵۶ ج ۷۸۹ ایران ۱۲',
      violationType: 'سرعت غیرمجاز',
      location: 'غرب چهارراه ولیعصر',
      camera: 'دوربین ثابت غرب',
      date: '۱۴۰۳/۰۹/۲۸',
      time: '۱۴:۳۵:۵۶',
      status: 'rejected',
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80&sig=4',
      videoUrl: '#',
      ptzAngle: '270° غرب',
      zoomLevel: '15x'
    },
    {
      id: 'V2024121805',
      plateNumber: '۷۸ د ۹۰۱ ایران ۲۳',
      violationType: 'پارک غیرمجاز',
      location: 'شمال چهارراه ولیعصر',
      camera: 'دوربین ثابت شمال',
      date: '۱۴۰۳/۰۹/۲۸',
      time: '۱۴:۴۲:۳۴',
      status: 'pending',
      imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80&sig=5',
      videoUrl: '#',
      ptzAngle: '30° شمال',
      zoomLevel: '6x'
    }
  ];

  const violationTypes = [
    { value: 'all', label: 'همه تخلفات' },
    { value: 'red_light', label: 'عبور از چراغ قرمز' },
    { value: 'crosswalk', label: 'توقف در خط عابر' },
    { value: 'wrong_lane', label: 'تغییر خط غیرمجاز' },
    { value: 'speeding', label: 'سرعت غیرمجاز' },
    { value: 'no_parking', label: 'پارک غیرمجاز' }
  ];

  const statusOptions = [
    { value: 'all', label: 'همه وضعیت‌ها' },
    { value: 'pending', label: 'در انتظار بررسی' },
    { value: 'verified', label: 'تایید شده' },
    { value: 'rejected', label: 'رد شده' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500">تایید شده</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">رد شده</Badge>;
      default:
        return <Badge className="bg-yellow-500">در انتظار</Badge>;
    }
  };

  const stats = {
    total: violations.length,
    verified: violations.filter(v => v.status === 'verified').length,
    pending: violations.filter(v => v.status === 'pending').length,
    rejected: violations.filter(v => v.status === 'rejected').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">آرشیو تخلفات</h2>
          <p className="text-sm text-gray-600 mt-1">
            مدیریت و بررسی تخلفات ثبت شده
          </p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4" />
          دانلود گزارش
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">کل تخلفات</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">تایید شده</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.verified}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">در انتظار</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">رد شده</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="جستجو بر اساس پلاک، شناسه یا مکان..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="نوع تخلف" />
              </SelectTrigger>
              <SelectContent>
                {violationTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Violations List */}
      <Card>
        <CardHeader>
          <CardTitle>لیست تخلفات ({violations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {violations.map((violation) => (
              <div
                key={violation.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gray-900 rounded-lg overflow-hidden">
                      <img
                        src={violation.imageUrl}
                        alt="Violation"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{violation.plateNumber}</h3>
                          {getStatusBadge(violation.status)}
                        </div>
                        <p className="text-sm text-gray-600">شناسه: {violation.id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-600 text-xs">نوع تخلف</p>
                          <p className="font-medium">{violation.violationType}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-600 text-xs">مکان</p>
                          <p className="font-medium">{violation.location}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-600 text-xs">تاریخ و زمان</p>
                          <p className="font-medium">{violation.date}</p>
                          <p className="text-xs text-gray-500">{violation.time}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Camera className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-600 text-xs">دوربین</p>
                          <p className="font-medium text-xs">{violation.camera}</p>
                          <p className="text-xs text-gray-500">
                            {violation.ptzAngle} • {violation.zoomLevel}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => setSelectedViolation(violation)}
                    >
                      <Eye className="w-4 h-4" />
                      مشاهده
                    </Button>
                    {violation.status === 'pending' && (
                      <>
                        <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4" />
                          تایید
                        </Button>
                        <Button size="sm" variant="destructive" className="gap-2">
                          <XCircle className="w-4 h-4" />
                          رد
                        </Button>
                      </>
                    )}
                    {violation.status === 'verified' && (
                      <Button size="sm" variant="outline" className="gap-2">
                        <FileText className="w-4 h-4" />
                        گزارش
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600">
              نمایش 1 تا {violations.length} از {violations.length} مورد
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                قبلی
              </Button>
              <Button variant="outline" size="sm" className="bg-blue-50 text-blue-600">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                بعدی
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal (simplified) */}
      {selectedViolation && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedViolation(null)}
        >
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>جزئیات تخلف {selectedViolation.id}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedViolation(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <img
                      src={selectedViolation.imageUrl}
                      alt="Violation"
                      className="w-full rounded-lg"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{selectedViolation.plateNumber}</h3>
                      {getStatusBadge(selectedViolation.status)}
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">شناسه:</span>
                        <span className="font-medium">{selectedViolation.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">نوع تخلف:</span>
                        <span className="font-medium">{selectedViolation.violationType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">مکان:</span>
                        <span className="font-medium">{selectedViolation.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">دوربین:</span>
                        <span className="font-medium">{selectedViolation.camera}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">تاریخ:</span>
                        <span className="font-medium">{selectedViolation.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">زمان:</span>
                        <span className="font-medium">{selectedViolation.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">زاویه PTZ:</span>
                        <span className="font-medium">{selectedViolation.ptzAngle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">سطح زوم:</span>
                        <span className="font-medium">{selectedViolation.zoomLevel}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1 gap-2">
                        <Download className="w-4 h-4" />
                        دانلود تصویر
                      </Button>
                      <Button variant="outline" className="flex-1 gap-2">
                        <Download className="w-4 h-4" />
                        دانلود ویدئو
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
