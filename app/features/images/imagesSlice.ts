import { createSlice, SliceCaseReducers } from '@reduxjs/toolkit';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/lib/function';
import { S3ObjectInfo, S3ObjectPage, A } from '../../types';
import {
  fetchNextPageImages,
  uploadImgs,
  fetchPreviousPageImages,
  deleteImgs,
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
    [deleteImgs.fulfilled]: (state, action) => {
      const keys = action.payload as string[];
      state.images = A.reduce([], (acc: S3ObjectInfo[], ele: S3ObjectInfo) => {
        const isDeleted = pipe(
          keys,
          A.findFirst((x) => x === ele.key),
          O.isSome
        );
        return isDeleted ? acc : [...acc, ele];
      })(state.images);
    },
  },
});

export const { resetPointer } = imagesSlice.actions;

export default imagesSlice.reducer;
