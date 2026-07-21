import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StoreSettings } from '../../../types';


export interface SettingsDraftState {
  draft: Partial<StoreSettings>;
  hasUnsavedChanges: boolean;
}

const initialState: SettingsDraftState = {
  draft: {},
  hasUnsavedChanges: false,
};

const settingsDraftSlice = createSlice({
  name: 'settingsDraft',
  initialState,
  reducers: {
    updateDraftField: (
      state, 
      action: PayloadAction<{ field: keyof StoreSettings; value: any }>
    ) => {
      state.draft[action.payload.field] = action.payload.value;
      state.hasUnsavedChanges = true;
    },
    
    initializeDraft: (state, action: PayloadAction<Partial<StoreSettings>>) => {
      state.draft = action.payload;
      state.hasUnsavedChanges = false;
    },

    clearDraft: (state) => {
      state.draft = {};
      state.hasUnsavedChanges = false;
    },
  },
});

export const { updateDraftField, initializeDraft, clearDraft } = settingsDraftSlice.actions;

export const selectSettingsDraft = (state: any) => state.settingsDraft.draft;
export const selectHasUnsavedChanges = (state: any) => state.settingsDraft.hasUnsavedChanges;

export default settingsDraftSlice.reducer;