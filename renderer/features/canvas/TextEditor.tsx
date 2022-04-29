import React from 'react';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/lib/function';
import { ShapeContainer } from '../../store/ShapesContainer';
import { Point } from '../../types';
import { css } from '@emotion/css';

const TextEditor = (props: {
  getRelativePos: () => Point;
}): React.ReactElement => {
  const shapes = ShapeContainer.useContainer();
  const editingText = shapes.getEditingText();

  const position = pipe(
    editingText,
    O.map((x) => ({
      x: x.origin.x / shapes.stageCoordinate[1] + props.getRelativePos().x,
      y: x.origin.y / shapes.stageCoordinate[1] + props.getRelativePos().y,
    })),
    O.getOrElse(() => ({ x: -1, y: -1 }))
  );

  const getRows = (text: string) => text.split('\n').length;
  const getCols = (text: string) =>
    pipe(
      text.split('\n'),
      A.map((x) => x.length),
      (x) => Math.max(...x, 1)
    );

  if (O.isNone(editingText)) {
    return <></>;
  }

  return (
    <textarea
      className={css`
        position: absolute;
        left: ${position.x - 1}px;
        top: ${position.y}px;
        border-left: 1px solid red;
        border-right: 1px solid red;
        border-top: 0px solid red;
        border-bottom: 0px solid red;
        padding: 0px;
        margin: 0px;
        overflow: visible;
        background: none;
        outline: none;
        line-height: 1;
        resize: none;
        font-size: 30px;
        font-weight: bold;
        font-family: Calibri;
        transform-origin: left top;
        color: rgb(220, 50, 105);
        z-index: 100;
      `}
      cols={getCols(editingText.value.value)}
      rows={getRows(editingText.value.value)}
      value={editingText.value.value}
      onChange={(e) => shapes.editing(e.target.value)}
    />
  );
};

export default TextEditor;
