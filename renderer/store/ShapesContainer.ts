import { pipe } from 'fp-ts/lib/function';
import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
import {
  O,
  MODE,
  Point,
  Text,
  SitShape,
  Area,
  getTopLeftAndBottomRight,
  StageInfo,
  Size,
  getAbsolutePosition,
} from '../types';
import { MasksContainer } from './MaskContainer';
import { RectsContainer } from './RectsContainer';
import { TextsContainer } from './TextContainer';

function useShapes() {
  const rectState = RectsContainer.useContainer();
  const textState = TextsContainer.useContainer();
  const maskState = MasksContainer.useContainer();

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
    offset: { x: 0, y: 0 },
    scale: 1,
    size: { width: 400, height: 400 },
  });

  const [drawingArea, setDrawingArea] = useState<Area>({
    origin: { x: 200, y: 200 },
    topLeft: { x: 0, y: 0 },
    bottomRight: { x: -1, y: -1 },
  });

  const [backgroundImg, setBackgroundImg] = useState<
    O.Option<HTMLImageElement>
  >(O.none);

  const [initialized, setInitialized] = useState<boolean>(false);

  const [dragStartPoint, setDragStartPoint] = useState<O.Option<Point>>(O.none);

  const [dragVector, setDragVector] = useState<O.Option<Point>>(O.none);

  useEffect(() => {
    const newStageWidth = stageContainerSize.width / stageInfo.scale + 200;
    const newStageHeight = stageContainerSize.height / stageInfo.scale + 200;

    // const newOffset = {
    //   x: stageInfo.offset.x - (stageInfo.size.width - newStageWidth) / 2,
    //   y: stageInfo.offset.y - (stageInfo.size.height - newStageHeight) / 2,
    // };
    const newOffset = {
      x: stageInfo.offset.x,
      y: stageInfo.offset.y,
    };

    setDrawingArea({
      ...drawingArea,
      origin: {
        x: drawingArea.origin.x + (newStageWidth - stageInfo.size.width) / 2,
        y: drawingArea.origin.y + (newStageHeight - stageInfo.size.height) / 2,
      },
    });

    setStageInfo({
      ...stageInfo,
      offset: newOffset,
      size: { width: newStageWidth, height: newStageHeight },
    });
  }, [stageContainerSize]);

  useEffect(() => {
    const width = O.getOrElse(() => 400)(
      O.map<HTMLImageElement, number>((x) => x.width)(backgroundImg)
    );
    const height = O.getOrElse(() => 400)(
      O.map<HTMLImageElement, number>((x) => x.height)(backgroundImg)
    );
    setDrawingArea({
      origin: {
        x: (stageInfo.size.width - width) / 2,
        y: (stageInfo.size.height - height) / 2,
      },
      topLeft: { x: 0, y: 0 },
      bottomRight: {
        x: width,
        y: height,
      },
    });
    setInitialized(true);
  }, [backgroundImg]);

  useEffect(() => {
    if (initialized) {
      updateDrawingAreaRect();
    }
  }, [rectState.rects, textState.texts, maskState.masks]);

  useEffect(() => {
    if (initialized) {
      updateDrawingAreaOrigin();
    }
  }, [initialized]);

  useEffect(() => {
    if (O.isSome(dragVector) && O.isSome(dragStartPoint)) {
      const newOrigin = {
        x: dragStartPoint.value.x + dragVector.value.x,
        y: dragStartPoint.value.y + dragVector.value.y,
      };
      setDrawingArea({ ...drawingArea, origin: newOrigin });
    }
  }, [dragStartPoint, dragVector]);

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
    console.log('start to draw....');
    console.log('point...', point);
    console.log('stageInfo', stageInfo);
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

    if (currentMode === 'MASK') {
      maskState.startToDraw(drawingAreaPoint);
    }

    if (currentMode === 'NONE') {
      //Don't move if it is outside of drawing area
      if (
        drawingAreaPoint.x < drawingArea.topLeft.x ||
        drawingAreaPoint.x > drawingArea.bottomRight.x ||
        drawingAreaPoint.y < drawingArea.topLeft.y ||
        drawingAreaPoint.y > drawingArea.bottomRight.y
      ) {
        return;
      }

      setDragStartPoint(O.some(point));
      setDragVector(
        O.some({
          x: drawingArea.origin.x - point.x,
          y: drawingArea.origin.y - point.y,
        })
      );
    }

    if (currentMode === 'ZOOM_IN' || currentMode === 'ZOOM_OUT') {
      const { offset: oldOffset, scale: oldScale, size } = stageInfo;

      const newScale =
        currentMode === 'ZOOM_IN' ? oldScale * 1.1 : oldScale / 1.1;

      const newActualStageWidth = size.width * newScale;
      const newActualStageHeight = size.height * newScale;

      //Do nothing if the stage size smaller than container size
      if (
        newActualStageWidth < stageContainerSize.width ||
        newActualStageHeight < stageContainerSize.height
      ) {
        return;
      }

      const mousePointTo = {
        x: (point.x - oldOffset.x) / oldScale,
        y: (point.y - oldOffset.y) / oldScale,
      };

      const newOffset = {
        x: point.x - mousePointTo.x * newScale,
        y: point.y - mousePointTo.y * newScale,
      };

      setStageInfo({ ...stageInfo, offset: newOffset, scale: newScale });
    }
  };

  const drawing = (point: Point) => {
    const drawingAreaPoint = fromStageToDrawingArea(point);
    if (currentMode === 'RECT' && isDrawing) {
      rectState.drawing(drawingAreaPoint);
    }

    if (currentMode === 'MASK' && isDrawing) {
      maskState.drawing(drawingAreaPoint);
    }

    if (currentMode === 'NONE' && O.isSome(dragStartPoint)) {
      setDragStartPoint(O.some(point));
    }
  };

  const endToDraw = () => {
    toggleDrawing(false);
    if (currentMode === 'RECT') {
      rectState.endToDraw();
    }

    if (currentMode === 'MASK') {
      maskState.endToDraw();
    }

    if (currentMode === 'NONE') {
      setDragStartPoint(O.none);
      setDragVector(O.none);
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
      } else if (shape._tag === 'mask') {
        maskState.deleteMask(shape);
      }

      setSelectedShape(O.none);
    }
  };

  const getEditingImageUrl = () => editingImageUrl;

  const setEditingImage = (url: O.Option<string>) => {
    rectState.clear();
    textState.clear();
    maskState.clear();
    setDragStartPoint(O.none);
    setDragVector(O.none);
    toggleDrawing(false);
    setSelectedShape(O.none);
    setMode('NONE');
    setEditingText(O.none);
    setEditingImageUrl(url);
    setStageInfo({
      ...stageInfo,
      offset: { x: 0, y: 0 },
      scale: 1,
      size: stageContainerSize,
    });
  };

  const getAllRects = () => {
    const originalRect = rectState.getAllRects();
    const transformedRect = originalRect.map((rect) => ({
      ...rect,
      origin: fromDrawingAreaToStage(rect.origin),
    }));

    return transformedRect;
  };

  const getAllMasks = () => {
    const originalMasks = maskState.getAllMasks();
    const transformedMask = originalMasks.map((mask) => ({
      ...mask,
      origin: fromDrawingAreaToStage(mask.origin),
    }));

    return transformedMask;
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

    if (drawingAreaShape._tag === 'mask') {
      maskState.update(drawingAreaShape);
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
    const { width: stageWidth, height: stageHeight } = stageInfo.size;
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
      const { topLeft: rectTopLeft, bottomRight: rectBottomRight } =
        getTopLeftAndBottomRight(rect);

      minX = minX < rectTopLeft.x ? minX : rectTopLeft.x;
      minY = minY < rectTopLeft.y ? minY : rectTopLeft.y;
      maxX = maxX > rectBottomRight.x ? maxX : rectBottomRight.x;
      maxY = maxY > rectBottomRight.y ? maxY : rectBottomRight.y;
    });

    maskState.getAllMasks().forEach((mask) => {
      const { topLeft: maskTopLeft, bottomRight: maskBottomRight } =
        getTopLeftAndBottomRight(mask);

      minX = minX < maskTopLeft.x ? minX : maskTopLeft.x;
      minY = minY < maskTopLeft.y ? minY : maskTopLeft.y;
      maxX = maxX > maskBottomRight.x ? maxX : maskBottomRight.x;
      maxY = maxY > maskBottomRight.y ? maxY : maskBottomRight.y;
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
    setDrawingArea,
    drawingArea,
    getAllRects,
    getAllTexts,
    getAllMasks,
    updateShape,
    backgroundImg,
    setBackgroundImg,
    setStageContainerSize,
    stageInfo,
  };
}

// eslint-disable-next-line import/prefer-default-export
export const ShapeContainer = createContainer(useShapes);
