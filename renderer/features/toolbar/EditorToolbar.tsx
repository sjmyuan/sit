import React from 'react';
import * as O from 'fp-ts/Option';
import { Box, IconButton } from '@material-ui/core';
import { TextFields, PhotoLibrary, Crop32 } from '@material-ui/icons';
import { ShapeContainer } from '../../store/ShapesContainer';

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
        aria-label="photo library"
        onClick={() => shapes.setEditingImage(O.none)}
      >
        <PhotoLibrary />
      </IconButton>
    </Box>
  );
};

export default EditorToolbar;
