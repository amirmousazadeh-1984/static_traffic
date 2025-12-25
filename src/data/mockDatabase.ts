
import { Intersection, Camera, Direction, Mask, PTZPreset, Violation } from '../types';
import { v4 as uuidv4 } from 'uuid';


export const mockIntersections: Intersection[] = [
  {
    id: 'int-001',
    name: 'چهارراه ولیعصر - انقلاب',
    location: 'تهران، میدان ولیعصر',
    coordinates: { lat: 35.6892, lng: 51.3890 },
    status: 'active',
    camerasCount: 5,
    todayViolations: 47,
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'
  },
  {
    id: 'int-002',
    name: 'چهارراه جمهوری - فلسطین',
    location: 'تهران، میدان جمهوری',
    coordinates: { lat: 35.7008, lng: 51.4014 },
    status: 'active',
    camerasCount: 5,
    todayViolations: 32,
    imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop'
  },
  {
    id: 'int-003',
    name: 'چهارراه آزادی - شریعتی',
    location: 'تهران، میدان آزادی',
    coordinates: { lat: 35.6997, lng: 51.3381 },
    status: 'maintenance',
    camerasCount: 5,
    todayViolations: 0,
    imageUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&fit=crop'
  },
  {
    id: 'int-004',
    name: 'چهارراه سعادت‌آباد',
    location: 'تهران، میدان سعادت‌آباد',
    coordinates: { lat: 35.7742, lng: 51.3756 },
    status: 'active',
    camerasCount: 5,
    todayViolations: 28,
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'
  },
  {
    id: 'int-005',
    name: 'چهارراه نیاوران - باهنر',
    location: 'تهران، نیاوران',
    coordinates: { lat: 35.8089, lng: 51.4697 },
    status: 'inactive',
    camerasCount: 5,
    todayViolations: 0,
    imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop'
  }
];

export const mockCameras: { [intersectionId: string]: Camera[] } = {
  'int-001': [
    {
      id: 'cam-001-n',
      name: 'دوربین شمالی',
      type: 'fixed',
      direction: 'north',
      status: 'active',
      ipAddress: '192.168.1.101'
    },
    {
      id: 'cam-001-s',
      name: 'دوربین جنوبی',
      type: 'fixed',
      direction: 'south',
      status: 'active',
      ipAddress: '192.168.1.102'
    },
    {
      id: 'cam-001-e',
      name: 'دوربین شرقی',
      type: 'fixed',
      direction: 'east',
      status: 'active',
      ipAddress: '192.168.1.103'
    },
    {
      id: 'cam-001-w',
      name: 'دوربین غربی',
      type: 'fixed',
      direction: 'west',
      status: 'active',
      ipAddress: '192.168.1.104'
    },
    {
      id: 'cam-001-ptz',
      name: 'دوربین PTZ مرکزی',
      type: 'ptz',
      direction: 'north',
      status: 'active',
      ipAddress: '192.168.1.105'
    }
  ],
  'int-002': [
    {
      id: 'cam-002-n',
      name: 'دوربین شمالی',
      type: 'fixed',
      direction: 'north',
      status: 'active',
      ipAddress: '192.168.2.101'
    },
    {
      id: 'cam-002-s',
      name: 'دوربین جنوبی',
      type: 'fixed',
      direction: 'south',
      status: 'active',
      ipAddress: '192.168.2.102'
    },
    {
      id: 'cam-002-e',
      name: 'دوربین شرقی',
      type: 'fixed',
      direction: 'east',
      status: 'active',
      ipAddress: '192.168.2.103'
    },
    {
      id: 'cam-002-w',
      name: 'دوربین غربی',
      type: 'fixed',
      direction: 'west',
      status: 'active',
      ipAddress: '192.168.2.104'
    },
    {
      id: 'cam-002-ptz',
      name: 'دوربین PTZ مرکزی',
      type: 'ptz',
      direction: 'north',
      status: 'active',
      ipAddress: '192.168.2.105'
    }
  ]
};

