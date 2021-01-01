import {
  createSlice,
  PayloadAction,
  SliceCaseReducers,
} from '@reduxjs/toolkit';
import { O } from '../types';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';

export interface InfoState {
  info: O.Option<string>;
  error: O.Option<string>;
  inProgress: boolean;
}

const infoSlice = createSlice<InfoState, SliceCaseReducers<InfoState>>({
  name: 'information',
  initialState: { info: O.none, error: O.none, inProgress: false },
  reducers: {
    showInfo: (state, action: PayloadAction<string>) => {
      state.inProgress = false;
      state.error = O.none;
      state.info = O.some(action.payload);
    },
    showError: (state, action: PayloadAction<string>) => {
      state.inProgress = false;
      state.info = O.none;
      state.error = O.some(action.payload);
    },
    startProcess: (state) => {
      state.inProgress = true;
      state.info = O.none;
      state.error = O.none;
    },
  },
});

export const { showInfo, showError, startProcess } = infoSlice.actions;

export default infoSlice.reducer;

export const selectInformation = (state: RootState) => state.information;
