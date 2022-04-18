import React from 'react';
import * as O from 'fp-ts/Option';
import { Box, IconButton } from '@mui/material';
import {
  TextFields,
  PhotoLibrary,
  Crop32,
  Brush,
  Crop,
} from '@mui/icons-material';
import { ShapeContainer } from '../../store/ShapesContainer';
import { ipcRenderer } from 'electron';

const EditorToolbar = (): React.ReactElement => {
  const shapes = ShapeContainer.useContainer();
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <IconButton
        color="inherit"
        aria-label="draw rectangle"
        disabled={shapes.currentMode === 'RECT'}
        onClick={() => shapes.setMode('RECT')}
      >
        <Crop32 />
      </IconButton>
      <IconButton
        color="inherit"
        aria-label="add text"
        disabled={shapes.currentMode === 'TEXT'}
        onClick={() => shapes.setMode('TEXT')}
      >
        <TextFields />
      </IconButton>
      <IconButton
        color="inherit"
        aria-label="add mask"
        disabled={shapes.currentMode === 'MASK'}
        onClick={() => shapes.setMode('MASK')}
      >
        <Brush />
      </IconButton>
      <IconButton
        color="inherit"
        aria-label="screen capture"
        onClick={() => {
          ipcRenderer.send('taking-screen-shot');
        }}
      >
        <Crop />
      </IconButton>
      <IconButton
        color="inherit"
        aria-label="photo library"
        onClick={() => shapes.setEditingImage(O.none)}
      >
        <PhotoLibrary />
      </IconButton>
    </Box>
  );
};

export default EditorToolbar;
