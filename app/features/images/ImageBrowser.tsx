/* eslint-disable react/jsx-wrap-multilines */
import React from 'react';
import { clipboard } from 'electron';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  GridList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Box,
  ImageList,
} from '@material-ui/core';
import { Link as CopyKeyIcon, DeleteOutline } from '@material-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import Image from './Image';
import { selectImages } from '../../store';
import { setInfo } from '../../utils/infoSlice';
import { deleteImgs } from '../../utils/imagesThunk';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      overflow: 'hidden',
    },
    imageItem: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative',
      minHeight: '164px',
    },
    imageBar: {
      height: '30px',
    },
    icon: {
      color: 'rgba(255, 255, 255, 0.54)',
      padding: '6px',
    },
  })
);

const ImageBrowser = () => {
  const classes = useStyles();
  const images = useSelector(selectImages);
  const dispatch = useDispatch();

  const copyLink = (link: string) => {
    clipboard.writeText(link);
    dispatch(setInfo('Copied to Clipboard!'));
  };

  const deleteImage = (key: string) => {
    dispatch(deleteImgs([key]));
  };

  return (
    <ImageList cols={4} gap={8} rowHeight="auto" className={classes.root}>
      {images.images.map(({ key, url }) => (
        <ImageListItem key={key} className={classes.imageItem}>
          <Image src={url} />
          <ImageListItemBar
            className={classes.imageBar}
            actionIcon={
              <Box>
                <IconButton
                  aria-label={`delete ${key}`}
                  className={classes.icon}
                  onClick={() => deleteImage(key)}
                >
                  <DeleteOutline />
                </IconButton>
                <IconButton
                  aria-label={`copy ${key}`}
                  className={classes.icon}
                  onClick={() => copyLink(url)}
                >
                  <CopyKeyIcon />
                </IconButton>
              </Box>
            }
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
};

export default ImageBrowser;
