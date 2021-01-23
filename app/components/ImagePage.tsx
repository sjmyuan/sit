import React, { ChangeEvent, useEffect, MouseEvent, useState } from 'react';
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
  Modal,
  Alert,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { clipboard, NativeImage } from 'electron';
import {
  AddAPhoto,
  Refresh,
  ChevronLeft,
  ChevronRight,
  FlipToFront,
  Settings,
} from '@material-ui/icons';
import { v4 as uuidv4 } from 'uuid';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { pipe } from 'fp-ts/lib/function';
import ImageBrowser from '../features/images/ImageBrowser';
import { saveConfig } from '../features/settings/settingsSlice';
import {
  uploadImgs,
  fetchPreviousPageImages,
  fetchNextPageImages,
} from '../utils/imagesThunk';
import { clearInfo, clearError, setError } from '../utils/infoSlice';
import { resetPointer } from '../features/images/imagesSlice';
import {
  selectInformation,
  selectAWSConfig,
  selectImages,
  selectSettings,
} from '../store';
import SettingPage from './SettingPage';
import ClipboardImage from '../features/images/ClipboardImage';
import { FileInfo } from '../types';

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

export default function ImagePage() {
  const awsConfig = useSelector(selectAWSConfig);
  const settings = useSelector(selectSettings);
  const notification = useSelector(selectInformation);
  const images = useSelector(selectImages);
  const { inProgress } = notification;
  const { historyPointer, nextPointer } = images;
  const dispatch = useDispatch();
  const classes = useStyles();

  const [settingsSwitch, setSettingsSwitch] = useState<boolean>(false);
  const [clipboardImageSwitch, setClipboardImageSwitch] = useState<boolean>(
    false
  );

  useDeepCompareEffect(() => {
    if (O.isSome(awsConfig)) {
      dispatch(resetPointer());
      dispatch(fetchNextPageImages());
    } else {
      setSettingsSwitch(true);
    }
  }, [awsConfig, settings.cdn, settings.pageSize]);

  const handleOpenClipboardImage = () => {
    const image = clipboard.readImage('clipboard');
    if (!image.isEmpty()) {
      setClipboardImageSwitch(true);
    } else {
      dispatch(setError('No Image in Clipboard'));
    }
  };

  const handleCloseClipboardImage = () => {
    setClipboardImageSwitch(false);
  };

  useEffect(() => {
    const handleUserKeyUp = (event: { ctrlKey: boolean; keyCode: number }) => {
      const { ctrlKey, keyCode } = event;

      if (ctrlKey && keyCode === 86) {
        handleOpenClipboardImage();
      }
    };
    window.addEventListener('keyup', handleUserKeyUp);
    return () => {
      window.removeEventListener('keyup', handleUserKeyUp);
    };
  });

  const handleCloseSettings = () => {
    setSettingsSwitch(false);
    dispatch(saveConfig());
  };

  const handleOpenSettingsClick = () => {
    setSettingsSwitch(true);
  };

  const handleUploadFileImage = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files) {
      const uploadingImages = pipe(
        A.range(0, files.length - 1),
        A.reduce<number, FileInfo[]>([], (acc, ele) => {
          const file = files[ele];
          if (file) {
            const suffix = file.type.split('/')[1];
            const fileName = `${uuidv4()}.${suffix}`;
            return [...acc, { name: fileName, content: file }];
          }
          return acc;
        })
      );

      dispatch(uploadImgs(uploadingImages));
    }
  };

  const handleUploadClipboardImage = (image: Blob) => {
    setClipboardImageSwitch(false);
    const fileName = `${uuidv4()}.png`;
    dispatch(uploadImgs([{ name: fileName, content: image }]));
  };

  const handleRefreshClick = () => {
    dispatch(resetPointer());
    dispatch(fetchNextPageImages());
  };

  const handlePreviousPageClick = () => {
    dispatch(fetchPreviousPageImages());
  };

  const handleNextPageClick = () => {
    dispatch(fetchNextPageImages());
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
              aria-label="previous page"
              component="span"
              disabled={historyPointer.length < 2}
              onClick={handlePreviousPageClick}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              color="inherit"
              aria-label="next page"
              disabled={O.isNone(nextPointer)}
              onClick={handleNextPageClick}
            >
              <ChevronRight />
            </IconButton>
            <IconButton
              color="inherit"
              aria-label="refresh picture"
              onClick={handleRefreshClick}
            >
              <Refresh />
            </IconButton>
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
              aria-label="upload copied picture"
              onClick={handleOpenClipboardImage}
            >
              <FlipToFront />
            </IconButton>
            <IconButton
              color="inherit"
              aria-label="open settings"
              onClick={handleOpenSettingsClick}
            >
              <Settings />
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
        onClose={() => dispatch(clearInfo())}
      >
        <Alert
          variant="filled"
          onClose={() => dispatch(clearInfo())}
          severity="info"
        >
          {O.getOrElse(() => '')(notification.info)}
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={O.isSome(notification.error)}
        autoHideDuration={6000}
        onClose={() => dispatch(clearError())}
      >
        <Alert
          variant="filled"
          onClose={() => dispatch(clearError())}
          severity="error"
        >
          {O.getOrElse(() => '')(notification.error)}
        </Alert>
      </Snackbar>
      <Backdrop className={classes.backdrop} open={inProgress}>
        <CircularProgress />
      </Backdrop>
      <Modal
        open={settingsSwitch}
        onClose={handleCloseSettings}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className={classes.modal}>
          <SettingPage />
        </div>
      </Modal>
      <Modal
        open={clipboardImageSwitch}
        onClose={handleCloseClipboardImage}
        aria-labelledby="clipboard-image-modal"
        aria-describedby="clipboard-image-description"
      >
        <div className={classes.modal}>
          <ClipboardImage onUpload={handleUploadClipboardImage} />
        </div>
      </Modal>
    </div>
  );
}
