import React, { useState, useRef, useEffect } from 'react';
import * as O from 'fp-ts/Option';
import { Box, debounce } from '@mui/material';
import { Stage, Layer, Image, Rect as ReactKonvaRect } from 'react-konva';
import { Stage as KonvaStage } from 'konva/types/Stage';
import { Rect as KonvaRect } from 'konva/types/shapes/Rect';
import { constVoid, pipe } from 'fp-ts/lib/function';
import { clipboard, nativeImage } from 'electron';
import MouseTrap from 'mousetrap';
import Rectangle from './Rectangle';
import TransformerComponent from './TransformerComponent';
import TextComponent from './TextComponent';
import TextEditor from './TextEditor';
import { ShapeContainer } from '../../store/ShapesContainer';
import { InfoContainer } from '../../store/InfoContainer';
import { getAbsolutePosition, getSize, Point, TE } from '../../types';
import { css } from '@emotion/css';
import ToolPanel from '../toolbar/ToolPanel';
import { KonvaEventObject } from 'konva/types/Node';
import LineComponent from './LineComponent';
import LinePropertiesPanel from '../toolbar/LinePropertiesPanel';
import RectPropertiesPanel from '../toolbar/RectPropertiesPanel';
import TextPropertiesPanel from '../toolbar/TextPropertiesPanel';
import { CommandsContainer } from '../../store/CommandContainer';
import { ImageContainer } from '../../store/ImageContainer';
import { getImageCacheUrl } from '../../utils/localImages';

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
  const newStage: KonvaStage = stage.clone({
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  });

  clipboard.writeImage(
    nativeImage.createFromDataURL(
      newStage.toDataURL({
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
  const commands = CommandsContainer.useContainer();
  const imageContainer = ImageContainer.useContainer();
  const stageRef = useRef<KonvaStage>(null);
  const drawingAreaRef = useRef<KonvaRect>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const editingImageUrl = O.getOrElse<string>(() => '')(
    shapes.getEditingImageUrl()
  );

  const [needCopy, setNeedCopy] = useState<boolean>(false);

  const [needDelete, setNeedDelete] = useState<boolean>(false);

  const [needUndo, setNeedUndo] = useState<boolean>(false);

  const [needRedo, setNeedRedo] = useState<boolean>(false);

  const drawingAreaTopLeft = getAbsolutePosition(
    shapes.stageInfo.drawingArea.origin,
    shapes.stageInfo.drawingArea.topLeft
  );
  const drawingAreaSize = getSize(
    shapes.stageInfo.drawingArea.topLeft,
    shapes.stageInfo.drawingArea.bottomRight
  );

  useEffect(() => {
    MouseTrap.bind(['ctrl+c', 'command+c'], () => {
      setNeedCopy(true); // can not fetch latest state in event listener, so do this workaround
    });
    MouseTrap.bind(['delete', 'backspace'], () => {
      setNeedDelete(true);
    });
    MouseTrap.bind(['ctrl+z', 'command+z'], () => {
      setNeedUndo(true);
    });
    MouseTrap.bind(['shift+ctrl+z', 'shift+command+z'], () => {
      setNeedRedo(true);
    });

    const debouncedHandleResize = debounce(function handleResize() {
      if (containerRef.current) {
        shapes.setStageContainerSize({
          width: containerRef.current.getBoundingClientRect().width,
          height: containerRef.current.getBoundingClientRect().height,
        });
      }
    }, 500);

    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      MouseTrap.unbind(['ctrl+c', 'command+c']);
      MouseTrap.unbind(['delete', 'backspace']);
      MouseTrap.unbind(['ctrl+z', 'command+z']);
      MouseTrap.unbind(['shift+ctrl+z', 'shift+command+z']);
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      shapes.setStageContainerSize({
        width: containerRef.current.getBoundingClientRect().width,
        height: containerRef.current.getBoundingClientRect().height,
      });
    }
  }, [containerRef.current]);

  useEffect(() => {
    if (editingImageUrl === '') {
      setTimeout(() => {
        shapes.setBackgroundImg(O.none);
      }, 100);
    } else {
      const image = new window.Image();
      image.src = editingImageUrl;
      image.addEventListener('load', () => {
        setTimeout(() => {
          shapes.setBackgroundImg(O.some(image));
        }, 100);
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
    if (needUndo) {
      commands.undo();
    }
    setNeedUndo(false);
  }, [needUndo]);

  useEffect(() => {
    if (needRedo) {
      commands.redo();
    }
    setNeedRedo(false);
  }, [needRedo]);

  useEffect(() => {
    if (shapes.saveChanges && stageRef && stageRef.current) {
      const newStage: KonvaStage = stageRef.current.getStage().clone({
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
      });

      const image = nativeImage.createFromDataURL(
        newStage.toDataURL({
          x: drawingAreaTopLeft.x,
          y: drawingAreaTopLeft.y,
          width: drawingAreaSize.width,
          height: drawingAreaSize.height,
          mimeType: 'image/png',
        })
      );
      const key = `clipboard-${Date.now()}.png`;
      pipe(
        imageContainer.addImage(key, new Blob([image.toPNG()])),
        TE.chain((_) => getImageCacheUrl(key)),
        TE.map((url: string) => {
          if (O.isSome(shapes.editingImageUrl)) {
            return shapes.setEditingImage(O.some(url));
          }
          return constVoid();
        })
      )();
    }

    shapes.setSaveChanges(false);
  }, [shapes.saveChanges]);

  const handleClipChange = (e: KonvaEventObject<any>) => {
    const rect = e.target as KonvaRect;
    shapes.setClipRect({
      ...shapes.clipRect,
      origin: { x: rect.x(), y: rect.y() },
      width: rect.width(),
      height: rect.height(),
      scaleX: rect.scaleX(),
      scaleY: rect.scaleY(),
    });
  };

  const handleClip = () => {
    if (stageRef.current) {
      const newStage: KonvaStage = stageRef.current.clone({
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
      });

      const image = newStage.toDataURL({
        x: shapes.clipRect.origin.x + 1,
        y: shapes.clipRect.origin.y + 1,
        width: shapes.clipRect.width * shapes.clipRect.scaleX - 2,
        height: shapes.clipRect.height * shapes.clipRect.scaleY - 2,
        mimeType: 'image/png',
      });

      shapes.setEditingImage(O.some(image));
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        backgroundColor: 'green',
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      <Box
        sx={{
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 20,
          zIndex: 1,
        }}
      >
        <Box sx={{ background: 'white', borderRadius: 1 }}>
          <ToolPanel onClip={handleClip} />
        </Box>
      </Box>
      <Box
        sx={{
          backgroundColor: 'transparent',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 40,
          position: 'absolute',
          top: 20,
          left: 0,
          right: 0,
          zIndex: 1,
        }}
      >
        <Box sx={{ background: 'white', borderRadius: 1 }}>
          {shapes.currentMode === 'LINE' ? <LinePropertiesPanel /> : null}
          {shapes.currentMode === 'RECT' ? <RectPropertiesPanel /> : null}
          {shapes.currentMode === 'TEXT' ? <TextPropertiesPanel /> : null}
        </Box>
      </Box>
      <Stage
        className={css`
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: red;
        `}
        x={shapes.stageInfo.offsetOfCanvas.x}
        y={shapes.stageInfo.offsetOfCanvas.y}
        scaleX={shapes.stageInfo.scale}
        scaleY={shapes.stageInfo.scale}
        ref={stageRef}
        width={shapes.stageInfo.viewPortSize.width * shapes.stageInfo.scale}
        height={shapes.stageInfo.viewPortSize.height * shapes.stageInfo.scale}
        onMouseUp={() => {
          shapes.endToDraw();
        }}
        onMouseMove={(e) => {
          const stage = e.target.getStage();
          stage && shapes.drawing(getRelativePointerPosition(stage));
        }}
        onWheel={(e) => {
          const stage = e.target.getStage();
          stage &&
            shapes.zoom(getRelativePointerPosition(stage), e.evt.deltaY > 0);
        }}
      >
        <Layer
          onMouseDown={(e) => {
            const stage = e.target.getStage();
            stage && shapes.startToDraw(getRelativePointerPosition(stage));
          }}
        >
          <ReactKonvaRect
            x={(0 - shapes.stageInfo.offsetOfCanvas.x) / shapes.stageInfo.scale}
            y={(0 - shapes.stageInfo.offsetOfCanvas.y) / shapes.stageInfo.scale}
            width={shapes.stageInfo.viewPortSize.width}
            height={shapes.stageInfo.viewPortSize.height}
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
          {O.isSome(shapes.backgroundImg) && (
            <Image
              x={shapes.stageInfo.drawingArea.origin.x}
              y={shapes.stageInfo.drawingArea.origin.y}
              width={shapes.backgroundImg.value.width}
              height={shapes.backgroundImg.value.height}
              image={O.toUndefined(shapes.backgroundImg)}
            />
          )}
        </Layer>
        <Layer>
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
          {shapes.getAllLines().map((line) => {
            return <LineComponent line={line} />;
          })}
        </Layer>
        <Layer>
          {shapes.currentMode === 'CLIP' && (
            <ReactKonvaRect
              x={shapes.clipRect.origin.x}
              y={shapes.clipRect.origin.y}
              width={shapes.clipRect.width}
              height={shapes.clipRect.height}
              strokeWidth={shapes.clipRect.props.strokeWidth}
              stroke={shapes.clipRect.props.stroke}
              fill="transparent"
              scaleX={shapes.clipRect.scaleX}
              scaleY={shapes.clipRect.scaleY}
              name={shapes.clipRect.name}
              strokeScaleEnabled={false}
              onDragEnd={handleClipChange}
              onTransformEnd={handleClipChange}
              draggable
            />
          )}
          {shapes.currentMode === 'CLIP' ? (
            <TransformerComponent selectedShape={shapes.clipRect} />
          ) : (
            <></>
          )}
        </Layer>
      </Stage>

      <TextEditor
        getRelativePos={() => {
          const pos = stageRef.current
            ? {
                x: stageRef.current.getStage().container().offsetLeft,

                y: stageRef.current.getStage().container().offsetTop,
              }
            : { x: -1, y: -1 };
          return pos;
        }}
      />
    </Box>
  );
};

export default Editor;
