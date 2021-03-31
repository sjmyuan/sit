import React, { useState } from 'react';
import { Box, makeStyles } from '@material-ui/core';
import { Stage, Layer, Rect } from 'react-konva';
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
  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid red',
      }}
    >
      <Stage
        className={classes.konva}
        width={400}
        height={400}
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
          {rects.rects.map((rect) => {
            return (
              <React.Fragment>
                <Rect
                  x={rect.origin.x}
                  y={rect.origin.y}
                  width={rect.width}
                  height={rect.height}
                  globalCompositeOperation="destination-out"
                  fill="black"
                  listening={false}
                />
                <Rect
                  key={`rect-${rect.id}`}
                  x={rect.origin.x}
                  y={rect.origin.y}
                  width={rect.width}
                  height={rect.height}
                  strokeWidth={2}
                  stroke="red"
                  fill="transparent"
                />
              </React.Fragment>
            );
          })}
        </Layer>
      </Stage>
    </Box>
  );
};

export default EditorPage;
