import React, { ChangeEvent, useEffect } from 'react';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  AppBar,
  Typography,
  Toolbar,
  Theme,
  IconButton,
  CircularProgress,
  Snackbar,
  Backdrop,
  Alert,
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ipcRenderer } from 'electron';
import {
  AddAPhoto,
  Crop,
  Crop32,
  TextFields,
  PhotoLibrary,
} from '@material-ui/icons';
import { pipe } from 'fp-ts/lib/function';
import ImageBrowser from '../renderer/features/images/ImageBrowser';
import { FileInfo, TE } from '../renderer/types';
import { uploadImage } from '../renderer/utils/localImages';
import { ShapeContainer, InfoContainer } from '../renderer/store-unstated';
import Editor from '../renderer/features/canvas/Editor';

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

  useEffect(() => {
    ipcRenderer.on('edit-image', (_, key: any) => {
      shapes.setEditingImage(O.some(key));
    });
  }, []);

  const handleUploadFileImage = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files) {
      const uploadingImages = pipe(
        A.range(0, files.length - 1),
        A.reduce<number, FileInfo[]>([], (acc, ele) => {
          const file = files[ele];
          if (file) {
            return [...acc, { name: file.name, content: file }];
          }
          return acc;
        })
      );

      notification.startProcess();

      A.array
        .traverse(TE.taskEither)(uploadingImages, (file) =>
          uploadImage(file.name, file.content)
        )()
        .then(() => notification.showInfo(O.some('Image uploaded')))
        .catch(() => {
          notification.showError(O.some('Failed to upload image'));
        });
    }
  };

  return (
    <Box sx={{ height: '100%' }}>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Images
          </Typography>
          {O.isNone(shapes.editingImageKey) ? (
            <div>
              <IconButton
                color="inherit"
                aria-label="upload picture"
                component="label"
              >
                <AddAPhoto />
                <input
                  accept="image/*"
                  hidden
                  id="icon-button-file"
                  type="file"
                  multiple
                  onChange={handleUploadFileImage}
                />
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
            </div>
          ) : (
            <div>
              <IconButton
                color="inherit"
                aria-label="draw rectangle"
                disabled={shapes.currentMode === 'RECT'}
                onClick={() => shapes.setMode('RECT')}
              >
                <Crop32 />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="add text"
                disabled={shapes.currentMode === 'TEXT'}
                onClick={() => shapes.setMode('TEXT')}
              >
                <TextFields />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="photo library"
                onClick={() => shapes.setEditingImage(O.none)}
              >
                <PhotoLibrary />
              </IconButton>
            </div>
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
