import React from 'react';
import { Rect } from '../../store-unstated';
import { Rect as ReactKonvaRect } from 'react-konva';
import { KonvaEventObject } from 'konva/types/Node';
import Konva from 'konva';

type RectangleProps = {
  rect: Rect;
  onTransform: (rect: Rect) => void;
  onSelected: (name: string) => void;
};

const Rectangle = (props: RectangleProps) => {
  const name = `rect-${props.rect.id}`;
  const handleChange = (e: KonvaEventObject<any>) => {
    const rect = e.target as Konva.Rect;
    // take a look into width and height properties
    // by default Transformer will change scaleX and scaleY
    // while transforming
    // so we need to adjust that properties to width and height
    props.onTransform({
      id: props.rect.id,
      origin: { x: rect.x(), y: rect.y() },
      width: rect.width() * rect.scaleX(),
      height: rect.height() * rect.scaleY(),
    });
  };
  return (
    <ReactKonvaRect
      x={props.rect.origin.x}
      y={props.rect.origin.y}
      width={props.rect.width}
      height={props.rect.height}
      strokeWidth={4}
      stroke="red"
      fill="transparent"
      // force no scaling
      // otherwise Transformer will change it
      scaleX={1}
      scaleY={1}
      name={name}
      // save state on dragend or transformend
      onDragEnd={handleChange}
      onTransformEnd={handleChange}
      onClick={() => props.onSelected(name)}
      draggable
    />
  );
};

export default Rectangle;
