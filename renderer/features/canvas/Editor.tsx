import React, { useState, useRef, useEffect } from 'react';
import * as O from 'fp-ts/Option';
import * as T from 'fp-ts/Task';
import { Box, debounce, makeStyles } from '@material-ui/core';
import { Stage, Layer, Image, Rect as ReactKonvaRect } from 'react-konva';
import { Stage as KonvaStage } from 'konva/types/Stage';
import { constVoid, pipe } from 'fp-ts/lib/function';
import { ipcRenderer, clipboard, nativeImage } from 'electron';
import MouseTrap from 'mousetrap';
import Rectangle from './Rectangle';
import TransformerComponent from './TransformerComponent';
import TextComponent from './TextComponent';
import TextEditor from './TextEditor';
import { ShapeContainer } from '../../store/ShapesContainer';
import { RectsContainer } from '../../store/RectsContainer';
import { TextsContainer } from '../../store/TextContainer';
import { InfoContainer } from '../../store/InfoContainer';

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

  // now we find relative point
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
  const rects = RectsContainer.useContainer();
  const texts = TextsContainer.useContainer();
  const notification = InfoContainer.useContainer();
  const stageRef = useRef<Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState<[number, number]>([400, 400]);
  const [imageSize, setImageSize] = useState<[number, number]>([100, 100]);
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
        setImageSize([image.width, image.height]);
        ipcRenderer.send('resize-main-window', [image.width, image.height]);
      });
    }
  }, [editingImageUrl]);

  useEffect(() => {
    MouseTrap.bind(['ctrl+c', 'command+c'], () => {
      copyImageToClipboard(stageRef.current.getStage());
      notification.showInfo(O.some('Image Copied to Clipboard'));
    });
    MouseTrap.bind(['delete', 'backspace'], () => {
      shapes.deleteSelectedShape();
    });
    const debouncedHandleResize = debounce(function handleResize() {
      setStageSize([
        containerRef.current.getBoundingClientRect().width,
        containerRef.current.getBoundingClientRect().height,
      ]);
    }, 1000);

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
          width={stageSize[0]}
          height={stageSize[1]}
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
              width={stageSize[0]}
              height={stageSize[1]}
              strokeWidth={0}
              fill="rgb(116,116,116)"
              name="paper"
            />
          </Layer>
          <Layer>
            <Image
              x={(stageSize[0] - imageSize[0]) / 2}
              y={(stageSize[1] - imageSize[1]) / 2}
              width={imageSize[0]}
              height={imageSize[1]}
              image={O.toUndefined(backgroundImg)}
            />
          </Layer>
          <Layer>
            {rects.getAllRects().map((rect) => {
              return (
                <Rectangle
                  key={rect.name}
                  rect={rect}
                  onSelected={() => shapes.onSelect(rect)}
                  onTransform={(transformedRect) =>
                    rects.update(transformedRect)
                  }
                />
              );
            })}
            {texts.texts
              .filter((text) =>
                pipe(
                  shapes.editingText,
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
                    onChange={texts.update}
                    startToEdit={shapes.startToEdit}
                  />
                );
              })}
          </Layer>
          <Layer>
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
          width={stageSize[0]}
          height={stageSize[1]}
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
