// src/store/store.ts

import { configureStore } from '@reduxjs/toolkit';
import violationReducer from './violationSlice';
import ptzPresetReducer from './ptzPresetSlice'; // ✅ اضافه شد

export const store = configureStore({
  reducer: {
    violations: violationReducer,
    ptzPresets: ptzPresetReducer, // ✅ اضافه شد
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;