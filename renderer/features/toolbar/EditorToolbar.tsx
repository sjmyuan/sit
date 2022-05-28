import React from 'react';
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import { PhotoLibrary, Crop } from '@mui/icons-material';
import { ipcRenderer } from 'electron';

type EditorToolbarProps = {
  onHistory: () => void;
};
const EditorToolbar = (props: EditorToolbarProps): React.ReactElement => {
  return (
    <AppBar position="relative">
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
