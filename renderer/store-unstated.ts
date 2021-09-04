import { useState } from 'react';
import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import { createContainer } from 'unstated-next';
import { pipe, constVoid } from 'fp-ts/lib/function';
import { sequenceS } from 'fp-ts/lib/Apply';
import Konva from 'konva';
import { ImageIndex } from './utils/AppDB';
import { getImageCacheUrl, updateImage } from './utils/localImages';
import { TE, Resolution, AWSConfig, AppErrorOr } from './types';
import { getFromStorage, saveToStorage } from './utils/localStorage';

export type Point = {
  x: number;
  y: number;
};

export type Rect = {
  id: number;
  origin: Point;
  width: number;
  height: number;
};

export type Text = {
  id: number;
  origin: Point;
  value: string;
};

export type MODE = 'RECT' | 'TEXT';

function useTexts(initialState: Text[] = []) {
  const [texts, setTexts] = useState<Text[]>(initialState);
  const startToDraw = (point: Point) => {
    const newText = { id: texts.length + 1, origin: point, value: '' };
    setTexts([...texts, newText]);
    return newText;
  };

  const update = (text: Text) => {
    pipe(
      texts,
      A.filter((x) => x.id !== text.id),
      (x) => [...x, text],
      setTexts
    );
  };

  const clear = () => setTexts([]);

  return { texts, startToDraw, update, clear };
}

function useRects(initialState: Rect[] = []) {
  const [rects, setRects] = useState<Rect[]>(initialState);
  const [newRect, setNewRect] = useState<O.Option<Rect>>(O.none);
  const startToDraw = (point: Point) =>
    setNewRect(
      O.some({
        id: rects.length + 1,
        origin: point,
        width: 0,
        height: 0,
      })
    );
  const drawing = (point: Point) =>
    setNewRect(
      pipe(
        newRect,
        O.map((rect) => ({
          id: rect.id,
          origin: rect.origin,
          width: point.x - rect.origin.x,
          height: point.y - rect.origin.y,
        }))
      )
    );

  const endToDraw = () => {
    if (O.isSome(newRect)) {
      setRects([...rects, newRect.value]);
      setNewRect(O.none);
    }
  };

  const getAllRects = () => {
    return O.isSome(newRect) ? [...rects, newRect.value] : rects;
  };

  const update = (rect: Rect) => {
    pipe(
      rects,
      A.filter((x) => x.id !== rect.id),
      (x) => [...x, rect]
    );
  };

  const clear = () => setRects([]);

  return {
    getAllRects,
    startToDraw,
    drawing,
    endToDraw,
    update,
    clear,
  };
}

function useShapes() {
  const rectState = RectsContainer.useContainer();
  const textState = TextsContainer.useContainer();
  const [currentMode, setMode] = useState<MODE>('RECT');
  const [isDrawing, toggleDrawing] = useState<boolean>(false);
  const [selectedShape, setSelectedShape] = useState<O.Option<string>>(O.none);
  const [editingText, setEditingText] = useState<O.Option<Text>>(O.none);
  const [editingImageUrl, setEditingImageUrl] = useState<O.Option<string>>(
    O.none
  );
  const [stage, setStage] = useState<O.Option<Konva.Stage>>(O.none);

  const startToDraw = (point: Point) => {
    if (O.isSome(editingText)) {
      endToEdit();
    }
    setSelectedShape(O.none);
    toggleDrawing(true);
    if (currentMode == 'RECT') {
      rectState.startToDraw(point);
    } else {
      if (O.isNone(editingText)) {
        const newText = textState.startToDraw(point);
        setEditingText(O.some(newText));
      }
    }
  };

  const drawing = (point: Point) => {
    if (currentMode == 'RECT' && isDrawing) {
      rectState.drawing(point);
    }
  };

  const endToDraw = () => {
    toggleDrawing(false);
    if (currentMode === 'RECT') {
      rectState.endToDraw();
    }
  };

  const startToEdit = (text: Text) => {
    setEditingText(O.some(text));
  };

  const editing = (value: string) => {
    pipe(
      editingText,
      O.map((x) => ({ ...x, value })),
      setEditingText
    );
  };

  const endToEdit = () => {
    if (O.isSome(editingText)) {
      textState.update(editingText.value);
      setEditingText(O.none);
    }
  };

  const onSelect = (name: string) => setSelectedShape(O.some(name));

  const getSelectedShape = () => O.getOrElse(() => '')(selectedShape);

  const getEditingImageUrl = () =>
    pipe(
      editingImageUrl,
      TE.fromOption(() => new Error('There is no editing image'))
    );

  const setEditingImage = (url: O.Option<string>) => {
    rectState.clear();
    textState.clear();
    toggleDrawing(false);
    setSelectedShape(O.none);
    setMode('RECT');
    setEditingText(O.none);
    setEditingImageUrl(url);
  };

  return {
    currentMode,
    setMode,
    startToDraw,
    drawing,
    endToDraw,
    editingText,
    startToEdit,
    editing,
    endToEdit,
    onSelect,
    getSelectedShape,
    setEditingImage,
    editingImageUrl,
    getEditingImageUrl,
  };
}

