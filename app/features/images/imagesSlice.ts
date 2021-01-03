import { createSlice, SliceCaseReducers } from '@reduxjs/toolkit';
import * as O from 'fp-ts/Option';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';
import { S3ObjectInfo, S3ObjectPage } from '../../types';
// eslint-disable-next-line import/no-cycle
import {
  fetchNextPageImages,
  uploadImgs,
  fetchPreviousPageImages,
} from '../../utils/imagesThunk';

export interface ImagesState {
  images: S3ObjectInfo[];
  historyPointer: O.Option<string>[];
  nextPointer: O.Option<string>;
}

const imagesSlice = createSlice<ImagesState, SliceCaseReducers<ImagesState>>({
  name: 'images',
  initialState: {
    images: [],
    historyPointer: [],
    nextPointer: O.some(''),
  },
  reducers: {
    resetPointer: (state) => {
      state.images = [];
      state.historyPointer = [];
      state.nextPointer = O.some('');
    },
  },
  extraReducers: {
    [fetchNextPageImages.fulfilled]: (state, action) => {
      const info = action.payload as S3ObjectPage;
      state.images = info.objects;
      state.historyPointer.push(state.nextPointer);
      state.nextPointer = info.pointer;
    },
    [fetchPreviousPageImages.fulfilled]: (state, action) => {
      const info = action.payload as S3ObjectPage;
      state.images = info.objects;
      state.historyPointer.pop();
      state.nextPointer = info.pointer;
    },
    [uploadImgs.fulfilled]: (state, action) => {
      const info = action.payload as S3ObjectInfo[];
      state.images = [...info, ...state.images];
    },
  },
});

export const { resetPointer } = imagesSlice.actions;

export default imagesSlice.reducer;

export const selectImages = (state: RootState) => state.images;
