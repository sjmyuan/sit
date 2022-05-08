import React from 'react';
import { Box, IconButton } from '@mui/material';
import {
  TextFields,
  Crop32,
  Brush,
  NorthWest,
  ZoomIn,
  ZoomOut,
  ContentCut,
} from '@mui/icons-material';
import { ShapeContainer } from '../../store/ShapesContainer';
import ClipPanel from './ClipPanel';

type ToolPanelProps = {
  onClip: () => void;
};

const ToolPanel = (props: ToolPanelProps): React.ReactElement => {
  const shapes = ShapeContainer.useContainer();
  return shapes.currentMode === 'CLIP' ? (
    <ClipPanel onClip={props.onClip} />
  ) : (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
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
        aria-label="clip"
        onClick={() => shapes.setMode('CLIP')}
      >
        <ContentCut />
      </IconButton>
    </Box>
  );
};

export default ToolPanel;
