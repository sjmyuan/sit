import { createSlice, SliceCaseReducers } from '@reduxjs/toolkit';
import * as O from 'fp-ts/Option';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';
import { S3ObjectInfo, S3ObjectPage } from '../../types';
// eslint-disable-next-line import/no-cycle
import {
  fetchImages,
  uploadImgs,
  refreshImages,
} from '../../utils/imagesThunk';

export interface ImagesState {
  images: S3ObjectInfo[];
  previousPointer: O.Option<string>;
  nextPointer: O.Option<string>;
}

const imagesSlice = createSlice<ImagesState, SliceCaseReducers<ImagesState>>({
  name: 'images',
  initialState: { images: [], nextPointer: O.none, previousPointer: O.none },
  reducers: {},
  extraReducers: {
    [fetchImages.fulfilled]: (state, action) => {
      const info = action.payload as S3ObjectPage;
      state.images = info.objects;
      state.previousPointer = state.nextPointer;
      state.nextPointer = info.pointer;
    },
    [uploadImgs.fulfilled]: (state, action) => {
      const info = action.payload as S3ObjectInfo[];
      state.images = [...info, ...state.images];
    },
    [refreshImages.fulfilled]: (state, action) => {
      const info = action.payload as S3ObjectPage;
      state.images = info.objects;
      state.previousPointer = O.none;
      state.nextPointer = info.pointer;
    },
  },
});

export default imagesSlice.reducer;

export const selectImages = (state: RootState) => state.images;
