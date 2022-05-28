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
      strokeWidth={props.line.props.strokeWidth}
      stroke={props.line.props.stroke}
      bezier={true}
      strokeScaleEnabled={true}
      draggable={false}
    />
  );
};

export default LineComponent;