export const mockDirections: { [intersectionId: string]: Direction[] } = {
  'int-001': [
    {
      id: 'dir-001-n',
      name: 'شمال (ولیعصر)',
      direction: 'north',
      maskDefined: true,
      violationZonesCount: 3
    },
    {
      id: 'dir-001-s',
      name: 'جنوب (انقلاب)',
      direction: 'south',
      maskDefined: true,
      violationZonesCount: 2
    },
    {
      id: 'dir-001-e',
      name: 'شرق',
      direction: 'east',
      maskDefined: true,
      violationZonesCount: 2
    },
    {
      id: 'dir-001-w',
      name: 'غرب',
      direction: 'west',
      maskDefined: false,
      violationZonesCount: 0
    }
  ],
  'int-002': [
    {
      id: 'dir-002-n',
      name: 'شمال (جمهوری)',
      direction: 'north',
      maskDefined: true,
      violationZonesCount: 2
    },
    {
      id: 'dir-002-s',
      name: 'جنوب (فلسطین)',
      direction: 'south',
      maskDefined: true,
      violationZonesCount: 2
    },
    {
      id: 'dir-002-e',
      name: 'شرق',
      direction: 'east',
      maskDefined: false,
      violationZonesCount: 0
    },
    {
      id: 'dir-002-w',
      name: 'غرب',
      direction: 'west',
      maskDefined: false,
      violationZonesCount: 0
    }
  ]
};

export const mockMasks: { [intersectionId: string]: Mask[] } = {
  'int-001': [
    // ماسک جهت شمالی
    {
      id: 'mask-001-n-main',
      name: 'منطقه اصلی شمال',
      direction: 'north',
      type: 'direction',
      color: '#3b82f6',
      enabled: true,
      area: { x: 100, y: 50, width: 400, height: 300 }
    },
    // ماسک‌های تخلف شمالی
    {
      id: 'mask-001-n-redlight',
      name: 'چراغ قرمز - شمال',
      direction: 'north',
      type: 'violation',
      violationType: 'red-light',
      color: '#ef4444',
      enabled: true,
      area: { x: 120, y: 80, width: 150, height: 100 }
    },
    {
      id: 'mask-001-n-crosswalk',
      name: 'خط عابر - شمال',
      direction: 'north',
      type: 'violation',
      violationType: 'crosswalk',
      color: '#f59e0b',
      enabled: true,
      area: { x: 300, y: 100, width: 150, height: 80 }
    },
    {
      id: 'mask-001-n-speed',
      name: 'سرعت غیرمجاز - شمال',
      direction: 'north',
      type: 'violation',
      violationType: 'speed',
      color: '#8b5cf6',
      enabled: true,
      area: { x: 150, y: 200, width: 200, height: 120 }
    },
    // ماسک جهت جنوبی
    {
      id: 'mask-001-s-main',
      name: 'منطقه اصلی جنوب',
      direction: 'south',
      type: 'direction',
      color: '#3b82f6',
      enabled: true,
      area: { x: 500, y: 350, width: 400, height: 300 }
    },
    {
      id: 'mask-001-s-redlight',
      name: 'چراغ قرمز - جنوب',
      direction: 'south',
      type: 'violation',
      violationType: 'red-light',
      color: '#ef4444',
      enabled: true,
      area: { x: 550, y: 400, width: 150, height: 100 }
    },
    {
      id: 'mask-001-s-parking',
      name: 'پارک ممنوع - جنوب',
      direction: 'south',
      type: 'violation',
      violationType: 'illegal-parking',
      color: '#10b981',
      enabled: true,
      area: { x: 720, y: 450, width: 120, height: 150 }
    },
    // ماسک جهت شرقی
    {
      id: 'mask-001-e-main',
      name: 'منطقه اصلی شرق',
      direction: 'east',
      type: 'direction',
      color: '#3b82f6',
      enabled: true,
      area: { x: 600, y: 50, width: 350, height: 280 }
    },
    {
      id: 'mask-001-e-lanechange',
      name: 'تغییر خط - شرق',
      direction: 'east',
      type: 'violation',
      violationType: 'lane-change',
      color: '#ec4899',
      enabled: true,
      area: { x: 650, y: 100, width: 250, height: 100 }
    },
    {
      id: 'mask-001-e-redlight',
      name: 'چراغ قرمز - شرق',
      direction: 'east',
      type: 'violation',
      violationType: 'red-light',
      color: '#ef4444',
      enabled: true,
      area: { x: 700, y: 220, width: 150, height: 80 }
    }
  ],
  'int-002': [
    {
      id: 'mask-002-n-main',
      name: 'منطقه اصلی شمال',
      direction: 'north',
      type: 'direction',
      color: '#3b82f6',
      enabled: true,
      area: { x: 80, y: 40, width: 420, height: 320 }
    },
    {
      id: 'mask-002-n-redlight',
      name: 'چراغ قرمز - شمال',
      direction: 'north',
      type: 'violation',
      violationType: 'red-light',
      color: '#ef4444',
      enabled: true,
      area: { x: 100, y: 70, width: 160, height: 110 }
    },
    {
      id: 'mask-002-n-speed',
      name: 'سرعت غیرمجاز - شمال',
      direction: 'north',
      type: 'violation',
      violationType: 'speed',
      color: '#8b5cf6',
      enabled: true,
      area: { x: 280, y: 150, width: 180, height: 150 }
    },
    {
      id: 'mask-002-s-main',
      name: 'منطقه اصلی جنوب',
      direction: 'south',
      type: 'direction',
      color: '#3b82f6',
      enabled: true,
      area: { x: 520, y: 360, width: 380, height: 290 }
    },
    {
      id: 'mask-002-s-crosswalk',
      name: 'خط عابر - جنوب',
      direction: 'south',
      type: 'violation',
      violationType: 'crosswalk',
      color: '#f59e0b',
      enabled: true,
      area: { x: 560, y: 400, width: 140, height: 90 }
    },
    {
      id: 'mask-002-s-parking',
      name: 'پارک ممنوع - جنوب',
      direction: 'south',
      type: 'violation',
      violationType: 'illegal-parking',
      color: '#10b981',
      enabled: true,
      area: { x: 730, y: 470, width: 130, height: 140 }
    }
  ]
};

