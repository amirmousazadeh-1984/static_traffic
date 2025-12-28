// src/store/subPresetSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SubPreset } from '../types';

interface SubPresetState {
  // ساختار: { [intersectionId]: { [maskId]: SubPreset[] } }
  byIntersectionAndMask: Record<string, Record<string, SubPreset[]>>;
}

const initialState: SubPresetState = {
  byIntersectionAndMask: {},
};

const subPresetSlice = createSlice({
  name: 'subPresets',
  initialState,
  reducers: {
    addOrUpdateSubPreset: (
      state,
      action: PayloadAction<{
        intersectionId: string;
        maskId: string;
        subPreset: SubPreset;
      }>
    ) => {
      const { intersectionId, maskId, subPreset } = action.payload;
      if (!state.byIntersectionAndMask[intersectionId]) {
        state.byIntersectionAndMask[intersectionId] = {};
      }
      if (!state.byIntersectionAndMask[intersectionId][maskId]) {
        state.byIntersectionAndMask[intersectionId][maskId] = [];
      }

      const list = state.byIntersectionAndMask[intersectionId][maskId];
      const index = list.findIndex(p => p.id === subPreset.id);
      if (index >= 0) {
        list[index] = subPreset;
      } else {
        list.push(subPreset);
      }
    },
    removeSubPreset: (
      state,
      action: PayloadAction<{
        intersectionId: string;
        maskId: string;
        subPresetId: string;
      }>
    ) => {
      const { intersectionId, maskId, subPresetId } = action.payload;
      if (
        state.byIntersectionAndMask[intersectionId]?.[maskId]
      ) {
        state.byIntersectionAndMask[intersectionId][maskId] = state.byIntersectionAndMask[intersectionId][maskId].filter(
          p => p.id !== subPresetId
        );
      }
    },
  },
});

export const { addOrUpdateSubPreset, removeSubPreset } = subPresetSlice.actions;
export default subPresetSlice.reducer;