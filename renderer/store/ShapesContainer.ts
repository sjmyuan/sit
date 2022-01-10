import console from 'console';
import { pipe } from 'fp-ts/lib/function';
import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
import { O, TE, MODE, Point, Text, SitShape, Area, getSize } from '../types';
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

  const [drawingArea, setDrawingArea] = useState<Area>({
    origin: { x: 200, y: 200 },
    topLeft: { x: 0, y: 0 },
    bottomRight: { x: -1, y: -1 },
  });

  const [backgroundImg, setBackgroundImg] = useState<
    O.Option<HTMLImageElement>
  >(O.none);

  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    if (O.isSome(backgroundImg)) {
      setDrawingArea({
        origin: {
          x: (stageSize[0] - backgroundImg.value.width) / 2,
          y: (stageSize[1] - backgroundImg.value.height) / 2,
        },
        topLeft: { x: 0, y: 0 },
        bottomRight: {
          x: backgroundImg.value.width,
          y: backgroundImg.value.height,
        },
      });
      setInitialized(true);
    }
  }, [backgroundImg]);

  useEffect(() => {
    if (initialized) {
      updateDrawingAreaRect();
    }
  }, [rectState.rects, textState.texts]);

  useEffect(() => {
    if (initialized) {
      updateDrawingAreaOrigin();
    }
  }, [stageSize, initialized]);

  const fromStageToDrawingArea = (point: Point) => {
    return {
      x: point.x - drawingArea.origin.x,
      y: point.y - drawingArea.origin.y,
    };
  };

  const fromDrawingAreaToStage = (point: Point) => {
    return {
      x: point.x + drawingArea.origin.x,
      y: point.y + drawingArea.origin.y,
    };
  };

  const startToDraw = (point: Point) => {
    const drawingAreaPoint = fromStageToDrawingArea(point);
    if (O.isSome(editingText)) {
      endToEdit();
    }
    setSelectedShape(O.none);
    toggleDrawing(true);
    if (currentMode === 'RECT') {
      rectState.startToDraw(drawingAreaPoint);
    } else if (currentMode === 'TEXT') {
      if (O.isNone(editingText)) {
        const newText = textState.startToDraw(drawingAreaPoint);
        setEditingText(O.some(newText));
      }
    }
  };

  const drawing = (point: Point) => {
    const drawingAreaPoint = fromStageToDrawingArea(point);
    if (currentMode === 'RECT' && isDrawing) {
      rectState.drawing(drawingAreaPoint);
    }
  };

  const endToDraw = () => {
    toggleDrawing(false);
    if (currentMode === 'RECT') {
      rectState.endToDraw();
    }
  };

  const startToEdit = (text: Text) => {
    setEditingText(
      O.some({ ...text, origin: fromStageToDrawingArea(text.origin) })
    );
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

  const getEditingText = () => {
    return pipe(
      editingText,
      O.map((x) => ({
        ...x,
        origin: fromDrawingAreaToStage(x.origin),
      }))
    );
  };

  const onSelect = (shape: SitShape) =>
    setSelectedShape(
      O.some({ ...shape, origin: fromStageToDrawingArea(shape.origin) })
    );

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

  const getAllRects = () => {
    const originalRect = rectState.getAllRects();
    const transformedRect = originalRect.map((rect) => ({
      ...rect,
      origin: fromDrawingAreaToStage(rect.origin),
    }));

    return transformedRect;
  };

  const getAllTexts = () =>
    textState.texts.map((text) => ({
      ...text,
      origin: fromDrawingAreaToStage(text.origin),
    }));

  const updateShape = (shape: SitShape) => {
    const drawingAreaShape = {
      ...shape,
      origin: fromStageToDrawingArea(shape.origin),
    };

    // eslint-disable-next-line no-underscore-dangle
    if (drawingAreaShape._tag === 'text') {
      textState.update(drawingAreaShape);
    }

    // eslint-disable-next-line no-underscore-dangle
    if (drawingAreaShape._tag === 'rect') {
      rectState.update(drawingAreaShape);
    }
  };

  /**
   * when resize window, we want the drawing area to be always the center of stage, because stage size will change
   * and the relative position of topeleft, bottomright should not be changed
   * when drawing outsize the drawing area, we want to keep the current origin and only change the position of topleft or bottomright
   */

  const updateDrawingAreaOrigin = () => {
    const { origin, topLeft, bottomRight } = drawingArea;
    const drawingAreaWidth = Math.abs(bottomRight.x - topLeft.x);
    const drawingAreaHeight = Math.abs(bottomRight.y - topLeft.y);
    const [stageWidth, stageHeight] = stageSize;
    const oldDrawingAreaOffset: [number, number] = [
      origin.x + topLeft.x,
      origin.y + topLeft.y,
    ];
    const newDrawingAreaOffset: [number, number] = [
      (stageWidth - drawingAreaWidth) / 2,
      (stageHeight - drawingAreaHeight) / 2,
    ];
    const newDrawingAreaOrigin = {
      x: origin.x + (newDrawingAreaOffset[0] - oldDrawingAreaOffset[0]),
      y: origin.y + (newDrawingAreaOffset[1] - oldDrawingAreaOffset[1]),
    };

    setDrawingArea({ ...drawingArea, origin: newDrawingAreaOrigin });
  };

  const updateDrawingAreaRect = () => {
    const { topLeft, bottomRight } = drawingArea;
    let minX = topLeft.x;
    let minY = topLeft.y;
    let maxX = bottomRight.x;
    let maxY = bottomRight.y;

    rectState.getAllRects().forEach((rect) => {
      const rectTopLeft = rect.origin;
      const rectBottomRight = {
        x: rectTopLeft.x + rect.width,
        y: rectTopLeft.y + rect.height,
      };

      minX = minX < rectTopLeft.x ? minX : rectTopLeft.x;
      minY = minY < rectTopLeft.y ? minY : rectTopLeft.y;
      maxX = maxX > rectBottomRight.x ? maxX : rectBottomRight.x;
      maxY = maxY > rectBottomRight.y ? maxY : rectBottomRight.y;
    });

    textState.texts.forEach((text) => {
      minX = minX < text.origin.x ? minX : text.origin.x;
      minY = minY < text.origin.y ? minY : text.origin.y;
      maxX = maxX > text.origin.x ? maxX : text.origin.x;
      maxY = maxY > text.origin.y ? maxY : text.origin.y;
    });

    setDrawingArea({
      ...drawingArea,
      topLeft: { x: minX, y: minY },
      bottomRight: { x: maxX, y: maxY },
    });
  };

  return {
    currentMode,
    setMode,
    startToDraw,
    drawing,
    endToDraw,
    getEditingText,
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
    setDrawingArea,
    drawingArea,
    getAllRects,
    getAllTexts,
    updateShape,
    backgroundImg,
    setBackgroundImg,
  };
}

// eslint-disable-next-line import/prefer-default-export
export const ShapeContainer = createContainer(useShapes);