export const mockPTZPresets: { [intersectionId: string]: PTZPreset[] } = {
  'int-001': [
    {
      id: 'preset-001-n',
      name: 'نمای شمالی',
      direction: 'north',
      pan: 0,
      tilt: -10,
      zoom: 1.5,
      focus: 0.8
    },
    {
      id: 'preset-001-s',
      name: 'نمای جنوبی',
      direction: 'south',
      pan: 180,
      tilt: -10,
      zoom: 1.5,
      focus: 0.8
    },
    {
      id: 'preset-001-e',
      name: 'نمای شرقی',
      direction: 'east',
      pan: 90,
      tilt: -15,
      zoom: 1.3,
      focus: 0.7
    },
    {
      id: 'preset-001-w',
      name: 'نمای غربی',
      direction: 'west',
      pan: 270,
      tilt: -15,
      zoom: 1.3,
      focus: 0.7
    }
  ],
  'int-002': [
    {
      id: 'preset-002-n',
      name: 'نمای شمالی',
      direction: 'north',
      pan: 0,
      tilt: -12,
      zoom: 1.6,
      focus: 0.85
    },
    {
      id: 'preset-002-s',
      name: 'نمای جنوبی',
      direction: 'south',
      pan: 180,
      tilt: -12,
      zoom: 1.6,
      focus: 0.85
    },
    {
      id: 'preset-002-e',
      name: 'نمای شرقی',
      direction: 'east',
      pan: 90,
      tilt: -10,
      zoom: 1.4,
      focus: 0.75
    },
    {
      id: 'preset-002-w',
      name: 'نمای غربی',
      direction: 'west',
      pan: 270,
      tilt: -10,
      zoom: 1.4,
      focus: 0.75
    }
  ]
};

