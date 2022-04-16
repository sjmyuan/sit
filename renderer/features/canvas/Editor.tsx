import React, { useState, useRef, useEffect } from 'react';
import * as O from 'fp-ts/Option';
import { Box, debounce } from '@mui/material';
import { Stage, Layer, Image, Rect as ReactKonvaRect } from 'react-konva';
import { Stage as KonvaStage } from 'konva/types/Stage';
import { Rect as KonvaRect } from 'konva/types/shapes/Rect';
import { pipe } from 'fp-ts/lib/function';
import { ipcRenderer, clipboard, nativeImage } from 'electron';
import MouseTrap from 'mousetrap';
import Rectangle from './Rectangle';
import TransformerComponent from './TransformerComponent';
import TextComponent from './TextComponent';
import TextEditor from './TextEditor';
import { ShapeContainer } from '../../store/ShapesContainer';
import { InfoContainer } from '../../store/InfoContainer';
import { getAbsolutePosition, getSize, Point } from '../../types';
import { css } from '@emotion/css';
import MaskComponent from './MaskComponent';

const MIN_HEIGHT = 580;

const getRelativePointerPosition = (node: KonvaStage) => {
  // the function will return pointer position relative to the passed node
  const transform = node.getAbsoluteTransform().copy();
  // to detect relative position we need to invert transform
  transform.invert();

  // get pointer (say mouse or touch) position
  const pos = node.getStage().getPointerPosition();

  // now we find relative point to the left top
  return pos ? transform.point(pos) : { x: 0, y: 0 };
};

const copyImageToClipboard = (
  stage: KonvaStage,
  topLeft: Point,
  width: number,
  height: number
) => {
  clipboard.writeImage(
    nativeImage.createFromDataURL(
      stage.toDataURL({
        x: topLeft.x,
        y: topLeft.y,
        width,
        height,
        mimeType: 'image/png',
      })
    )
  );
};

