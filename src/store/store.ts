// src/store/store.ts

import { configureStore } from '@reduxjs/toolkit';
import violationReducer from './violationSlice';

export const store = configureStore({
  reducer: {
    violations: violationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;