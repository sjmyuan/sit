import { createSlice, SliceCaseReducers } from '@reduxjs/toolkit';
import * as O from 'fp-ts/Option';
// eslint-disable-next-line import/no-cycle
import { RootState } from '../../store';
import { S3ObjectInfo, S3ObjectPage } from '../../types';
// eslint-disable-next-line import/no-cycle
import { fetchImages, uploadImgs } from '../../utils/imagesThunk';

export interface ImagesState {
  images: S3ObjectInfo[];
  pointer: O.Option<string>;
}

const imagesSlice = createSlice<ImagesState, SliceCaseReducers<ImagesState>>({
  name: 'images',
  initialState: { images: [], pointer: O.none },
  reducers: {},
  extraReducers: {
    [fetchImages.fulfilled]: (state, action) => {
      const info = action.payload as S3ObjectPage;
      state.images = [...info.objects, ...state.images];
      state.pointer = info.pointer;
    },
    [uploadImgs.fulfilled]: (state, action) => {
      const info = action.payload as S3ObjectInfo[];
      state.images = [...info, ...state.images];
    },
  },
});

export default imagesSlice.reducer;

export const selectImages = (state: RootState) => state.images;
