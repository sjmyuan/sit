import React, { ChangeEvent, useState } from 'react';
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
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ipcRenderer } from 'electron';
import { AddAPhoto, Crop } from '@material-ui/icons';
import { pipe } from 'fp-ts/lib/function';
import ImageBrowser from '../renderer/features/images/ImageBrowser';
import { clearInfo, clearError } from '../renderer/utils/infoSlice';
import {
  selectAWSConfig,
  selectImages,
  selectSettings,
  selectInformation,
} from '../renderer/store';
import { FileInfo, TE } from '../renderer/types';
import { uploadImage } from '../renderer/utils/localImages';

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

const BrowserPage = (): React.ReactElement => {
  const notification = useSelector(selectInformation);
  const { inProgress } = notification;
  const dispatch = useDispatch();
  const classes = useStyles();

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

      A.array.traverse(TE.taskEither)(uploadingImages, (file) =>
        uploadImage(file.name, file.content)
      )();
    }
  };

  return (
    <div className={classes.root}>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Images
          </Typography>
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
                ipcRenderer.send('taking-screenshot');
              }}
            >
              <Crop />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <Container className={classes.container} maxWidth="xl">
        <ImageBrowser />
      </Container>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={O.isSome(notification.info)}
        autoHideDuration={6000}
        onClose={() => dispatch(clearInfo(null))}
      >
        <Alert
          variant="filled"
          onClose={() => dispatch(clearInfo(null))}
          severity="info"
        >
          {O.getOrElse(() => '')(notification.info)}
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={O.isSome(notification.error)}
        autoHideDuration={6000}
        onClose={() => dispatch(clearError(null))}
      >
        <Alert
          variant="filled"
          onClose={() => dispatch(clearError(null))}
          severity="error"
        >
          {O.getOrElse(() => '')(notification.error)}
        </Alert>
      </Snackbar>
      <Backdrop className={classes.backdrop} open={inProgress}>
        <CircularProgress />
      </Backdrop>
    </div>
  );
};

export default BrowserPage;
