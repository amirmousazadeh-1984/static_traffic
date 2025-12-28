// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import violationReducer from './violationSlice';
import ptzPresetReducer from './ptzPresetSlice';
import subPresetReducer from './subPresetSlice'; // ✅ جدید

export const store = configureStore({
  reducer: {
    violations: violationReducer,
    ptzPresets: ptzPresetReducer,
    subPresets: subPresetReducer, // ✅
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;