const Editor = (): React.ReactElement => {
  const shapes = ShapeContainer.useContainer();
  const selectedShape = shapes.getSelectedShape();
  const notification = InfoContainer.useContainer();
  const stageRef = useRef<KonvaStage>(null);
  const drawingAreaRef = useRef<KonvaRect>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const editingImageUrl = O.getOrElse<string>(() => '')(
    shapes.getEditingImageUrl()
  );

  const [needCopy, setNeedCopy] = useState<boolean>(false);

  const [needDelete, setNeedDelete] = useState<boolean>(false);

  const drawingAreaTopLeft = getAbsolutePosition(
    shapes.drawingArea.origin,
    shapes.drawingArea.topLeft
  );
  const drawingAreaSize = getSize(
    shapes.drawingArea.topLeft,
    shapes.drawingArea.bottomRight
  );

  useEffect(() => {
    if (editingImageUrl === '') {
      shapes.setBackgroundImg(O.none);
    } else {
      const image = new window.Image();
      image.src = editingImageUrl;
      image.addEventListener('load', () => {
        shapes.setBackgroundImg(O.some(image));
        ipcRenderer.send('resize-main-window', [
          image.width,
          image.height > MIN_HEIGHT ? image.height : MIN_HEIGHT,
        ]);
      });
    }
  }, [editingImageUrl]);

  useEffect(() => {
    if (needCopy && stageRef.current) {
      copyImageToClipboard(
        stageRef.current.getStage(),
        drawingAreaTopLeft,
        drawingAreaSize.width,
        drawingAreaSize.height
      );
      notification.showInfo(O.some('Image Copied to Clipboard'));
      setNeedCopy(false);
    }
  }, [needCopy]);

  useEffect(() => {
    if (needDelete) {
      shapes.deleteSelectedShape();
    }
    setNeedDelete(false);
  }, [needDelete]);

  useEffect(() => {
    MouseTrap.bind(['ctrl+c', 'command+c'], () => {
      setNeedCopy(true); // can not fetch latest state in event listener, so do this workaround
    });
    MouseTrap.bind(['delete', 'backspace'], () => {
      setNeedDelete(true);
    });

    const debouncedHandleResize = debounce(function handleResize() {
      if (containerRef.current) {
        shapes.setStageSize([
          containerRef.current.getBoundingClientRect().width,
          containerRef.current.getBoundingClientRect().height,
        ]);
      }
    }, 500);

    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      MouseTrap.unbind(['ctrl+c', 'command+c']);
      MouseTrap.unbind(['delete', 'backspace']);
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        minHeight: `${MIN_HEIGHT}px`,
        p: 0,
        backgroundColor: 'rgb(116,116,116)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
        overflow: 'scroll',
      }}
    >
      {O.isSome(shapes.backgroundImg) ? (
        <Stage
          className={css`
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: white;
          `}
          ref={stageRef}
          width={shapes.stageSize[0]}
          height={shapes.stageSize[1]}
          onMouseUp={() => {
            shapes.endToDraw();
          }}
          onMouseMove={(e) => {
            const stage = e.target.getStage();
            stage && shapes.drawing(getRelativePointerPosition(stage));
          }}
          onMouseDown={(e) => {
            const stage = e.target.getStage();
            stage && shapes.startToDraw(getRelativePointerPosition(stage));
          }}
        >
          <Layer>
            <ReactKonvaRect
              x={0}
              y={0}
              width={shapes.stageSize[0]}
              height={shapes.stageSize[1]}
              strokeWidth={0}
              fill="rgb(116,116,116)"
              name="full-paper"
            />
            <ReactKonvaRect
              ref={drawingAreaRef}
              x={drawingAreaTopLeft.x}
              y={drawingAreaTopLeft.y}
              width={drawingAreaSize.width}
              height={drawingAreaSize.height}
              strokeWidth={0}
              fill="white"
              name="drawing-area"
            />
            <Image
              x={shapes.drawingArea.origin.x}
              y={shapes.drawingArea.origin.y}
              width={shapes.backgroundImg.value.width}
              height={shapes.backgroundImg.value.height}
              image={O.toUndefined(shapes.backgroundImg)}
            />
            {shapes.getAllRects().map((rect) => {
              return (
                <Rectangle
                  key={rect.name}
                  rect={rect}
                  onSelected={() => shapes.onSelect(rect)}
                  onTransform={(transformedRect) =>
                    shapes.updateShape(transformedRect)
                  }
                />
              );
            })}
            {shapes.getAllMasks().map((mask) => {
              return (
                <MaskComponent
                  key={mask.name}
                  mask={mask}
                  onSelected={() => shapes.onSelect(mask)}
                  onTransform={(transformedMask) =>
                    shapes.updateShape(transformedMask)
                  }
                />
              );
            })}
            {shapes
              .getAllTexts()
              .filter((text) =>
                pipe(
                  shapes.getEditingText(),
                  O.map((x) => x.id !== text.id),
                  O.getOrElse<boolean>(() => true)
                )
              )
              .map((text) => {
                return (
                  <TextComponent
                    key={text.name}
                    text={text}
                    onSelected={() => shapes.onSelect(text)}
                    onChange={shapes.updateShape}
                    startToEdit={shapes.startToEdit}
                  />
                );
              })}
            {O.isSome(selectedShape) ? (
              <TransformerComponent selectedShape={selectedShape.value} />
            ) : (
              <></>
            )}
          </Layer>
        </Stage>
      ) : (
        <Stage
          className={css`
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: white;
          `}
          ref={stageRef}
          width={shapes.stageSize[0]}
          height={shapes.stageSize[1]}
        />
      )}
      <TextEditor
        getRelativePos={() =>
          stageRef.current
            ? {
                x: stageRef.current.getStage().container().offsetLeft,

                y: stageRef.current.getStage().container().offsetTop,
              }
            : { x: -1, y: -1 }
        }
      />
    </Box>
  );
};

export default Editor;