export const mockViolations: Violation[] = [
  {
    id: 'viol-001',
    intersectionId: 'int-001',
    plateNumber: '۱۲ الف ۳۴۵ - ۶۷',
    violationType: 'عبور از چراغ قرمز',
    direction: 'north',
    maskId: 'mask-001-n-redlight',
    detectionCamera: 'دوربین شمالی',
    ptzPresetUsed: 'نمای شمالی',
    date: '1403/09/30',
    time: '14:23:45',
    status: 'verified',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop',
    videoUrl: ''
  },
  {
    id: 'viol-002',
    intersectionId: 'int-001',
    plateNumber: '۲۳ ب ۶۷۸ - ۹۱',
    violationType: 'تجاوز به خط عابر پیاده',
    direction: 'north',
    maskId: 'mask-001-n-crosswalk',
    detectionCamera: 'دوربین شمالی',
    ptzPresetUsed: 'نمای شمالی',
    date: '1403/09/30',
    time: '14:45:12',
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop',
    videoUrl: ''
  },
  {
    id: 'viol-003',
    intersectionId: 'int-001',
    plateNumber: '۴۵ ج ۲۳۱ - ۴۵',
    violationType: 'سرعت غیرمجاز',
    direction: 'north',
    maskId: 'mask-001-n-speed',
    detectionCamera: 'دوربین شمالی',
    ptzPresetUsed: 'نمای شمالی',
    date: '1403/09/30',
    time: '15:12:33',
    status: 'verified',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop',
    videoUrl: ''
  },
  {
    id: 'viol-004',
    intersectionId: 'int-001',
    plateNumber: '۸۹ د ۴۵۶ - ۷۸',
    violationType: 'عبور از چراغ قرمز',
    direction: 'south',
    maskId: 'mask-001-s-redlight',
    detectionCamera: 'دوربین جنوبی',
    ptzPresetUsed: 'نمای جنوبی',
    date: '1403/09/30',
    time: '15:34:21',
    status: 'verified',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop',
    videoUrl: ''
  },
  {
    id: 'viol-005',
    intersectionId: 'int-001',
    plateNumber: '۶۷ الف ۸۹۰ - ۱۲',
    violationType: 'پارک در محل ممنوع',
    direction: 'south',
    maskId: 'mask-001-s-parking',
    detectionCamera: 'دوربین جنوبی',
    ptzPresetUsed: 'نمای جنوبی',
    date: '1403/09/30',
    time: '16:05:47',
    status: 'rejected',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop',
    videoUrl: ''
  },
  {
    id: 'viol-006',
    intersectionId: 'int-002',
    plateNumber: '۳۴ ب ۱۲۳ - ۴۵',
    violationType: 'عبور از چراغ قرمز',
    direction: 'north',
    maskId: 'mask-002-n-redlight',
    detectionCamera: 'دوربین شمالی',
    ptzPresetUsed: 'نمای شمالی',
    date: '1403/09/30',
    time: '13:45:23',
    status: 'verified',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop',
    videoUrl: ''
  },
  {
    id: 'viol-007',
    intersectionId: 'int-002',
    plateNumber: '۵۶ ج ۴۵۶ - ۷۸',
    violationType: 'سرعت غیرمجاز',
    direction: 'north',
    maskId: 'mask-002-n-speed',
    detectionCamera: 'دوربین شمالی',
    ptzPresetUsed: 'نمای شمالی',
    date: '1403/09/30',
    time: '14:12:56',
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop',
    videoUrl: ''
  },
  {
    id: 'viol-008',
    intersectionId: 'int-002',
    plateNumber: '۷۸ د ۷۸۹ - ۹۰',
    violationType: 'تجاوز به خط عابر پیاده',
    direction: 'south',
    maskId: 'mask-002-s-crosswalk',
    detectionCamera: 'دوربین جنوبی',
    ptzPresetUsed: 'نمای جنوبی',
    date: '1403/09/30',
    time: '15:23:41',
    status: 'verified',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop',
    videoUrl: ''
  }
];

export const violationStats = {
  today: {
    total: 47,
    byType: {
      'red-light': 18,
      'crosswalk': 12,
      'speed': 9,
      'lane-change': 5,
      'illegal-parking': 3
    },
    byStatus: {
      verified: 28,
      pending: 15,
      rejected: 4
    }
  },
  week: {
    total: 312,
    byType: {
      'red-light': 125,
      'crosswalk': 84,
      'speed': 63,
      'lane-change': 28,
      'illegal-parking': 12
    }
  },
  month: {
    total: 1245,
    byType: {
      'red-light': 498,
      'crosswalk': 336,
      'speed': 252,
      'lane-change': 112,
      'illegal-parking': 47
    }
  }
};

