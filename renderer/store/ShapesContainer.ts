import console from 'console';
import { pipe } from 'fp-ts/lib/function';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { O, TE, MODE, Point, Text, SitShape } from '../types';
import { RectsContainer } from './RectsContainer';
import { TextsContainer } from './TextContainer';

function useShapes() {
  const rectState = RectsContainer.useContainer();
  const textState = TextsContainer.useContainer();
  const [currentMode, setMode] = useState<MODE>('RECT');
  const [isDrawing, toggleDrawing] = useState<boolean>(false);
  const [selectedShape, setSelectedShape] = useState<O.Option<SitShape>>(
    O.none
  );
  const [editingText, setEditingText] = useState<O.Option<Text>>(O.none);
  const [editingImageUrl, setEditingImageUrl] = useState<O.Option<string>>(
    O.none
  );
  const [stageSize, setStageSize] = useState<[number, number]>([400, 400]);

  const [drawingAreaSize, setDrawingAreaSize] = useState<[number, number]>([
    100,
    100,
  ]);

  const [drawingAreaOrigin, setDrawingAreaOrigin] = useState<[number, number]>([
    150,
    150,
  ]);

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

  const onSelect = (shape: SitShape) => setSelectedShape(O.some(shape));

  const getSelectedShape = () => selectedShape;

  const deleteSelectedShape = () => {
    if (O.isSome(selectedShape)) {
      const shape = selectedShape.value;
      // eslint-disable-next-line no-underscore-dangle
      if (shape._tag === 'rect') {
        rectState.deleteRect(shape);
        // eslint-disable-next-line no-underscore-dangle
      } else if (shape._tag === 'text') {
        textState.deleteText(shape);
      }

      setSelectedShape(O.none);
    }
  };

  const getEditingImageUrl = () => editingImageUrl;

  const setEditingImage = (url: O.Option<string>) => {
    rectState.clear();
    textState.clear();
    toggleDrawing(false);
    setSelectedShape(O.none);
    setMode('RECT');
    setEditingText(O.none);
    setEditingImageUrl(url);
  };

  const getAllRects = () =>
    rectState.getAllRects().map((rect) => ({
      ...rect,
      origin: {
        x: rect.origin.x + drawingAreaOrigin[0],
        y: rect.origin.y + drawingAreaOrigin[1],
      },
    }));

  const getAllTexts = () =>
    textState.texts.map((text) => ({
      ...text,
      origin: {
        x: text.origin.x + drawingAreaOrigin[0],
        y: text.origin.y + drawingAreaOrigin[1],
      },
    }));

  const updateShape = (shape: SitShape) => {
    // eslint-disable-next-line no-underscore-dangle
    if (shape._tag === 'text') {
      textState.update(shape);
    }

    // eslint-disable-next-line no-underscore-dangle
    if (shape._tag === 'rect') {
      rectState.update(shape);
    }
  };

  const resetDrawingAreaOrigin = () => {
    const [drawingAreaWidth, drawingAreaHeight] = drawingAreaSize;
    const [stageWidth, stageHeight] = stageSize;
    const newDrawingAreaOrigin: [number, number] = [
      (stageWidth - drawingAreaWidth) / 2,
      (stageHeight - drawingAreaHeight) / 2,
    ];

    console.log('============reset origin');
    console.log(`stage ${stageSize}`);
    console.log(`drawingArea ${drawingAreaSize}`);
    console.log(`origin ${newDrawingAreaOrigin}`);

    setDrawingAreaOrigin(newDrawingAreaOrigin);
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
    deleteSelectedShape,
    stageSize,
    setStageSize,
    drawingAreaSize,
    setDrawingAreaSize,
    drawingAreaOrigin,
    resetDrawingAreaOrigin,
    getAllRects,
    getAllTexts,
    updateShape,
  };
}

// eslint-disable-next-line import/prefer-default-export
export const ShapeContainer = createContainer(useShapes);
