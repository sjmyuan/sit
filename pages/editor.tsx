import React, { useState, useEffect } from 'react';
import * as O from 'fp-ts/Option';
import { Box, makeStyles } from '@material-ui/core';
import { Stage, Layer, Rect, Image } from 'react-konva';
import { Stage as KonvaStage } from 'konva/types/Stage';
import { RectsContainer } from '../renderer/store-unstated';

const useStyles = makeStyles(() => ({
  konva: {
    border: '1px solid green',
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
  const rects = RectsContainer.useContainer();
  const [isDrawing, toggleDrawing] = useState<boolean>(false);
  const [backgroundImg, setBackgroundImg] = useState<
    O.Option<HTMLImageElement>
  >(O.none);

  useEffect(() => {
    const image = new window.Image();
    image.src =
      'https://images.shangjiaming.com/16d67370-f68f-4413-85df-f2751286c53d.png';
    image.addEventListener('load', () => setBackgroundImg(O.some(image)));
  });
  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid red',
      }}
    >
      {O.isSome(backgroundImg) ? (
        <Stage
          className={classes.konva}
          width={backgroundImg.value.width}
          height={backgroundImg.value.height}
          onMouseDown={(e) => {
            const stage = e.target.getStage();
            if (stage && !isDrawing) {
              toggleDrawing(true);
              const point = getRelativePointerPosition(stage);
              const rect = {
                id: rects.rects.length + 1,
                origin: point,
                width: 0,
                height: 0,
              };
              rects.add(rect);
              console.log(rects.rects);
            }
          }}
          onMouseMove={(e) => {
            const stage = e.target.getStage();
            if (isDrawing && stage) {
              rects.updateLast(getRelativePointerPosition(e.target.getStage()));
            }
          }}
          onMouseUp={() => {
            if (!isDrawing) {
              return;
            }
            console.log(rects.rects);
            rects.clearEmpty();
            toggleDrawing(false);
          }}
        >
          <Layer>
            <Image
              x={0}
              y={0}
              width={backgroundImg.value.width}
              height={backgroundImg.value.height}
              image={O.toUndefined(backgroundImg)}
            />
          </Layer>
          <Layer>
            {rects.rects.map((rect) => {
              return (
                <Rect
                  key={`rect-${rect.id}`}
                  x={rect.origin.x}
                  y={rect.origin.y}
                  width={rect.width}
                  height={rect.height}
                  strokeWidth={4}
                  stroke="red"
                  fill="transparent"
                />
              );
            })}
          </Layer>
        </Stage>
      ) : (
        <Stage className={classes.konva} width={400} height={400} />
      )}
    </Box>
  );
};

export default EditorPage;