export const violationTypes = [
  { id: 'red-light', name: 'عبور از چراغ قرمز', color: '#ef4444', icon: 'alert-circle' },
  { id: 'crosswalk', name: 'تجاوز به خط عابر پیاده', color: '#f59e0b', icon: 'user-x' },
  { id: 'speed', name: 'سرعت غیرمجاز', color: '#8b5cf6', icon: 'gauge' },
  { id: 'lane-change', name: 'تغییر خط ممنوع', color: '#ec4899', icon: 'git-branch' },
  { id: 'illegal-parking', name: 'پارک در محل ممنوع', color: '#10b981', icon: 'parking-circle-off' }
];

export const addIntersection = (newIntersection: Omit<Intersection, 'id' | 'camerasCount' | 'todayViolations'> & { imageUrl?: string }) => {
  const intersection: Intersection = {
    ...newIntersection,
    id: uuidv4(),
    camerasCount: 0,
    todayViolations: 0,
    imageUrl: newIntersection.imageUrl || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
  };
  mockIntersections.push(intersection);
  mockCameras[intersection.id] = [];
  return intersection;
};

export const addCameraToIntersection = (intersectionId: string, newCamera: Omit<Camera, 'id'>) => {
  const camera: Camera = {
    ...newCamera,
    id: uuidv4(),
  };
  if (!mockCameras[intersectionId]) {
    mockCameras[intersectionId] = [];
  }
  mockCameras[intersectionId].push(camera);

  const intersection = mockIntersections.find(int => int.id === intersectionId);
  if (intersection) {
    intersection.camerasCount = mockCameras[intersectionId].length;
  }

  return camera;
};

export const predefinedCameraModels = [
  { brand: 'Hikvision', model: 'DS-2CD2043G0-I', type: 'fixed' as const, defaultUsername: 'admin', defaultPassword: 'admin123' },
  { brand: 'Hikvision', model: 'DS-2DE4A425IW-DE', type: 'ptz' as const, defaultUsername: 'admin', defaultPassword: 'admin123' },
  { brand: 'Dahua', model: 'IPC-HFW5442E-ZE', type: 'fixed' as const, defaultUsername: 'admin', defaultPassword: 'admin' },
  { brand: 'Dahua', model: 'SD6AL445XA-HNR', type: 'ptz' as const, defaultUsername: 'admin', defaultPassword: 'admin' },
  { brand: 'Axis', model: 'P1448-LE', type: 'fixed' as const, defaultUsername: 'root', defaultPassword: 'root' },
  { brand: 'Axis', model: 'Q6075-E', type: 'ptz' as const, defaultUsername: 'root', defaultPassword: 'root' },
  { brand: 'Uniview', model: 'IPC2324EBR-DPZ28', type: 'fixed' as const, defaultUsername: 'admin', defaultPassword: '123456' },
  { brand: 'Milesight', model: 'MS-C2964-RPC', type: 'ptz' as const, defaultUsername: 'admin', defaultPassword: 'ms123456' },
];

export const removeIntersection = (id: string) => {
  mockIntersections = mockIntersections.filter(int => int.id !== id);
  delete mockCameras[id];
};

export const removeCameraFromIntersection = (intersectionId: string, cameraId: string) => {
  if (mockCameras[intersectionId]) {
    mockCameras[intersectionId] = mockCameras[intersectionId].filter(cam => cam.id !== cameraId);
    const int = mockIntersections.find(i => i.id === intersectionId);
    if (int) int.camerasCount = mockCameras[intersectionId].length;
  }
};

export const updateCameraInIntersection = (intersectionId: string, updatedCamera: Camera) => {
  if (mockCameras[intersectionId]) {
    mockCameras[intersectionId] = mockCameras[intersectionId].map(cam =>
      cam.id === updatedCamera.id ? updatedCamera : cam
    );
  }
};