import React, { useState, useEffect, useRef } from 'react';
import * as O from 'fp-ts/Option';
import { Box, makeStyles } from '@material-ui/core';
import { Stage, Layer, Image } from 'react-konva';
import { Stage as KonvaStage } from 'konva/types/Stage';
import { RectsContainer } from '../renderer/store-unstated';
import Rectangle from '../renderer/features/canvas/Rectangle';
import TransformerComponent from '../renderer/features/canvas/TransformerComponent';

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

  const [selectedRect, setSelectedRect] = useState<string>('');

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
        backgroundColor: 'rgb(116,116,116)',
      }}
    >
      {O.isSome(backgroundImg) ? (
        <Stage
          className={classes.konva}
          width={backgroundImg.value.width}
          height={backgroundImg.value.height}
          onMouseUp={() => {
            if (!isDrawing) {
              return;
            }
            console.log(rects.rects);
            toggleDrawing(false);
            rects.clearEmpty();
          }}
          onMouseMove={(e) => {
            const stage = e.target.getStage();
            if (isDrawing && stage) {
              rects.updateLast(getRelativePointerPosition(e.target.getStage()));
            }
          }}
        >
          <Layer>
            <Image
              onMouseDown={(e) => {
                setSelectedRect('');
                const stage = e.target.getStage();
                console.log(e.target);
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
                <Rectangle
                  key={`rect-${rect.id}`}
                  rect={rect}
                  onSelected={(name) => setSelectedRect(name)}
                  onTransform={(transformedRect) =>
                    rects.update(transformedRect)
                  }
                />
              );
            })}
          </Layer>
          <Layer>
            <TransformerComponent selectedShapeName={selectedRect} />
          </Layer>
        </Stage>
      ) : (
        <Stage className={classes.konva} width={400} height={400} />
      )}
    </Box>
  );
};

export default EditorPage;
