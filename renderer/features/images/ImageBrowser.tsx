/* eslint-disable react/jsx-wrap-multilines */
import React, { useState, useEffect } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import {
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Box,
  ImageList,
} from '@material-ui/core';
import { DeleteOutline } from '@material-ui/icons';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import * as Ord from 'fp-ts/lib/Ord';
import Image from './Image';
import { deleteImage, loadImages } from '../../utils/localImages';
import { ImageIndex } from '../../utils/AppDB';
import { ImageContainer } from '../../store/ImageContainer';

const useStyles = makeStyles(() =>
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

const ImageBrowser = (): React.ReactElement => {
  const classes = useStyles();
  const imageContainer = ImageContainer.useContainer();

  return (
    <ImageList cols={4} gap={8} rowHeight="auto" className={classes.root}>
      {imageContainer.images.map(({ key }) => (
        <ImageListItem key={key} className={classes.imageItem}>
          <Image imageKey={key} />
          <ImageListItemBar
            className={classes.imageBar}
            actionIcon={
              <Box>
                <IconButton
                  aria-label={`delete ${key}`}
                  className={classes.icon}
                  onClick={() => imageContainer.deleteImage(key)()}
                >
                  <DeleteOutline />
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
