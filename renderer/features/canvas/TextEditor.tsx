import React from 'react';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array';
import { makeStyles, Theme } from '@material-ui/core';
import { pipe } from 'fp-ts/lib/function';
import { ShapeContainer } from '../../store/ShapesContainer';
import { Point } from '../../types';

const useStyles = makeStyles<Theme, Point, string>(() => ({
  textEditor: {
    position: 'absolute',
    left: (props) => `${props.x - 1}px`,
    top: (props) => `${props.y}px`,
    borderLeft: '1px solid red',
    borderRight: '1px solid red',
    borderTop: '0px solid red',
    borderBottom: '0px solid red',
    padding: '0px',
    margin: '0px',
    overflow: 'visible',
    background: 'none',
    outline: 'none',
    lineHeight: '1',
    resize: 'none',
    fontSize: '30px',
    fontWeight: 'bold',
    fontFamily: 'Calibri',
    transformOrigin: 'left top',
    color: 'rgb(220,50,105)',
    zIndex: 100,
  },
}));

const TextEditor = (props: {
  getRelativePos: () => Point;
}): React.ReactElement => {
  const shapes = ShapeContainer.useContainer();
  const { editingText } = shapes;
  const classes = useStyles(
    pipe(
      editingText,
      O.map((x) => ({
        x: x.origin.x + props.getRelativePos().x,
        y: x.origin.y + props.getRelativePos().y,
      })),
      O.getOrElse(() => ({ x: -1, y: -1 }))
    )
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
      cols={getCols(editingText.value.value)}
      rows={getRows(editingText.value.value)}
      value={editingText.value.value}
      className={classes.textEditor}
      onChange={(e) => shapes.editing(e.target.value)}
    />
  );
};

export default TextEditor;
