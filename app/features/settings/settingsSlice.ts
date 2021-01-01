import {
  createSlice,
  PayloadAction,
  SliceCaseReducers,
} from '@reduxjs/toolkit';
import * as O from 'fp-ts/Option';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';
import { AWSConfig, E } from '../../types';
import { getFromStorage } from '../../localStorage';

export interface SettingsState {
  awsConfig: O.Option<AWSConfig>;
  pageSize: number;
  resolution: number;
}

const settingsSlice = createSlice<
  SettingsState,
  SliceCaseReducers<SettingsState>
>({
  name: 'settings',
  initialState: { awsConfig: O.none, pageSize: 20, resolution: 480 },
  reducers: {
    updateAWSConfig: (state, action: PayloadAction<AWSConfig>) => {
      state.awsConfig = O.some(action.payload);
    },
    loadConfig: (state) => {
      state.awsConfig = O.fromEither(getFromStorage<AWSConfig>('aws_config'));

      state.pageSize = O.getOrElse(() => 20)(
        O.fromEither(getFromStorage<number>('page_size'))
      );

      state.resolution = O.getOrElse(() => 480)(
        O.fromEither(getFromStorage<number>('resolution'))
      );
    },
  },
});

export const { updateAWSConfig, loadConfig } = settingsSlice.actions;

export default settingsSlice.reducer;

export const selectAWSConfig = (state: RootState) => state.settings.awsConfig;
