import React, { useState, useEffect, useRef } from 'react';
import * as O from 'fp-ts/Option';
import {
  Box,
  makeStyles,
  AppBar,
  Toolbar,
  IconButton,
} from '@material-ui/core';
import { CheckBoxOutlined, TextFields, PhotoLibrary } from '@material-ui/icons';
import { Stage, Layer, Image } from 'react-konva';
import { Stage as KonvaStage } from 'konva/types/Stage';
import {
  RectsContainer,
  ShapeContainer,
  TextsContainer,
} from '../renderer/store-unstated';
import Rectangle from '../renderer/features/canvas/Rectangle';
import TransformerComponent from '../renderer/features/canvas/TransformerComponent';
import TextComponent from '../renderer/features/canvas/TextComponent';
import { pipe } from 'fp-ts/lib/function';
import TextEditor from '../renderer/features/canvas/TextEditor';
import { db } from '../renderer/utils/AppDB';
import { ipcRenderer } from 'electron';

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
const EditorPage = (): React.ReactElement => {
  const classes = useStyles();
  const shapes = ShapeContainer.useContainer();
  const rects = RectsContainer.useContainer();
  const texts = TextsContainer.useContainer();
  const stageRef = useRef<Stage>(null);
  const [backgroundImg, setBackgroundImg] = useState<
    O.Option<HTMLImageElement>
  >(O.none);

  useEffect(() => {
    ipcRenderer.on('edit-image', (_, key: any) => {
      db.cache.get({ key: key }).then((imageCache) => {
        const image = new window.Image();
        image.src = URL.createObjectURL(imageCache.image);
        image.addEventListener('load', () => setBackgroundImg(O.some(image)));
      });
    });
  });
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="draw rectangle"
            disabled={shapes.currentMode === 'RECT'}
            onClick={() => shapes.setMode('RECT')}
          >
            <CheckBoxOutlined />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="add text"
            disabled={shapes.currentMode === 'TEXT'}
            onClick={() => shapes.setMode('TEXT')}
          >
            <TextFields />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="photo library"
            onClick={() => ipcRenderer.send('go-to-browser')}
          >
            <PhotoLibrary />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          p: 2,
          backgroundColor: 'rgb(116,116,116)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexGrow: 1,
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
    </Box>
  );
};

export default EditorPage;
