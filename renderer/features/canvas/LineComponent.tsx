/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { Line as ReactKonvaLine } from 'react-konva';
import { Line } from '../../types';

type LineProps = {
  line: Line;
};

const LineComponent = (props: LineProps): React.ReactElement => {
  return (
    <ReactKonvaLine
      points={props.line.points.flatMap((point) => [point.x, point.y])}
      name={props.line.name}
      strokeWidth={20}
      stroke="white"
      bezier={true}
      strokeScaleEnabled={false}
      draggable={false}
    />
  );
};

export default LineComponent;
