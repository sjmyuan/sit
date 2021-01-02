import { createSlice, SliceCaseReducers } from '@reduxjs/toolkit';
import { O } from '../types';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../store';

// eslint-disable-next-line import/no-cycle
import { fetchImages, uploadImgs } from './imagesThunk';

export interface InfoState {
  info: O.Option<string>;
  error: O.Option<string>;
  inProgress: boolean;
}

const infoSlice = createSlice<InfoState, SliceCaseReducers<InfoState>>({
  name: 'information',
  initialState: { info: O.none, error: O.none, inProgress: false },
  reducers: {
    clearInfo: (state) => {
      state.info = O.none;
    },
    clearError: (state) => {
      state.error = O.none;
    },
  },
  extraReducers: {
    [fetchImages.pending]: (state, _) => {
      state.inProgress = true;
    },
    [fetchImages.fulfilled]: (state, _) => {
      state.inProgress = false;
      state.info = O.some('Success');
    },
    [fetchImages.rejected]: (state, action) => {
      state.inProgress = false;
      state.error = O.some(action.payload);
    },
    [uploadImgs.pending]: (state, _) => {
      state.inProgress = true;
    },
    [uploadImgs.fulfilled]: (state, _) => {
      state.inProgress = false;
      state.info = O.some('Success');
    },
    [uploadImgs.rejected]: (state, action) => {
      state.inProgress = false;
      state.error = O.some(action.payload);
    },
  },
});

export const { clearInfo, clearError } = infoSlice.actions;

export default infoSlice.reducer;

export const selectInformation = (state: RootState) => state.information;
