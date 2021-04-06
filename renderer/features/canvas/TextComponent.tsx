import { Text } from '../../store-unstated';
import { Text as ReactKonvaText } from 'react-konva';
import { useState } from 'react';
import TextEditor from './TextEditor';

type TextProps = {
  text: Text;
  editing: boolean;
  onChange: (text: Text) => void;
  startToEdit: (text: Text) => void;
};

const TextComponent = (props: TextProps) => {
  if (props.editing) {
    return (
      <TextEditor
        value={props.text.value}
        rect={{ id: 0, origin: props.text.origin, width: 10, height: 10 }}
        onChange={(value) => props.onChange({ ...props.text, value: value })}
      />
    );
  }
  return (
    <ReactKonvaText
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
      onDblClick={() => props.startToEdit(props.text)}
    />
  );
};

export default TextComponent;
