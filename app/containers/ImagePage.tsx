import React, { ChangeEvent, useEffect } from 'react';
import * as O from 'fp-ts/Option';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  AppBar,
  Typography,
  Button,
  Toolbar,
  makeStyles,
  createStyles,
  Theme,
  IconButton,
} from '@material-ui/core';
import AddAPhoto from '@material-ui/icons/AddAPhoto';
import uuid from 'uuid';
import { Redirect } from 'react-router';
import ImageBrowser from '../features/images/ImageBrowser';
import { selectAWSConfig } from '../features/settings/settingsSlice';
import routes from '../constants/routes.json';
import { uploadImgs, fetchImages } from '../utils/imagesThunk';

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
  })
);

export default function ImagePage() {
  const awsConfig = useSelector(selectAWSConfig);
  const dispatch = useDispatch();
  const classes = useStyles();

  useEffect(() => {
    dispatch(fetchImages(O.none));
  });

  const handleUploadClick = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (file) {
        const suffix = file.type.split('/')[1];
        const fileName = `${uuid.v4()}.${suffix}`;
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
    </div>
  );
}