function useInfo() {
  const [info, setInfo] = useState<O.Option<string>>(O.none);
  const [error, setError] = useState<O.Option<string>>(O.none);
  const [inProgress, toggleInProgress] = useState<boolean>(false);

  const startProcess = () => toggleInProgress(true);
  const showInfo = (infoMsg: O.Option<string>) => {
    toggleInProgress(false);
    setInfo(infoMsg);
    setError(O.none);
  };
  const showError = (errorMsg: O.Option<string>) => {
    toggleInProgress(false);
    setInfo(O.none);
    setError(errorMsg);
  };

  const runTask = (description: String) => <A>(
    task: AppErrorOr<A>
  ): AppErrorOr<A> =>
    pipe(
      TE.fromIO<Error, void>(() => startProcess()),
      TE.chain(() => task),
      TE.fold(
        (e) =>
          pipe(
            TE.fromIO<Error, void>(() =>
              showError(O.some(`Failed to ${description}`))
            ),
            TE.chain(() => TE.left(e))
          ),
        (x) =>
          pipe(
            TE.fromIO<Error, void>(() =>
              showInfo(O.some(`Succeed to ${description}`))
            ),
            TE.map(() => x)
          )
      )
    );
  return {
    info,
    error,
    inProgress,
    startProcess,
    showInfo,
    showError,
    runTask,
  };
}

function usePreferences() {
  const [accessId, setAccessId] = useState<O.Option<string>>(O.none);
  const [secretAccessKey, setSecretAccessKey] = useState<O.Option<string>>(
    O.none
  );
  const [bucket, setBucket] = useState<O.Option<string>>(O.none);
  const [region, setRegion] = useState<O.Option<string>>(O.none);
  const [resolution, setResolution] = useState<Resolution>({
    width: 640,
    height: 480,
  });

  const setAndSaveAccessId = (newAccessId: O.Option<string>) => {
    setAccessId(newAccessId);
    pipe(
      newAccessId,
      O.map((x) => saveToStorage('access_id', x))
    );
  };
  const setAndSaveSecretAccessKey = (newSecretAccessKey: O.Option<string>) => {
    setSecretAccessKey(newSecretAccessKey);
    pipe(
      newSecretAccessKey,
      O.map((x) => saveToStorage('secret_access_key', x))
    );
  };

  const setAndSaveRegion = (newRegion: O.Option<string>) => {
    setRegion(newRegion);
    pipe(
      newRegion,
      O.map((x) => saveToStorage('region', x))
    );
  };

  const setAndSaveBucket = (newBucket: O.Option<string>) => {
    setBucket(newBucket);
    pipe(
      newBucket,
      O.map((x) => saveToStorage('bucket', x))
    );
  };

  const setAndSaveResolution = (newResolution: Resolution) => {
    setResolution(newResolution);
    saveToStorage('resolution', newResolution);
  };

  const loadPreferences = () => {
    setAccessId(O.fromEither(getFromStorage<string>('access_id')));
    setSecretAccessKey(
      O.fromEither(getFromStorage<string>('secret_access_key'))
    );
    setRegion(O.fromEither(getFromStorage<string>('region')));
    setBucket(O.fromEither(getFromStorage<string>('bucket')));

    setResolution(
      O.getOrElse(() => ({ width: 640, height: 480 }))(
        O.fromEither(getFromStorage<Resolution>('resolution'))
      )
    );
  };

  return {
    accessId,
    setAndSaveAccessId,
    secretAccessKey,
    setAndSaveSecretAccessKey,
    bucket,
    setAndSaveBucket,
    region,
    setAndSaveRegion,
    resolution,
    setAndSaveResolution,
    loadPreferences,
  };
}

export const RectsContainer = createContainer(useRects);
export const TextsContainer = createContainer(useTexts);
export const ShapeContainer = createContainer(useShapes);
export const InfoContainer = createContainer(useInfo);
export const PreferencesContainer = createContainer(usePreferences);
