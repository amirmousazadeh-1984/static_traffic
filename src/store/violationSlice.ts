// src/store/violationSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ViolationType {
  id: string;
  name: string;
  color: string;
}

interface ViolationState {
  types: ViolationType[];
}

const initialState: ViolationState = {
  types: [
    { id: 'red-light', name: 'عبور از چراغ قرمز', color: '#ef4444' },
    { id: 'crosswalk', name: 'تجاوز به خط عابر', color: '#f97316' },
    { id: 'speed', name: 'سرعت غیرمجاز', color: '#8b5cf6' },
    { id: 'lane-change', name: 'تغییر خط ممنوع', color: '#ec4899' },
    { id: 'illegal-parking', name: 'پارک ممنوع', color: '#10b981' },
  ],
};

const violationSlice = createSlice({
  name: 'violations',
  initialState,
  reducers: {
    addViolationType: (state, action: PayloadAction<ViolationType>) => {
      state.types.push(action.payload);
    },
    deleteViolationType: (state, action: PayloadAction<string>) => {
      state.types = state.types.filter(v => v.id !== action.payload);
    },
    updateViolationTypes: (state, action: PayloadAction<ViolationType[]>) => {
      state.types = action.payload;
    },
  },
});

export const { addViolationType, deleteViolationType, updateViolationTypes } = violationSlice.actions;
export default violationSlice.reducer;