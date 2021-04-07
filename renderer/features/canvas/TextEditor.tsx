import React from 'react';
import * as O from 'fp-ts/Option';
import { makeStyles, Theme } from '@material-ui/core';
import { Rect, ShapeContainer, TextsContainer } from '../../store-unstated';
const useStyles = makeStyles<Theme, Rect, string>(() => ({
  textEditor: {
    position: 'absolute',
    left: (props) => `${props.origin.x}px`,
    top: (props) => `${props.origin.y}px`,
    width: (props) => `${props.width}px`,
    height: (props) => `${props.height}px`,
    border: 'none',
    padding: '0px',
    margin: '0px',
    overflow: 'hidden',
    background: 'none',
    outline: 'none',
    resize: 'none',
    transformOrigin: 'left top',
  },
}));
const TextEditor = () => {
  const shapes = ShapeContainer.useContainer();
  const editingText = shapes.editingText;
  if (O.isNone(editingText)) {
    return <React.Fragment />;
  }
  const classes = useStyles({
    id: -1,
    origin: editingText.value.origin,
    width: 20,
    height: 20,
  });

  return (
    <textarea
      value={editingText.value.value}
      className={classes.name}
      onChange={(e) => shapes.editing(e.target.value)}
    />
  );
};

export default TextEditor;
