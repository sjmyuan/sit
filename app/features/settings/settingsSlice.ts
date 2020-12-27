import {
  createSlice,
  PayloadAction,
  SliceCaseReducers,
} from '@reduxjs/toolkit';
import * as O from 'fp-ts/Option';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';
import { AWSConfig } from '../../types';

export interface SettingsState {
  awsConfig: O.Option<AWSConfig>;
}

const settingsSlice = createSlice<
  SettingsState,
  SliceCaseReducers<SettingsState>
>({
  name: 'settings',
  initialState: { awsConfig: O.none },
  reducers: {
    updateAWSConfig: (state, action: PayloadAction<AWSConfig>) => {
      state.awsConfig = O.some(action.payload);
    },
  },
});

export const { updateAWSConfig } = settingsSlice.actions;

export default settingsSlice.reducer;

export const selectAWSConfig = (state: RootState) => state.settings.awsConfig;
