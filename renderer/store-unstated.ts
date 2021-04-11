import { useState } from 'react';
import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import { createContainer } from 'unstated-next';
import { pipe, constVoid } from 'fp-ts/lib/function';
import { ImageIndex } from './utils/AppDB';
import { getImageUrl, updateImage } from './utils/localImages';
import { TE, AppErrorOr } from './types';
import Konva from 'konva';

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
  const [editingImageKey, setEditingImageKey] = useState<O.Option<string>>(
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
      O.map((x) => ({ ...x, value: value })),
      setEditingText
    );

    console.log(editingText);
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
      editingImageKey,
      TE.fromOption(() => new Error('There is no editing image')),
      TE.chain(getImageUrl)
    );

  const setEditingImage = (key: O.Option<string>) => {
    rectState.clear();
    textState.clear();
    toggleDrawing(false);
    setSelectedShape(O.none);
    setMode('RECT');
    setEditingText(O.none);
    setEditingImageKey(key);
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
    editingImageKey,
    getEditingImageUrl,
  };
}

function useInfo() {
  const [info, setInfo] = useState<O.Option<string>>(O.none);
  const [error, setError] = useState<O.Option<string>>(O.none);
  const [inProgress, toggleInProgress] = useState<boolean>(false);

  const startProcess = () => toggleInProgress(true);
  const showInfo = (info: string) => {
    toggleInProgress(false);
    setInfo(O.some(info));
    setError(O.none);
  };
  const showError = (error: string) => {
    toggleInProgress(false);
    setInfo(O.none);
    setError(O.some(error));
  };

  return { info, error, inProgress, startProcess, showInfo, showError };
}

export const RectsContainer = createContainer(useRects);
export const TextsContainer = createContainer(useTexts);
export const ShapeContainer = createContainer(useShapes);
export const InfoContainer = createContainer(useInfo);
