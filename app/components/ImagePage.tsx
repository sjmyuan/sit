import React, { ChangeEvent, useEffect, MouseEvent, useState } from 'react';
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
  Modal,
} from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { clipboard } from 'electron';
import {
  AddAPhoto,
  Refresh,
  ChevronLeft,
  ChevronRight,
  FlipToFront,
  Settings,
} from '@material-ui/icons';
import { v4 as uuidv4 } from 'uuid';
import ImageBrowser from '../features/images/ImageBrowser';
import { updateAWSConfig } from '../features/settings/settingsSlice';
import {
  uploadImgs,
  fetchPreviousPageImages,
  fetchNextPageImages,
} from '../utils/imagesThunk';
import { clearInfo, clearError } from '../utils/infoSlice';
import { resetPointer } from '../features/images/imagesSlice';
import AWSSetting from '../features/settings/AWSSetting';
import { selectInformation, selectAWSConfig, selectImages } from '../store';

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
    modal: {
      position: 'absolute',
      maxWidth: 400,
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
    container: {
      marginTop: '10px',
      marginBottom: '10px',
    },
  })
);

export default function ImagePage() {
  const awsConfig = useSelector(selectAWSConfig);
  const notification = useSelector(selectInformation);
  const images = useSelector(selectImages);
  const { inProgress } = notification;
  const { historyPointer, nextPointer } = images;
  const dispatch = useDispatch();
  const classes = useStyles();

  const [settingsSwitch, setSettingsSwitch] = useState<boolean>(false);

  useEffect(() => {
    if (O.isSome(awsConfig)) {
      dispatch(resetPointer());
      dispatch(fetchNextPageImages());
    } else {
      setSettingsSwitch(true);
    }
  }, [awsConfig]);

  const uploadPictureInClipboard = () => {
    const image = clipboard.readImage('clipboard');
    if (!image.isEmpty()) {
      const fileName = `${uuidv4()}.png`;
      dispatch(
        uploadImgs([{ name: fileName, content: new Blob([image.toPNG()]) }])
      );
    }
  };

  useEffect(() => {
    const handleUserKeyUp = (event: { ctrlKey: boolean; keyCode: number }) => {
      const { ctrlKey, keyCode } = event;

      if (ctrlKey && keyCode === 86) {
        uploadPictureInClipboard();
      }
    };
    window.addEventListener('keyup', handleUserKeyUp);
    return () => {
      window.removeEventListener('keyup', handleUserKeyUp);
    };
  });

  const handleCloseSettings = () => {
    setSettingsSwitch(false);
  };

  const handleOpenSettingsClick = () => {
    setSettingsSwitch(true);
  };

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
              onClick={uploadPictureInClipboard}
            >
              <FlipToFront />
            </IconButton>
            <IconButton
              color="inherit"
              aria-label="open settings"
              component="span"
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
      <Modal
        open={settingsSwitch}
        onClose={handleCloseSettings}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <div className={classes.modal}>
          <AWSSetting
            config={awsConfig}
            onSubmit={(config) => {
              setSettingsSwitch(false);
              dispatch(updateAWSConfig(config));
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
