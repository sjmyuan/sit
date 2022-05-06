/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { Rect as ReactKonvaRect } from 'react-konva';
import { KonvaEventObject } from 'konva/types/Node';
import Konva from 'konva';
import { Mask } from '../../types';

type MaskProps = {
  mask: Mask;
  onTransform: (mask: Mask) => void;
  onSelected: (mask: Mask) => void;
};

const MaskComponent = (props: MaskProps): React.ReactElement => {
  const handleChange = (e: KonvaEventObject<any>) => {
    const rect = e.target as Konva.Rect;
    // take a look into width and height properties
    // by default Transformer will change scaleX and scaleY
    // while transforming
    // so we need to adjust that properties to width and height
    props.onTransform({
      ...props.mask,
      origin: { x: rect.x(), y: rect.y() },
      width: rect.width(),
      height: rect.height(),
      scaleX: rect.scaleX(),
      scaleY: rect.scaleY(),
    });
  };
  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    props.onSelected(props.mask);
  };
  return (
    <ReactKonvaRect
      x={props.mask.origin.x}
      y={props.mask.origin.y}
      width={props.mask.width}
      height={props.mask.height}
      strokeWidth={0}
      fill="white"
      // force no scaling
      // otherwise Transformer will change it
      scaleX={props.mask.scaleX}
      scaleY={props.mask.scaleY}
      name={props.mask.name}
      strokeScaleEnabled={false}
      // save state on dragend or transformend
      onDragEnd={handleChange}
      onTransformEnd={handleChange}
      onMouseDown={handleMouseDown}
      draggable
    />
  );
};

export default MaskComponent;
