import { pipe } from 'fp-ts/lib/function';
import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
import {
  O,
  MODE,
  Point,
  Text,
  SitShape,
  getTopLeftAndBottomRight,
  StageInfo,
  Size,
  Rect,
} from '../types';
import { LinesContainer } from './LineContainer';
import { RectsContainer } from './RectsContainer';
import { TextsContainer } from './TextContainer';

function useShapes() {
  const rectState = RectsContainer.useContainer();
  const textState = TextsContainer.useContainer();
  const linesState = LinesContainer.useContainer();

  const [currentMode, setMode] = useState<MODE>('NONE');
  const [isDrawing, toggleDrawing] = useState<boolean>(false);
  const [selectedShape, setSelectedShape] = useState<O.Option<SitShape>>(
    O.none
  );
  const [editingText, setEditingText] = useState<O.Option<Text>>(O.none);
  const [editingImageUrl, setEditingImageUrl] = useState<O.Option<string>>(
    O.none
  );

  const [stageContainerSize, setStageContainerSize] = useState<Size>({
    width: 400,
    height: 400,
  });

  const [stageInfo, setStageInfo] = useState<StageInfo>({
    offsetOfCanvas: { x: 0, y: 0 },
    scale: 1,
    viewPortOrigin: { x: 0, y: 0 },
    viewPortSize: { width: 400, height: 400 },
    drawingArea: {
      origin: { x: 100, y: 100 },
      topLeft: { x: 0, y: 0 },
      bottomRight: { x: 200, y: 200 },
    },
  });

  const [backgroundImg, setBackgroundImg] = useState<
    O.Option<HTMLImageElement>
  >(O.none);

  const [dragStartPoint, setDragStartPoint] = useState<O.Option<Point>>(O.none);

  const [dragVector, setDragVector] = useState<O.Option<Point>>(O.none);

  const [clipRect, setClipRect] = useState<Rect>({
    _tag: 'rect',
    name: `rect-clip-0`,
    id: 0,
    origin: { x: 0, y: 0 },
    width: 100,
    height: 100,
    scaleX: 1,
    scaleY: 1,
  });

  useEffect(() => {
    setSelectedShape(O.none);
  }, [currentMode]);

  useEffect(() => {
    const newStageWidth = stageContainerSize.width / stageInfo.scale;
    const newStageHeight = stageContainerSize.height / stageInfo.scale;

    setStageInfo({
      ...stageInfo,
      viewPortSize: { width: newStageWidth, height: newStageHeight },
      drawingArea: {
        ...stageInfo.drawingArea,
        origin: {
          x:
            stageInfo.drawingArea.origin.x +
            (newStageWidth - stageInfo.viewPortSize.width) / 2,
          y:
            stageInfo.drawingArea.origin.y +
            (newStageHeight - stageInfo.viewPortSize.height) / 2,
        },
      },
    });
  }, [stageContainerSize]);

  useEffect(() => {
    setClipRect({
      ...clipRect,
      origin: {
        x: stageInfo.viewPortSize.width / 4 + stageInfo.viewPortOrigin.x,
        y: stageInfo.viewPortSize.height / 4 + stageInfo.viewPortOrigin.y,
      },
      width: stageInfo.viewPortSize.width / 2,
      height: stageInfo.viewPortSize.height / 2,
    });
  }, [stageInfo]);

  useEffect(() => {
    const width = O.getOrElse(() => stageContainerSize.width)(
      O.map<HTMLImageElement, number>((x) => x.width)(backgroundImg)
    );
    const height = O.getOrElse(() => stageContainerSize.height)(
      O.map<HTMLImageElement, number>((x) => x.height)(backgroundImg)
    );

    setStageInfo({
      ...stageInfo,
      offsetOfCanvas: { x: 0, y: 0 },
      scale: 1,
      viewPortOrigin: { x: 0, y: 0 },
      viewPortSize: stageContainerSize,
      drawingArea: {
        origin: {
          x: (stageContainerSize.width - width) / 2,
          y: (stageContainerSize.height - height) / 2,
        },
        topLeft: { x: 0, y: 0 },
        bottomRight: {
          x: width,
          y: height,
        },
      },
    });
    setClipRect({
      ...clipRect,
      origin: {
        x: (stageContainerSize.width - width) / 2,
        y: (stageContainerSize.height - height) / 2,
      },
      width: width,
      height: height,
    });
    rectState.clear();
    textState.clear();
    linesState.clear();
    setDragStartPoint(O.none);
    setDragVector(O.none);
    toggleDrawing(false);
    setSelectedShape(O.none);
    setMode('NONE');
    setEditingText(O.none);
  }, [backgroundImg]);

  useEffect(() => {
    updateDrawingAreaRect();
  }, [rectState.rects, textState.texts, linesState.lines]);

  useEffect(() => {
    if (O.isSome(dragVector) && O.isSome(dragStartPoint)) {
      const newOrigin = {
        x: dragStartPoint.value.x + dragVector.value.x,
        y: dragStartPoint.value.y + dragVector.value.y,
      };
      setStageInfo({
        ...stageInfo,
        drawingArea: { ...stageInfo.drawingArea, origin: newOrigin },
      });
    }
  }, [dragStartPoint, dragVector]);

  const fromStageToDrawingArea = (point: Point) => {
    return {
      x: point.x - stageInfo.drawingArea.origin.x,
      y: point.y - stageInfo.drawingArea.origin.y,
    };
  };

  const fromDrawingAreaToStage = (point: Point) => {
    return {
      x: point.x + stageInfo.drawingArea.origin.x,
      y: point.y + stageInfo.drawingArea.origin.y,
    };
  };

  const startToDraw = (point: Point) => {
    if (currentMode === 'CLIP') {
      return;
    }

    const drawingAreaPoint = fromStageToDrawingArea(point);
    if (O.isSome(editingText)) {
      endToEdit();
    }
    setSelectedShape(O.none);
    toggleDrawing(true);

    if (currentMode === 'RECT') {
      rectState.startToDraw(drawingAreaPoint);
    }

    if (currentMode === 'TEXT') {
      if (O.isNone(editingText)) {
        const newText = textState.startToDraw(drawingAreaPoint);
        setEditingText(O.some(newText));
      }
    }

    if (currentMode === 'NONE') {
      //Don't move if it is outside of drawing area
      if (
        drawingAreaPoint.x < stageInfo.drawingArea.topLeft.x ||
        drawingAreaPoint.x > stageInfo.drawingArea.bottomRight.x ||
        drawingAreaPoint.y < stageInfo.drawingArea.topLeft.y ||
        drawingAreaPoint.y > stageInfo.drawingArea.bottomRight.y
      ) {
        return;
      }

      setDragStartPoint(O.some(point));
      setDragVector(
        O.some({
          x: stageInfo.drawingArea.origin.x - point.x,
          y: stageInfo.drawingArea.origin.y - point.y,
        })
      );
    }

    if (currentMode === 'ZOOM_IN' || currentMode === 'ZOOM_OUT') {
      zoom(point, currentMode === 'ZOOM_IN');
    }

    if (currentMode === 'LINE') {
      linesState.startToDraw(drawingAreaPoint);
    }
  };

  const zoom = (point: Point, isZoomIn: boolean) => {
    const { scale: oldScale } = stageInfo;

    const newScale = isZoomIn ? oldScale * 1.1 : oldScale / 1.1;

    const mousePointTo = {
      x: (point.x - stageInfo.viewPortOrigin.x) * oldScale,
      y: (point.y - stageInfo.viewPortOrigin.y) * oldScale,
    };

    const newViewPortOrigin = {
      x: point.x - mousePointTo.x / newScale,
      y: point.y - mousePointTo.y / newScale,
    };

    const newOffset = {
      x: -1 * newViewPortOrigin.x * newScale,
      y: -1 * newViewPortOrigin.y * newScale,
    };

    const newSize = {
      width: stageContainerSize.width / newScale,
      height: stageContainerSize.height / newScale,
    };

    setStageInfo({
      ...stageInfo,
      viewPortSize: newSize,
      viewPortOrigin: newViewPortOrigin,
      offsetOfCanvas: newOffset,
      scale: newScale,
    });
  };

  const drawing = (point: Point) => {
    const drawingAreaPoint = fromStageToDrawingArea(point);
    if (currentMode === 'RECT' && isDrawing) {
      rectState.drawing(drawingAreaPoint);
    }

    if (currentMode === 'NONE' && O.isSome(dragStartPoint)) {
      setDragStartPoint(O.some(point));
    }

    if (currentMode === 'LINE' && isDrawing) {
      linesState.drawing(drawingAreaPoint);
    }
  };

  const endToDraw = () => {
    toggleDrawing(false);
    if (currentMode === 'RECT') {
      rectState.endToDraw();
    }

    if (currentMode === 'NONE') {
      setDragStartPoint(O.none);
      setDragVector(O.none);
    }

    if (currentMode === 'LINE') {
      linesState.endToDraw();
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

  const onSelect = (shape: SitShape) => {
    if (currentMode === 'CLIP') {
      return;
    }
    setSelectedShape(
      O.some({ ...shape, origin: fromStageToDrawingArea(shape.origin) })
    );
  };

  const getSelectedShape = () => selectedShape;

  const deleteSelectedShape = () => {
    if (currentMode === 'CLIP') {
      return;
    }

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

  const getAllLines = () =>
    linesState.getAllLines().map((line) => ({
      ...line,
      points: line.points.map((p) => fromDrawingAreaToStage(p)),
    }));

  const updateShape = (shape: SitShape) => {
    if (currentMode === 'CLIP') {
      return;
    }
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

  const updateDrawingAreaRect = () => {
    const { topLeft, bottomRight } = stageInfo.drawingArea;
    let minX = topLeft.x;
    let minY = topLeft.y;
    let maxX = bottomRight.x;
    let maxY = bottomRight.y;

    rectState.getAllRects().forEach((rect) => {
      const { topLeft: rectTopLeft, bottomRight: rectBottomRight } =
        getTopLeftAndBottomRight(rect);

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

    linesState.getAllLines().forEach((line) => {
      line.points.forEach((point) => {
        minX = minX < point.x ? minX : point.x;
        minY = minY < point.y ? minY : point.y;
        maxX = maxX > point.x ? maxX : point.x;
        maxY = maxY > point.y ? maxY : point.y;
      });
    });

    setStageInfo({
      ...stageInfo,
      drawingArea: {
        ...stageInfo.drawingArea,
        topLeft: { x: minX, y: minY },
        bottomRight: { x: maxX, y: maxY },
      },
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
    getAllRects,
    getAllTexts,
    getAllLines,
    updateShape,
    backgroundImg,
    setBackgroundImg,
    setStageContainerSize,
    stageInfo,
    clipRect,
    setClipRect,
    zoom,
  };
}

// eslint-disable-next-line import/prefer-default-export
export const ShapeContainer = createContainer(useShapes);
