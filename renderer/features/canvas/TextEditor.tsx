import React from 'react';
import * as O from 'fp-ts/Option';
import { makeStyles, Theme } from '@material-ui/core';
import { Rect, ShapeContainer, Point } from '../../store-unstated';
import { pipe } from 'fp-ts/lib/function';
const useStyles = makeStyles<Theme, Rect, string>(() => ({
  textEditor: {
    position: 'absolute',
    left: (props) => `${props.origin.x}px`,
    top: (props) => `${props.origin.y}px`,
    width: (props) => `${props.width}px`,
    height: (props) => `${props.height}px`,
    border: '1px solid red',
    padding: '0px',
    margin: '0px',
    overflow: 'hidden',
    background: 'none',
    outline: 'none',
    resize: 'none',
    transformOrigin: 'left top',
  },
}));

const TextEditor = (props: { getRelativePos: () => Point }) => {
  const shapes = ShapeContainer.useContainer();
  const editingText = shapes.editingText;
  const classes = useStyles({
    id: -1,
    origin: pipe(
      editingText,
      O.map((x) => ({
        x: x.origin.x + props.getRelativePos().x,
        y: x.origin.y + props.getRelativePos().y,
      })),
      O.getOrElse(() => ({ x: -1, y: -1 }))
    ),
    width: 40,
    height: 20,
  });

  if (O.isNone(editingText)) {
    return <React.Fragment />;
  }

  return (
    <textarea
      autoFocus
      value={editingText.value.value}
      className={classes.textEditor}
      onChange={(e) => shapes.editing(e.target.value)}
    />
  );
};

export default TextEditor;
