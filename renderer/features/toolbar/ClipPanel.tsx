import React from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { ShapeContainer } from '../../store/ShapesContainer';
const ClipRect = () => {
  const shapes = ShapeContainer.useContainer();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TextField
          required
          id="width"
          label="Width"
          type="number"
          value={shapes.clipRect.width}
          onChange={(e) =>
            shapes.setClipRect({ ...shapes.clipRect, width: +e.target.value })
          }
        />
        <TextField
          required
          id="height"
          label="Height"
          type="number"
          value={shapes.clipRect.height}
          onChange={(e) =>
            shapes.setClipRect({ ...shapes.clipRect, height: +e.target.value })
          }
        />
      </Box>
      <Box>
        <IconButton
          color="inherit"
          aria-label="cancel"
          onClick={() => shapes.setMode('NONE')}
        >
          <Close />
        </IconButton>
        <IconButton
          color="inherit"
          aria-label="confirm"
          onClick={() => shapes.setMode('NONE')}
        >
          <Check />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ClipRect;
