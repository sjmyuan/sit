import React from 'react';
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import {
  TextFields,
  PhotoLibrary,
  Crop32,
  Brush,
  Crop,
  NorthWest,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import { ShapeContainer } from '../../store/ShapesContainer';
import { ipcRenderer } from 'electron';

type EditorToolbarProps = {
  onHistory: () => void;
};
const EditorToolbar = (props: EditorToolbarProps): React.ReactElement => {
  const shapes = ShapeContainer.useContainer();
  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          Sit
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <IconButton
            color="inherit"
            aria-label="none"
            disabled={shapes.currentMode === 'NONE'}
            onClick={() => shapes.setMode('NONE')}
          >
            <NorthWest />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="zoom in"
            disabled={shapes.currentMode === 'ZOOM_IN'}
            onClick={() => shapes.setMode('ZOOM_IN')}
          >
            <ZoomIn />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="zoom out"
            disabled={shapes.currentMode === 'ZOOM_OUT'}
            onClick={() => shapes.setMode('ZOOM_OUT')}
          >
            <ZoomOut />
          </IconButton>
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
            onClick={props.onHistory}
          >
            <PhotoLibrary />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default EditorToolbar;
