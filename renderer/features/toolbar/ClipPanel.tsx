import React from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { ShapeContainer } from '../../store/ShapesContainer';
type ClipPanelProps = {
  onClip: () => void;
};
const ClipRect = (props: ClipPanelProps) => {
  const shapes = ShapeContainer.useContainer();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        padding: '10px',
        width: '120px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TextField
          sx={{ paddingBottom: '10px' }}
          fullWidth
          required
          id="width"
          label="Width"
          type="number"
          value={Math.round(shapes.clipRect.width * shapes.clipRect.scaleX)}
          onChange={(e) =>
            shapes.setClipRect({
              ...shapes.clipRect,
              width: +e.target.value / shapes.clipRect.scaleX,
            })
          }
        />
        <TextField
          fullWidth
          required
          id="height"
          label="Height"
          type="number"
          value={Math.round(shapes.clipRect.height * shapes.clipRect.scaleY)}
          onChange={(e) =>
            shapes.setClipRect({
              ...shapes.clipRect,
              height: +e.target.value / shapes.clipRect.scaleY,
            })
          }
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
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
          onClick={() => {
            shapes.setMode('NONE');
            props.onClip();
          }}
        >
          <Check />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ClipRect;
