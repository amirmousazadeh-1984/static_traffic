export interface Intersection {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  status: 'active' | 'inactive' | 'maintenance';
  camerasCount: number;
  todayViolations: number;
  imageUrl: string;
}

export interface Camera {
  id: string;
  name: string;
  type: 'fixed' | 'ptz';
  direction: 'north' | 'south' | 'east' | 'west';
  status: 'active' | 'inactive';
  ipAddress: string;
}

export interface Direction {
  id: string;
  name: string;
  direction: 'north' | 'south' | 'east' | 'west';
  maskDefined: boolean;
  violationZonesCount: number;
}

export interface Mask {
  id: string;
  name: string;
  direction: 'north' | 'south' | 'east' | 'west';
  type: 'direction' | 'violation';
  violationType?: string;
  color: string;
  enabled: boolean;
  area: { x: number; y: number; width: number; height: number };
}

export interface PTZPreset {
  id: string;
  name: string;
  direction: 'north' | 'south' | 'east' | 'west';
  pan: number;
  tilt: number;
  zoom: number;
  focus: number;
}

export interface Violation {
  id: string;
  intersectionId: string;
  plateNumber: string;
  violationType: string;
  direction: 'north' | 'south' | 'east' | 'west';
  maskId: string;
  detectionCamera: string;
  ptzPresetUsed: string;
  date: string;
  time: string;
  status: 'pending' | 'verified' | 'rejected';
  imageUrl: string;
  videoUrl: string;
}
