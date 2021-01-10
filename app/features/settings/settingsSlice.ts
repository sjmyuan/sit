import {
  createSlice,
  PayloadAction,
  SliceCaseReducers,
} from '@reduxjs/toolkit';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/lib/function';
import { saveToStorage, getFromStorage } from '../../utils/localStorage';

export interface SettingsState {
  accessId: O.Option<string>;
  secretAccessKey: O.Option<string>;
  bucket: O.Option<string>;
  region: O.Option<string>;
  pageSize: number;
  resolution: number;
  cdn: O.Option<string>;
}

const settingsSlice = createSlice<
  SettingsState,
  SliceCaseReducers<SettingsState>
>({
  name: 'settings',
  initialState: {
    accessId: O.none,
    secretAccessKey: O.none,
    bucket: O.none,
    region: O.none,
    pageSize: 10,
    resolution: 480,
    cdn: O.none,
  },
  reducers: {
    updateAccessId: (state, action: PayloadAction<O.Option<string>>) => {
      state.accessId = action.payload;
    },
    updateSecretAccessKey: (state, action: PayloadAction<O.Option<string>>) => {
      state.secretAccessKey = action.payload;
    },
    updateBucket: (state, action: PayloadAction<O.Option<string>>) => {
      state.bucket = action.payload;
    },
    updateRegion: (state, action: PayloadAction<O.Option<string>>) => {
      state.region = action.payload;
    },
    updatePageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
    },
    updateResolution: (state, action: PayloadAction<number>) => {
      state.resolution = action.payload;
    },
    updateCDN: (state, action: PayloadAction<O.Option<string>>) => {
      state.cdn = action.payload;
    },
    saveConfig: (state) => {
      pipe(
        state.accessId,
        O.map((x) => saveToStorage('access_id', x))
      );
      pipe(
        state.secretAccessKey,
        O.map((x) => saveToStorage('secret_access_key', x))
      );
      pipe(
        state.bucket,
        O.map((x) => saveToStorage('bucket', x))
      );
      pipe(
        state.region,
        O.map((x) => saveToStorage('region', x))
      );
      pipe(
        state.cdn,
        O.map((x) => saveToStorage('cdn', x))
      );
      saveToStorage('resolution', state.resolution);
      saveToStorage('page_size', state.pageSize);
    },
    loadConfig: (state) => {
      state.accessId = O.fromEither(getFromStorage<string>('access_id'));
      state.secretAccessKey = O.fromEither(
        getFromStorage<string>('secret_access_key')
      );
      state.region = O.fromEither(getFromStorage<string>('region'));
      state.bucket = O.fromEither(getFromStorage<string>('bucket'));
      state.cdn = O.fromEither(getFromStorage<string>('cdn'));

      state.pageSize = O.getOrElse(() => 10)(
        O.fromEither(getFromStorage<number>('page_size'))
      );

      state.resolution = O.getOrElse(() => 480)(
        O.fromEither(getFromStorage<number>('resolution'))
      );
    },
  },
});

export const {
  updateAccessId,
  updateSecretAccessKey,
  updateBucket,
  updateRegion,
  updatePageSize,
  updateResolution,
  updateCDN,
  saveConfig,
  loadConfig,
} = settingsSlice.actions;

export default settingsSlice.reducer;
