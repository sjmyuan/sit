import React, { useState, useRef, useEffect } from 'react';
import * as O from 'fp-ts/Option';
import { Box, debounce, makeStyles } from '@material-ui/core';
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
import { Point } from '../../types';

const useStyles = makeStyles(() => ({
  konva: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
}));

const getRelativePointerPosition = (node: KonvaStage) => {
  // the function will return pointer position relative to the passed node
  const transform = node.getAbsoluteTransform().copy();
  // to detect relative position we need to invert transform
  transform.invert();

  // get pointer (say mouse or touch) position
  const pos = node.getStage().getPointerPosition();

  // now we find relative point to the left top
  return transform.point(pos);
};

const copyImageToClipboard = (stage: KonvaStage) => {
  clipboard.writeImage(
    nativeImage.createFromDataURL(
      stage.toDataURL({
        mimeType: 'image/png',
      })
    )
  );
};

const Editor = (): React.ReactElement => {
  const classes = useStyles();
  const shapes = ShapeContainer.useContainer();
  const selectedShape = shapes.getSelectedShape();
  const notification = InfoContainer.useContainer();
  const stageRef = useRef<Stage>(null);
  const drawingAreaRef = useRef<KonvaRect>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageOrigin, setImageOrigin] = useState<[number, number]>([0, 0]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [backgroundImg, setBackgroundImg] = useState<
    O.Option<HTMLImageElement>
  >(O.none);
  const editingImageUrl = O.getOrElse<string>(() => '')(
    shapes.getEditingImageUrl()
  );

  useEffect(() => {
    if (editingImageUrl === '') {
      setBackgroundImg(O.none);
    } else {
      const image = new window.Image();
      image.src = editingImageUrl;
      image.addEventListener('load', () => {
        setBackgroundImg(O.some(image));
        ipcRenderer.send('resize-main-window', [image.width, image.height]);
      });
    }
  }, [editingImageUrl]);

  useEffect(() => {
    if (O.isSome(backgroundImg)) {
      shapes.setDrawingArea({
        ...shapes.drawingArea,
        topLeft: { x: 0, y: 0 },
        bottomRight: {
          x: backgroundImg.value.width,
          y: backgroundImg.value.height,
        },
      });

      setIsInitialized(true);
    }
  }, [backgroundImg]);

  useEffect(() => {
    if (isInitialized) {
      shapes.updateDrawingAreaOrigin();
    }
  }, [shapes.stageSize, isInitialized]);

  useEffect(() => {
    MouseTrap.bind(['ctrl+c', 'command+c'], () => {
      copyImageToClipboard(stageRef.current.getStage());
      notification.showInfo(O.some('Image Copied to Clipboard'));
    });
    MouseTrap.bind(['delete', 'backspace'], () => {
      shapes.deleteSelectedShape();
    });

    const debouncedHandleResize = debounce(function handleResize() {
      shapes.setStageSize([
        containerRef.current.getBoundingClientRect().width,
        containerRef.current.getBoundingClientRect().height,
      ]);
    }, 500);

    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      MouseTrap.unbind(['ctrl+c', 'command+c']);
      MouseTrap.unbind(['delete', 'backspace']);
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [shapes.stageSize]);

  return (
    <Box
      ref={containerRef}
      sx={{
        minHeight: '580px',
        p: 0,
        backgroundColor: 'rgb(116,116,116)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
        overflow: 'scroll',
      }}
    >
      {O.isSome(backgroundImg) ? (
        <Stage
          ref={stageRef}
          className={classes.konva}
          width={shapes.stageSize[0]}
          height={shapes.stageSize[1]}
          onMouseUp={() => {
            shapes.endToDraw();
          }}
          onMouseMove={(e) => {
            shapes.drawing(getRelativePointerPosition(e.target.getStage()));
          }}
          onMouseDown={(e) => {
            shapes.startToDraw(getRelativePointerPosition(e.target.getStage()));
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
              x={shapes.drawingArea.topLeft.x + shapes.drawingArea.origin.x}
              y={shapes.drawingArea.topLeft.y + shapes.drawingArea.origin.y}
              width={
                shapes.drawingArea.bottomRight.x - shapes.drawingArea.topLeft.x
              }
              height={
                shapes.drawingArea.bottomRight.y - shapes.drawingArea.topLeft.y
              }
              strokeWidth={0}
              fill="white"
              name="drawing-area"
            />
            <Image
              x={imageOrigin[0] + shapes.drawingArea.origin.x}
              y={imageOrigin[1] + shapes.drawingArea.origin.y}
              width={backgroundImg.value.width}
              height={backgroundImg.value.height}
              image={O.toUndefined(backgroundImg)}
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
          ref={stageRef}
          className={classes.konva}
          width={shapes.stageSize[0]}
          height={shapes.stageSize[1]}
        />
      )}
      <TextEditor
        getRelativePos={() => ({
          x: stageRef.current.getStage().container().offsetLeft,
          y: stageRef.current.getStage().container().offsetTop,
        })}
      />
    </Box>
  );
};

export default Editor;
