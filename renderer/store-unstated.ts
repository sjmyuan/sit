import { useState } from 'react';
import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import { createContainer } from 'unstated-next';
import { pipe, constVoid } from 'fp-ts/lib/function';

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
      (x) => [...x, text]
    );
  };

  return { texts, startToDraw, update };
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

  return {
    getAllRects,
    startToDraw,
    drawing,
    endToDraw,
    update,
  };
}

export const RectsContainer = createContainer(useRects);

export const TextsContainer = createContainer(useTexts);

function useShapes() {
  const rectState = RectsContainer.useContainer();
  const textState = TextsContainer.useContainer();
  const [currentMode, setMode] = useState<MODE>('RECT');
  const [isDrawing, toggleDrawing] = useState<boolean>(false);
  const [selectedShape, setSelectedShape] = useState<O.Option<string>>(O.none);

  const startToDraw = (point: Point) => {
    setSelectedShape(O.none);
    toggleDrawing(true);
    if (currentMode == 'RECT') {
      console.log('start draw rect...');
      rectState.startToDraw(point);
    } else {
      textState.startToDraw(point);
    }
  };

  const drawing = (point: Point) => {
    if (currentMode == 'RECT' && isDrawing) {
      console.log('draing rect...');
      rectState.drawing(point);
    }
  };

  const endToDraw = () => {
    toggleDrawing(false);
    if (currentMode === 'RECT') {
      console.log('end draw rect...');
      rectState.endToDraw();
    }
  };

  const onSelect = (name: string) => setSelectedShape(O.some(name));

  const getSelectedShape = () => O.getOrElse(() => '')(selectedShape);

  return {
    setMode,
    startToDraw,
    drawing,
    endToDraw,
    onSelect,
    getSelectedShape,
  };
}

export const ShapeContainer = createContainer(useShapes);
