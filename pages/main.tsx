import React, { useEffect, useState } from 'react';
import * as O from 'fp-ts/Option';
import {
  Container,
  AppBar,
  Toolbar,
  CircularProgress,
  Snackbar,
  Backdrop,
  Alert,
  Box,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { ipcRenderer } from 'electron';
import ImageBrowser from '../renderer/features/images/ImageBrowser';
import { ShapeContainer, InfoContainer } from '../renderer/store-unstated';
import Editor from '../renderer/features/canvas/Editor';
import BrowserToolbar from '../renderer/features/toolbar/BrowserToolbar';
import EditorToolbar from '../renderer/features/toolbar/EditorToolbar';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  modal: {
    position: 'absolute',
    maxWidth: '100%',
    maxHeight: '100%',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  container: {
    marginTop: '10px',
    marginBottom: '10px',
  },
}));

const MainPage = (): React.ReactElement => {
  const notification = InfoContainer.useContainer();
  const shapes = ShapeContainer.useContainer();
  const { inProgress } = notification;
  const classes = useStyles();
  const [isSyncing, toggleSyncing] = useState<boolean>(false);

  useEffect(() => {
    ipcRenderer.on('edit-image', (_, key: any) => {
      shapes.setEditingImage(O.some(key));
    });
    ipcRenderer.on('sync-status', (_, info: { syncing: boolean }) => {
      toggleSyncing(info.syncing);
    });
  }, []);

  return (
    <Box sx={{ height: '100%' }}>
      <AppBar position="sticky">
        <Toolbar>
          <Box
            sx={{
              display: isSyncing ? 'block' : 'none',
            }}
          >
            <CircularProgress color="secondary" size={20} />
          </Box>
          {O.isNone(shapes.editingImageKey) ? (
            <BrowserToolbar />
          ) : (
            <EditorToolbar />
          )}
        </Toolbar>
      </AppBar>
      {O.isNone(shapes.editingImageKey) ? (
        <Container
          sx={{ marginTop: '10px', marginBottom: '10px' }}
          maxWidth="xl"
        >
          <ImageBrowser />
        </Container>
      ) : (
        <Box sx={{ height: '100%', width: '100%', display: 'flex' }}>
          <Editor />
        </Box>
      )}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={O.isSome(notification.info)}
        autoHideDuration={6000}
        onClose={() => notification.showInfo(O.none)}
      >
        <Alert
          variant="filled"
          onClose={() => notification.showInfo(O.none)}
          severity="info"
        >
          {O.getOrElse(() => '')(notification.info)}
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={O.isSome(notification.error)}
        autoHideDuration={6000}
        onClose={() => notification.showError(O.none)}
      >
        <Alert
          variant="filled"
          onClose={() => notification.showError(O.none)}
          severity="error"
        >
          {O.getOrElse(() => '')(notification.error)}
        </Alert>
      </Snackbar>
      <Backdrop className={classes.backdrop} open={inProgress}>
        <CircularProgress />
      </Backdrop>
    </Box>
  );
};

export default MainPage;
