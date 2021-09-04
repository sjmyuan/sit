import { pipe } from 'fp-ts/lib/function';
import Konva from 'konva';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { O, TE, MODE, Point, Text } from '../types';
import { RectsContainer } from './RectsContainer';
import { TextsContainer } from './TextContainer';

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

  const endToEdit = () => {
    if (O.isSome(editingText)) {
      textState.update(editingText.value);
      setEditingText(O.none);
    }
  };

  const startToDraw = (point: Point) => {
    if (O.isSome(editingText)) {
      endToEdit();
    }
    setSelectedShape(O.none);
    toggleDrawing(true);
    if (currentMode === 'RECT') {
      rectState.startToDraw(point);
    } else if (currentMode === 'TEXT') {
      if (O.isNone(editingText)) {
        const newText = textState.startToDraw(point);
        setEditingText(O.some(newText));
      }
    }
  };

  const drawing = (point: Point) => {
    if (currentMode === 'RECT' && isDrawing) {
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

// eslint-disable-next-line import/prefer-default-export
export const ShapeContainer = createContainer(useShapes);
