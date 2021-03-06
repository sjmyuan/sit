import { Text } from '../../store-unstated';
import { Text as ReactKonvaText } from 'react-konva';

type TextProps = {
  text: Text;
  onChange: (text: Text) => void;
  startToEdit: (text: Text) => void;
};

const TextComponent = (props: TextProps) => {
  return (
    <ReactKonvaText
      stroke="rgb(220,50,105)"
      fill="rgb(220,50,105)"
      fontSize={30}
      fontWeight="bold"
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
