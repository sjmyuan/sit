import React from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import { Rect } from '../../store-unstated';
type TextEditorProps = {
  value: string;
  rect: Rect;
  onChange: (value: string) => void;
};
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
const TextEditor = (props: TextEditorProps) => {
  const classes = useStyles(props.rect);

  return (
    <textarea
      value={props.value}
      className={classes.name}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
};

export default TextEditor;
