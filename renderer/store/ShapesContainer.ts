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
  getSize,
  Rect,
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
      size: { width: newStageWidth, height: newStageHeight },
      drawingArea: {
        ...stageInfo.drawingArea,
        origin: {
          x:
            stageInfo.drawingArea.origin.x +
            (newStageWidth - stageInfo.size.width) / 2,
          y:
            stageInfo.drawingArea.origin.y +
            (newStageHeight - stageInfo.size.height) / 2,
        },
      },
    });
  }, [stageContainerSize]);

  useEffect(() => {
    setClipRect({
      ...clipRect,
      origin: {
        x: stageInfo.size.width / 4 - stageInfo.offset.x / stageInfo.scale,
        y: stageInfo.size.height / 4 - stageInfo.offset.y / stageInfo.scale,
      },
      width: stageInfo.size.width / 2,
      height: stageInfo.size.height / 2,
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
      offset: { x: 0, y: 0 },
      scale: 1,
      size: stageContainerSize,
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
    maskState.clear();
    setDragStartPoint(O.none);
    setDragVector(O.none);
    toggleDrawing(false);
    setSelectedShape(O.none);
    setMode('NONE');
    setEditingText(O.none);
  }, [backgroundImg]);

  useEffect(() => {
    updateDrawingAreaRect();
  }, [rectState.rects, textState.texts, maskState.masks]);

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

    if (currentMode === 'MASK') {
      maskState.startToDraw(drawingAreaPoint);
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
      const { offset: oldOffset, scale: oldScale, drawingArea } = stageInfo;

      const newScale =
        currentMode === 'ZOOM_IN' ? oldScale * 1.1 : oldScale / 1.1;

      const drawingAreaSize = getSize(
        drawingArea.topLeft,
        drawingArea.bottomRight
      );

      const newActualDrawingAreaWidth = drawingAreaSize.width * newScale;
      const newActualDrawingAreaHeight = drawingAreaSize.height * newScale;

      //Do nothing if the drawing area size smaller than container size
      if (
        newActualDrawingAreaWidth < stageContainerSize.width &&
        newActualDrawingAreaHeight < stageContainerSize.height
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

      const newSize = {
        width: stageContainerSize.width / newScale,
        height: stageContainerSize.height / newScale,
      };

      setStageInfo({
        ...stageInfo,
        size: newSize,
        offset: newOffset,
        scale: newScale,
      });
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
      } else if (shape._tag === 'mask') {
        maskState.deleteMask(shape);
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

    if (drawingAreaShape._tag === 'mask') {
      maskState.update(drawingAreaShape);
    }
  };

  /**
   * when resize window, we want the drawing area to be always the center of stage, because stage size will change
   * and the relative position of topeleft, bottomright should not be changed
   * when drawing outsize the drawing area, we want to keep the current origin and only change the position of topleft or bottomright
   */

  // const updateDrawingAreaOrigin = () => {
  //   const { origin, topLeft, bottomRight } = drawingArea;
  //   const drawingAreaWidth = Math.abs(bottomRight.x - topLeft.x);
  //   const drawingAreaHeight = Math.abs(bottomRight.y - topLeft.y);
  //   const { width: stageWidth, height: stageHeight } = stageInfo.size;
  //   const oldDrawingAreaOffset: [number, number] = [
  //     origin.x + topLeft.x,
  //     origin.y + topLeft.y,
  //   ];
  //   const newDrawingAreaOffset: [number, number] = [
  //     (stageWidth - drawingAreaWidth) / 2,
  //     (stageHeight - drawingAreaHeight) / 2,
  //   ];
  //   const newDrawingAreaOrigin = {
  //     x: origin.x + (newDrawingAreaOffset[0] - oldDrawingAreaOffset[0]),
  //     y: origin.y + (newDrawingAreaOffset[1] - oldDrawingAreaOffset[1]),
  //   };

  //   setDrawingArea({ ...drawingArea, origin: newDrawingAreaOrigin });
  // };

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

    setStageInfo({
      ...stageInfo,
      drawingArea: {
        ...stageInfo.drawingArea,
        topLeft: { x: minX, y: minY },
        bottomRight: { x: maxX, y: maxY },
      },
    });
  };

  // const initialize = (
  //   containerSize: Size,
  //   image: O.Option<HTMLImageElement>
  // ) => {
  //   const newStageWidth = containerSize.width / stageInfo.scale;
  //   const newStageHeight = containerSize.height / stageInfo.scale;

  //   const width = O.getOrElse(() => 400)(
  //     O.map<HTMLImageElement, number>((x) => x.width)(image)
  //   );
  //   const height = O.getOrElse(() => 400)(
  //     O.map<HTMLImageElement, number>((x) => x.height)(image)
  //   );
  //   setDrawingArea({
  //     origin: {
  //       x: (newStageWidth - width) / 2,
  //       y: (newStageHeight - height) / 2,
  //     },
  //     topLeft: { x: 0, y: 0 },
  //     bottomRight: {
  //       x: width,
  //       y: height,
  //     },
  //   });

  //   setStageInfo({
  //     ...stageInfo,
  //     size: { width: newStageWidth, height: newStageHeight },
  //   });

  //   setStageContainerSize(containerSize);

  //   setBackgroundImg(image);

  //   // setInitialized(true);
  // };

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
    // setDrawingArea,
    // drawingArea,
    getAllRects,
    getAllTexts,
    getAllMasks,
    updateShape,
    backgroundImg,
    setBackgroundImg,
    setStageContainerSize,
    stageInfo,
    clipRect,
    setClipRect,
  };
}

// eslint-disable-next-line import/prefer-default-export
export const ShapeContainer = createContainer(useShapes);
