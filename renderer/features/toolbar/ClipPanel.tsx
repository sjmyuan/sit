import React from 'react';
import { Box, IconButton } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
const ClipRect = () => {
  return (
    <Box>
      <IconButton color="inherit" aria-label="confirm" onClick={() => {}}>
        <Check />
      </IconButton>
      <IconButton color="inherit" aria-label="cancel" onClick={() => {}}>
        <Close />
      </IconButton>
    </Box>
  );
};

export default ClipRect;
