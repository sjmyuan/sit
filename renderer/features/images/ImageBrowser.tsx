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

type ImageState = {
  key: string;
  url: string;
};

const ImageBrowser = (): React.ReactElement => {
  const classes = useStyles();
  const [images, setImages] = useState<ImageState[]>([]);

  useEffect(() => {
    pipe(
      loadImages(['ADDING', 'ADDED']),
      TE.chain<Error, ImageIndex[], ImageState[]>((indexes) =>
        A.array.traverse(TE.taskEither)(indexes, (index) =>
          pipe(
            getImageUrl(index.key),
            TE.map((url) => ({ key: index.key, url }))
          )
        )
      ),
      TE.map(setImages)
    )().catch((e) => console.log(e));
  });

  const copyLink = (link: string) => {
    clipboard.writeText(link);
  };

  return (
    <ImageList cols={4} gap={8} rowHeight="auto" className={classes.root}>
      {images.map(({ key, url }) => (
        <ImageListItem key={key} className={classes.imageItem}>
          <Image src={url} />
          <ImageListItemBar
            className={classes.imageBar}
            actionIcon={
              <Box>
                <IconButton
                  aria-label={`delete ${key}`}
                  className={classes.icon}
                  onClick={() => deleteImage(key)()}
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
