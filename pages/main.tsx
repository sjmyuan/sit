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
import { CloudDone } from '@material-ui/icons';
import ImageBrowser from '../renderer/features/images/ImageBrowser';
import {
  ShapeContainer,
  InfoContainer,
  PreferencesContainer,
} from '../renderer/store-unstated';
import Editor from '../renderer/features/canvas/Editor';
import BrowserToolbar from '../renderer/features/toolbar/BrowserToolbar';
import EditorToolbar from '../renderer/features/toolbar/EditorToolbar';
import { ImageContainer } from '../renderer/store/ImageContainer';

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
  const preferences = PreferencesContainer.useContainer();
  const imageContainer = ImageContainer.useContainer();
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
    ipcRenderer.on('preferences-changed', () => {
      preferences.loadPreferences();
    });
    preferences.loadPreferences();
    imageContainer.loadAllImageIndexes()();
  }, []);

  return (
    <Box sx={{ height: '100%' }}>
      <AppBar position="sticky">
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            {isSyncing ? (
              <CircularProgress color="secondary" size={20} />
            ) : (
              <CloudDone />
            )}
          </Box>
          {O.isNone(shapes.editingImageKey) ? (
            <BrowserToolbar />
          ) : (
            <EditorToolbar />
          )}
        </Toolbar>
      </AppBar>
      <Container
        sx={{
          marginTop: '10px',
          marginBottom: '10px',
          minHeight: 'calc(100% - (84px))',
        }}
        maxWidth="xl"
      >
        {O.isNone(shapes.editingImageKey) ? <ImageBrowser /> : <Editor />}
      </Container>
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
