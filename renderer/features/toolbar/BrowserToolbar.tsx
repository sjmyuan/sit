import React from 'react';
import { AppBar, Box, IconButton, Toolbar } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

type BrowserToolbarProps = {
  onBack: () => void;
};
const BrowserToolbar = (props: BrowserToolbarProps): React.ReactElement => {
  return (
    <AppBar position="sticky">
      <Toolbar>
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
            onClick={props.onBack}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default BrowserToolbar;
