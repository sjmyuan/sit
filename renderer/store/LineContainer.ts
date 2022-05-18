import { pipe } from 'fp-ts/lib/function';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { O, Point, Line } from '../types';

function useLines(initialState: Line[] = []) {
  const [lines, setLines] = useState<Line[]>(initialState);
  const [newLine, setNewLine] = useState<O.Option<Line>>(O.none);
  const [nextLineId, setNextLineId] = useState<number>(0);

  const startToDraw = (point: Point) => {
    setNewLine(
      O.some({
        _tag: 'line',
        name: `line-drawing-${nextLineId}`,
        id: nextLineId,
        points: [point],
      })
    );

    setNextLineId(nextLineId + 1);
  };
  const drawing = (point: Point) => {
    setNewLine(
      pipe(
        newLine,
        O.map((line) => ({
          ...line,
          points: [...line.points, point],
        }))
      )
    );
  };

  const endToDraw = () => {
    if (O.isSome(newLine)) {
      setLines([
        ...lines,
        { ...newLine.value, name: `line-${newLine.value.id}` },
      ]);
      setNewLine(O.none);
    }
  };

  const getAllLines = () => {
    return O.isSome(newLine) ? [...lines, newLine.value] : lines;
  };

  const clear = () => setLines([]);

  return {
    getAllLines,
    startToDraw,
    drawing,
    endToDraw,
    clear,
    lines,
  };
}

// eslint-disable-next-line import/prefer-default-export
export const LinesContainer = createContainer(useLines);
