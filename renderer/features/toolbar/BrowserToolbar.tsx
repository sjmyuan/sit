import React from 'react';
import { Box, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const BrowserToolbar = (): React.ReactElement => {
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
        aria-label="back to editor"
        onClick={() => {}}
      >
        <ArrowBackIosNewIcon />
      </IconButton>
    </Box>
  );
};

export default BrowserToolbar;
