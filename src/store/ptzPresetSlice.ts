// src/store/ptzPresetSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PTZPreset } from '../types';

interface PTZPresetsState {
  // کلید: intersectionId
  [intersectionId: string]: PTZPreset[];
}

const initialState: PTZPresetsState = {};

export const ptzPresetSlice = createSlice({
  name: 'ptzPresets',
  initialState,
  reducers: {
    addOrUpdatePreset: (state, action: PayloadAction<{ intersectionId: string; preset: PTZPreset }>) => {
      const { intersectionId, preset } = action.payload;
      if (!state[intersectionId]) {
        state[intersectionId] = [];
      }

      const existingIndex = state[intersectionId].findIndex(p => p.id === preset.id);
      if (existingIndex >= 0) {
        state[intersectionId][existingIndex] = preset;
      } else {
        state[intersectionId].push(preset);
      }
    },

    removePreset: (state, action: PayloadAction<{ intersectionId: string; presetId: string }>) => {
      const { intersectionId, presetId } = action.payload;
      if (state[intersectionId]) {
        state[intersectionId] = state[intersectionId].filter(p => p.id !== presetId);
      }
    },

    setPresetsForIntersection: (state, action: PayloadAction<{ intersectionId: string; presets: PTZPreset[] }>) => {
      const { intersectionId, presets } = action.payload;
      state[intersectionId] = presets;
    },

    // اگر نیاز به پاک‌کردن همه presetها برای یک چهارراه دارید
    clearPresetsForIntersection: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
  },
});

export const { addOrUpdatePreset, removePreset, setPresetsForIntersection, clearPresetsForIntersection } = ptzPresetSlice.actions;
export default ptzPresetSlice.reducer;