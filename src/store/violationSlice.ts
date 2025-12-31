// src/store/violationSlice.ts  ← تغییر بدهید

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ViolationType {
  id: string;
  code: string;         // اضافه شد
  name: string;
  description: string;  // اضافه شد
  validDuration: number; // اضافه شد
  color: string;
}

interface ViolationState {
  types: ViolationType[];
}

const initialState: ViolationState = {
  types: [
    { id: '1', code: '101', name: 'عبور از چراغ قرمز', description: 'عبور از خط توقف پس از قرمز شدن چراغ', validDuration: 30, color: '#ef4444' },
    { id: '2', code: '102', name: 'تجاوز به خط عابر', description: 'عبور از خط عابر پیاده در زمان ممنوع', validDuration: 15, color: '#f97316' },
    { id: '3', code: '103', name: 'سرعت غیرمجاز', description: 'تجاوز از حد مجاز سرعت', validDuration: 60, color: '#8b5cf6' },
    { id: '4', code: '104', name: 'تغییر خط ممنوع', description: 'تغییر خط در محل ممنوع', validDuration: 30, color: '#ec4899' },
    { id: '5', code: '105', name: 'پارک ممنوع', description: 'توقف در محل پارک ممنوع', validDuration: 7, color: '#10b981' },
  ],
};

const violationSlice = createSlice({
  name: 'violations',
  initialState,
  reducers: {
    addViolationType: (state, action: PayloadAction<ViolationType>) => {
      state.types.push(action.payload);
    },
    updateViolationType: (state, action: PayloadAction<ViolationType>) => {
      const index = state.types.findIndex(v => v.id === action.payload.id);
      if (index !== -1) state.types[index] = action.payload;
    },
    deleteViolationType: (state, action: PayloadAction<string>) => {
      state.types = state.types.filter(v => v.id !== action.payload);
    },
    setViolationTypes: (state, action: PayloadAction<ViolationType[]>) => {
      state.types = action.payload;
    },
  },
});

export const { addViolationType, updateViolationType, deleteViolationType, setViolationTypes } = violationSlice.actions;
export default violationSlice.reducer;