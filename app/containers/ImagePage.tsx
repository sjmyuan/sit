import React, { ChangeEvent, useEffect, MouseEvent } from 'react';
import * as O from 'fp-ts/Option';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  AppBar,
  Typography,
  Toolbar,
  makeStyles,
  createStyles,
  Theme,
  IconButton,
  CircularProgress,
  Snackbar,
  Backdrop,
} from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { clipboard } from 'electron';
import {
  AddAPhoto,
  Refresh,
  ChevronLeft,
  ChevronRight,
  FlipToFront,
} from '@material-ui/icons';
import { v4 as uuidv4 } from 'uuid';
import { Redirect } from 'react-router';
import ImageBrowser from '../features/images/ImageBrowser';
import { selectAWSConfig } from '../features/settings/settingsSlice';
import routes from '../constants/routes.json';
import { uploadImgs, fetchImages, refreshImages } from '../utils/imagesThunk';
import { selectInformation, clearInfo, clearError } from '../utils/infoSlice';
import { selectImages } from '../features/images/imagesSlice';
import { FileInfo } from '../types';

function Alert(props: AlertProps) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
    uploadInput: {
      display: 'none',
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  })
);

export default function ImagePage() {
  const awsConfig = useSelector(selectAWSConfig);
  const notification = useSelector(selectInformation);
  const images = useSelector(selectImages);
  const { inProgress } = notification;
  const { previousPointer, nextPointer } = images;
  const dispatch = useDispatch();
  const classes = useStyles();

  useEffect(() => {
    dispatch(refreshImages());
  }, [awsConfig]);

  const handleUploadClick = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file) {
        const suffix = file.type.split('/')[1];
        const fileName = `${uuidv4()}.${suffix}`;
        dispatch(uploadImgs([{ name: fileName, content: file }]));
      }
    }
  };

  const handleRefreshClick = () => {
    dispatch(refreshImages());
  };

  const handlePreviousPageClick = () => {
    dispatch(fetchImages(previousPointer));
  };

  const handleNextPageClick = () => {
    dispatch(fetchImages(nextPointer));
  };

  const handleUploadCopiedPictureClick = () => {
    const image = clipboard.readImage('clipboard');
    if (!image.isEmpty()) {
      const fileName = `${uuidv4()}.png`;
      dispatch(
        uploadImgs([{ name: fileName, content: new Blob([image.toPNG()]) }])
      );
    }
  };

  if (O.isNone(awsConfig)) {
    return <Redirect to={routes.SETTING} />;
  }

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Images
          </Typography>
          <div>
            <IconButton
              color="inherit"
              aria-label="previous page"
              component="span"
              disabled={O.isNone(previousPointer)}
              onClick={handlePreviousPageClick}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              color="inherit"
              aria-label="next page"
              component="span"
              disabled={O.isNone(nextPointer)}
              onClick={handleNextPageClick}
            >
              <ChevronRight />
            </IconButton>
            <IconButton
              color="inherit"
              aria-label="refresh picture"
              component="span"
              onClick={handleRefreshClick}
            >
              <Refresh />
            </IconButton>
            <label htmlFor="icon-button-file">
              <IconButton
                color="inherit"
                aria-label="upload picture"
                component="span"
              >
                <AddAPhoto />
              </IconButton>
              <input
                accept="image/*"
                className={classes.uploadInput}
                id="icon-button-file"
                type="file"
                onChange={handleUploadClick}
              />
            </label>
            <IconButton
              color="inherit"
              aria-label="upload copied picture"
              component="span"
              onClick={handleUploadCopiedPictureClick}
            >
              <FlipToFront />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl">
        <ImageBrowser />
      </Container>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={O.isSome(notification.info)}
        autoHideDuration={6000}
        onClose={() => dispatch(clearInfo())}
      >
        <Alert onClose={() => dispatch(clearInfo())} severity="info">
          {O.getOrElse(() => '')(notification.info)}
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={O.isSome(notification.error)}
        autoHideDuration={6000}
        onClose={() => dispatch(clearError())}
      >
        <Alert onClose={() => dispatch(clearError())} severity="error">
          {O.getOrElse(() => '')(notification.error)}
        </Alert>
      </Snackbar>
      <Backdrop className={classes.backdrop} open={inProgress}>
        <CircularProgress />
      </Backdrop>
    </div>
  );
}
