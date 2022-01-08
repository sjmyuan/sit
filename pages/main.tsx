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
import MouseTrap from 'mousetrap';
import { constVoid, pipe } from 'fp-ts/lib/function';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { ipcRenderer, clipboard } from 'electron';
import { CloudDone } from '@material-ui/icons';
import ImageBrowser from '../renderer/features/images/ImageBrowser';
import Editor from '../renderer/features/canvas/Editor';
import BrowserToolbar from '../renderer/features/toolbar/BrowserToolbar';
import EditorToolbar from '../renderer/features/toolbar/EditorToolbar';
import { ImageContainer } from '../renderer/store/ImageContainer';
import { TE, AppErrorOr } from '../renderer/types';
import { WorkerEvents } from '../renderer/events';
import { ImageIndex } from '../renderer/utils/AppDB';
import { getImageCacheUrl } from '../renderer/utils/localImages';
import { InfoContainer } from '../renderer/store/InfoContainer';
import { ShapeContainer } from '../renderer/store/ShapesContainer';
import { PreferencesContainer } from '../renderer/store/PreferencesContainer';

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
  const [pasting, togglePasting] = useState<boolean>(false);
  const [croppingImage, setCroppingImage] = useState<O.Option<ImageIndex>>(
    O.none
  );
  const [workerInfo, setWorkerInfo] = useState<string>('');

  const pasteImageFromClipboard = (): AppErrorOr<void> => {
    const image = clipboard.readImage('clipboard');
    if (!image.isEmpty()) {
      const key = `clipboard-${Date.now()}.png`;
      return pipe(
        imageContainer.addImage(key, new Blob([image.toPNG()])),
        TE.chain((_) => getImageCacheUrl(key)),
        TE.map((url: string) => {
          if (O.isSome(shapes.editingImageUrl)) {
            return shapes.setEditingImage(O.some(url));
          }
          return constVoid();
        })
      );
    }

    return TE.of(constVoid());
  };

  useEffect(() => {
    ipcRenderer.on('edit-image', (_, imageIndex: ImageIndex) => {
      pipe(
        getImageCacheUrl(imageIndex.key),
        TE.chain((url) =>
          TE.fromIO(() => {
            shapes.setEditingImage(O.some(url));
            setCroppingImage(O.some(imageIndex));
          })
        )
      )();
    });
    ipcRenderer.on('worker-event', (_, event: WorkerEvents) => {
      if (event._tag === 'start-to-sync') {
        toggleSyncing(true);
        setWorkerInfo('Start to sync images....');
      }
      if (event._tag === 'success-to-sync') {
        toggleSyncing(false);
        setWorkerInfo('Succeed to sync images!');
      }
      if (event._tag === 'failed-to-sync') {
        toggleSyncing(false);
        setWorkerInfo(event.error);
      }
      if (event._tag === 'show-step-information') {
        setWorkerInfo(event.info);
      }
    });
    ipcRenderer.on('preferences-changed', () => {
      preferences.loadPreferences();
    });
  }, []);

  useEffect(() => {
    preferences.loadPreferences();
    imageContainer.loadAllImageIndexes()();
  }, []);

  useEffect(() => {
    MouseTrap.bind(['ctrl+v', 'command+v'], () => togglePasting(true));
    return () => {
      MouseTrap.unbind(['ctrl+v', 'command+v']);
    };
  }, []);

  useEffect(() => {
    if (pasting) {
      togglePasting(false);
      pasteImageFromClipboard()();
    }

    if (O.isSome(croppingImage)) {
      setCroppingImage(O.none);
      imageContainer.setImages([croppingImage.value, ...imageContainer.images]);
    }
  }, [pasting, croppingImage]);

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
          {O.isNone(shapes.editingImageUrl) ? (
            <BrowserToolbar />
          ) : (
            <EditorToolbar />
          )}
        </Toolbar>
      </AppBar>
      <Container
        sx={{
          marginTop: '10px',
          marginBottom: '30px',
          minHeight: 'calc(100% - (104px))',
          display: 'flex',
        }}
        maxWidth="xl"
      >
        {O.isNone(shapes.editingImageUrl) ? <ImageBrowser /> : <Editor />}
      </Container>
      <Box
        sx={{
          position: 'fixed',
          left: '0px',
          right: '0px',
          bottom: '0px',
          height: '20px',
          backgroundColor: 'rgb(217,217,217)',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <Box sx={{ fontSize: 'x-small', paddingLeft: '10px' }}>
          {workerInfo}
        </Box>
      </Box>
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
