import React, { useState, useEffect, useRef } from 'react';
import * as O from 'fp-ts/Option';
import * as T from 'fp-ts/Task';
import { Box, makeStyles } from '@material-ui/core';
import { Stage, Layer, Image } from 'react-konva';
import { Stage as KonvaStage } from 'konva/types/Stage';
import {
  RectsContainer,
  ShapeContainer,
  TextsContainer,
} from '../../store-unstated';
import Rectangle from './Rectangle';
import TransformerComponent from './TransformerComponent';
import TextComponent from './TextComponent';
import { pipe } from 'fp-ts/lib/function';
import TextEditor from './TextEditor';

const useStyles = makeStyles(() => ({
  konva: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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

const Editor = (): React.ReactElement => {
  const classes = useStyles();
  const shapes = ShapeContainer.useContainer();
  const rects = RectsContainer.useContainer();
  const texts = TextsContainer.useContainer();
  const stageRef = useRef<Stage>(null);
  const [backgroundImg, setBackgroundImg] = useState<
    O.Option<HTMLImageElement>
  >(O.none);

  useEffect(() => {
    pipe(
      shapes.getEditingImageUrl(),
      T.map(O.fromEither),
      T.map((url) => {
        if (O.isSome(url)) {
          const image = new window.Image();
          image.src = url.value;
          image.addEventListener('load', () => setBackgroundImg(O.some(image)));
        } else {
          setBackgroundImg(O.none);
        }
      })
    )();
  });

  return (
    <Box
      sx={{
        p: 2,
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
          width={backgroundImg.value.width}
          height={backgroundImg.value.height}
          onMouseUp={() => {
            shapes.endToDraw();
            stageRef.current.getStage().toDataURL({
              mimeType: 'image/png',
              callback: (url) => {
                console.log('saving image....');
                return fetch(url).then((res) =>
                  res.blob().then((blob) => shapes.saveEditingImage(blob)())
                );
              },
            });
          }}
          onMouseMove={(e) => {
            shapes.drawing(getRelativePointerPosition(e.target.getStage()));
          }}
        >
          <Layer>
            <Image
              onMouseDown={(e) => {
                shapes.startToDraw(
                  getRelativePointerPosition(e.target.getStage())
                );
              }}
              x={0}
              y={0}
              width={backgroundImg.value.width}
              height={backgroundImg.value.height}
              image={O.toUndefined(backgroundImg)}
            />
          </Layer>
          <Layer>
            {rects.getAllRects().map((rect) => {
              return (
                <Rectangle
                  key={`rect-${rect.id}`}
                  rect={rect}
                  onSelected={(name) => shapes.onSelect(name)}
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
                  O.getOrElse(() => true)
                )
              )
              .map((text) => {
                return (
                  <TextComponent
                    key={`text-${text.id}`}
                    text={text}
                    onChange={texts.update}
                    startToEdit={shapes.startToEdit}
                  />
                );
              })}
          </Layer>
          <Layer>
            <TransformerComponent
              selectedShapeName={shapes.getSelectedShape()}
            />
          </Layer>
        </Stage>
      ) : (
        <Stage
          ref={stageRef}
          className={classes.konva}
          width={400}
          height={400}
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
