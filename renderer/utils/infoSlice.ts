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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    builder.addCase(fetchNextPageImages.pending, (state, _) => {
      state.inProgress = true;
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    builder.addCase(fetchNextPageImages.fulfilled, (state, _) => {
      state.inProgress = false;
      state.info = O.some('Success');
    });
    builder.addCase(fetchNextPageImages.rejected, (_, action) => {
      return {
        inProgress: false,
        error: O.some(action.payload),
        info: O.none,
      } as InfoState;
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    builder.addCase(fetchPreviousPageImages.pending, (state, _) => {
      state.inProgress = true;
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    builder.addCase(fetchPreviousPageImages.fulfilled, (state, _) => {
      state.inProgress = false;
      state.info = O.some('Success');
    });
    builder.addCase(fetchPreviousPageImages.rejected, (_, action) => {
      return {
        inProgress: false,
        error: O.some(action.payload),
        info: O.none,
      } as InfoState;
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    builder.addCase(uploadImgs.pending, (state, _) => {
      state.inProgress = true;
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    builder.addCase(uploadImgs.fulfilled, (state, _) => {
      state.inProgress = false;
      state.info = O.some('Success');
    });
    builder.addCase(uploadImgs.rejected, (_, action) => {
      return {
        inProgress: false,
        error: O.some(action.payload),
        info: O.none,
      } as InfoState;
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    builder.addCase(deleteImgs.pending, (state, _) => {
      state.inProgress = true;
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    builder.addCase(deleteImgs.fulfilled, (state, _) => {
      state.inProgress = false;
      state.info = O.some('Success');
    });
    builder.addCase(deleteImgs.rejected, (_, action) => {
      return {
        inProgress: false,
        error: O.some(action.payload),
        info: O.none,
      } as InfoState;
    });
  },
});

export const { setInfo, setError, clearInfo, clearError } = infoSlice.actions;

export default infoSlice.reducer;
