import React, { ChangeEvent, useEffect } from 'react';
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

import AddAPhoto from '@material-ui/icons/AddAPhoto';
import { v4 as uuidv4 } from 'uuid';
import { Redirect } from 'react-router';
import ImageBrowser from '../features/images/ImageBrowser';
import { selectAWSConfig } from '../features/settings/settingsSlice';
import routes from '../constants/routes.json';
import { uploadImgs, fetchImages } from '../utils/imagesThunk';
import { selectInformation, clearInfo, clearError } from '../utils/infoSlice';

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
  const { inProgress } = notification;
  const dispatch = useDispatch();
  const classes = useStyles();

  useEffect(() => {
    dispatch(fetchImages(O.none));
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
          </div>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl">
        <ImageBrowser />
      </Container>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={O.isSome(notification.info)}
        autoHideDuration={6000}
        onClose={() => dispatch(clearInfo())}
      >
        <Alert onClose={() => dispatch(clearInfo())} severity="info">
          {O.getOrElse(() => '')(notification.info)}
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
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
