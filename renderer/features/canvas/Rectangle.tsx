/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { Rect as ReactKonvaRect } from 'react-konva';
import { KonvaEventObject } from 'konva/types/Node';
import Konva from 'konva';
import { Rect } from '../../types';

type RectangleProps = {
  rect: Rect;
  onTransform: (rect: Rect) => void;
  onSelected: (rect: Rect) => void;
};

const Rectangle = (props: RectangleProps): React.ReactElement => {
  const handleChange = (e: KonvaEventObject<any>) => {
    const rect = e.target as Konva.Rect;
    // take a look into width and height properties
    // by default Transformer will change scaleX and scaleY
    // while transforming
    // so we need to adjust that properties to width and height
    console.log(`transform rect: ${JSON.stringify(rect)}`);
    props.onTransform({
      ...props.rect,
      origin: { x: rect.x(), y: rect.y() },
      width: rect.width() * rect.scaleX(),
      height: rect.height() * rect.scaleY(),
    });
  };
  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    props.onSelected(props.rect);
  };
  return (
    <ReactKonvaRect
      x={props.rect.origin.x}
      y={props.rect.origin.y}
      width={props.rect.width}
      height={props.rect.height}
      strokeWidth={4}
      stroke="rgb(220,50,105)"
      fill="transparent"
      // force no scaling
      // otherwise Transformer will change it
      scaleX={1}
      scaleY={1}
      name={props.rect.name}
      strokeScaleEnabled={false}
      // save state on dragend or transformend
      onDragEnd={handleChange}
      onTransformEnd={handleChange}
      onMouseDown={handleMouseDown}
      draggable
    />
  );
};

export default Rectangle;
