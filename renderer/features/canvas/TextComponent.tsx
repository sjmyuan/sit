import { Text as ReactKonvaText } from 'react-konva';
import React from 'react';
import { KonvaEventObject } from 'konva/types/Node';
import { Text } from '../../types';

type TextProps = {
  text: Text;
  onChange: (text: Text) => void;
  startToEdit: (text: Text) => void;
  onSelected: (name: Text) => void;
};

const TextComponent = (props: TextProps): React.ReactElement => {
  const handleMouseDown = (e: KonvaEventObject<any>) => {
    e.cancelBubble = true;
    props.onSelected(props.text);
  };
  return (
    <ReactKonvaText
      stroke={props.text.props.stroke}
      fill="rgb(220,50,105)"
      fontSize={props.text.props.fontSize}
      fontFamily="Calibri"
      fontWeight="bold"
      verticalAlign="middle"
      name={props.text.name}
      text={props.text.value}
      x={props.text.origin.x}
      y={props.text.origin.y}
      draggable
      onDragEnd={(e) =>
        props.onChange({
          ...props.text,
          origin: { x: e.target.x(), y: e.target.y() },
        })
      }
      onMouseDown={handleMouseDown}
      onDblClick={() => props.startToEdit(props.text)}
    />
  );
};

export default TextComponent;
