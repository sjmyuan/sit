import { createSlice, SliceCaseReducers } from '@reduxjs/toolkit';
import { O } from '../types';

import {
  fetchNextPageImages,
  uploadImgs,
  fetchPreviousPageImages,
  deleteImgs,
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
  extraReducers: (builder) => {
    builder.addCase(fetchNextPageImages.pending, (state, _) => {
      state.inProgress = true;
    });
    builder.addCase(fetchNextPageImages.fulfilled, (state, _) => {
      state.inProgress = false;
      state.info = O.some('Success');
    });
    builder.addCase(fetchNextPageImages.rejected, (state, action) => {
      state.inProgress = false;
      state.error = O.some(action.payload);
    });
    builder.addCase(fetchPreviousPageImages.pending, (state, _) => {
      state.inProgress = true;
    });
    builder.addCase(fetchPreviousPageImages.fulfilled, (state, _) => {
      state.inProgress = false;
      state.info = O.some('Success');
    });
    builder.addCase(fetchPreviousPageImages.rejected, (state, action) => {
      state.inProgress = false;
      state.error = O.some(action.payload);
    });
    builder.addCase(uploadImgs.pending, (state, _) => {
      state.inProgress = true;
    });
    builder.addCase(uploadImgs.fulfilled, (state, _) => {
      state.inProgress = false;
      state.info = O.some('Success');
    });
    builder.addCase(uploadImgs.rejected, (state, action) => {
      state.inProgress = false;
      state.error = O.some(action.payload);
    });
    builder.addCase(deleteImgs.pending, (state, _) => {
      state.inProgress = true;
    });
    builder.addCase(deleteImgs.fulfilled, (state, _) => {
      state.inProgress = false;
      state.info = O.some('Success');
    });
    builder.addCase(deleteImgs.rejected, (state, action) => {
      state.inProgress = false;
      state.error = O.some(action.payload);
    });
  },
});

export const { setInfo, setError, clearInfo, clearError } = infoSlice.actions;

export default infoSlice.reducer;
