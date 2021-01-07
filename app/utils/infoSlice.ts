import { createSlice, SliceCaseReducers } from '@reduxjs/toolkit';
import { O } from '../types';

import {
  fetchNextPageImages,
  uploadImgs,
  fetchPreviousPageImages,
} from './imagesThunk';

export interface InfoState {
  info: O.Option<string>;
  error: O.Option<string>;
  inProgress: boolean;
}

const infoSlice = createSlice<InfoState, SliceCaseReducers<InfoState>>({
  name: 'information',
  initialState: { info: O.none, error: O.none, inProgress: false },
  reducers: {
    setInfo: (state, action) => {
      state.info = O.some(action.payload);
    },
    setError: (state, action) => {
      state.error = O.some(action.payload);
    },
    clearInfo: (state) => {
      state.info = O.none;
    },
    clearError: (state) => {
      state.error = O.none;
    },
  },
  extraReducers: {
    [fetchNextPageImages.pending]: (state, _) => {
      state.inProgress = true;
    },
    [fetchNextPageImages.fulfilled]: (state, _) => {
      state.inProgress = false;
      state.info = O.some('Success');
    },
    [fetchNextPageImages.rejected]: (state, action) => {
      state.inProgress = false;
      state.error = O.some(action.payload);
    },
    [fetchPreviousPageImages.pending]: (state, _) => {
      state.inProgress = true;
    },
    [fetchPreviousPageImages.fulfilled]: (state, _) => {
      state.inProgress = false;
      state.info = O.some('Success');
    },
    [fetchPreviousPageImages.rejected]: (state, action) => {
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

export const { setInfo, setError, clearInfo, clearError } = infoSlice.actions;

export default infoSlice.reducer;
