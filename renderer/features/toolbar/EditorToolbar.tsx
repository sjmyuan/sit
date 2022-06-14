import React from 'react';
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import { PhotoLibrary, Crop, Undo, Redo, Check } from '@mui/icons-material';
import { ipcRenderer } from 'electron';
import { CommandsContainer } from '../../store/CommandContainer';
import { ShapeContainer } from '../../store/ShapesContainer';

type EditorToolbarProps = {
  onSave: () => void;
  onHistory: () => void;
};
const EditorToolbar = (props: EditorToolbarProps): React.ReactElement => {
  const commands = CommandsContainer.useContainer();
  const shapes = ShapeContainer.useContainer();
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
            aria-label="undo"
            disabled={!commands.hasUndoCommand()}
            onClick={() => {
              commands.undo();
            }}
          >
            <Undo />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="redo"
            disabled={!commands.hasRedoCommand()}
            onClick={() => {
              commands.redo();
            }}
          >
            <Redo />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="save"
            disabled={!commands.hasUndoCommand()}
            onClick={() => {
              shapes.setSaveChanges(true);
            }}
          >
            <Check />
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
