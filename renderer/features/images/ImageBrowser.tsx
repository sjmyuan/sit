/* eslint-disable react/jsx-wrap-multilines */
import React, { useState, useEffect } from 'react';
import { clipboard } from 'electron';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import {
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Box,
  ImageList,
} from '@material-ui/core';
import { Link as CopyKeyIcon, DeleteOutline } from '@material-ui/icons';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import Image from './Image';
import { deleteImage, loadImages, getImageUrl } from '../../utils/localImages';
import { ImageIndex } from '../../utils/AppDB';

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
  const [images, setImages] = useState<ImageIndex[]>([]);

  useEffect(() => {
    pipe(loadImages(['ADDING', 'ADDED']), TE.map(setImages))();
    console.log('render browser...');
  }, []);

  return (
    <ImageList cols={4} gap={8} rowHeight="auto" className={classes.root}>
      {images.map(({ key }) => (
        <ImageListItem key={key} className={classes.imageItem}>
          <Image imageKey={key} />
          <ImageListItemBar
            className={classes.imageBar}
            actionIcon={
              <Box>
                <IconButton
                  aria-label={`delete ${key}`}
                  className={classes.icon}
                  onClick={() =>
                    pipe(
                      deleteImage(key),
                      TE.map(() =>
                        setImages(images.filter((x) => x.key !== key))
                      )
                    )()
                  }
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
