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
import { useSelector, useDispatch } from 'react-redux';
import Image from './Image';
import { selectImages } from '../../store';
import { setInfo } from '../../utils/infoSlice';
import { deleteImgs } from '../../utils/imagesThunk';
import { ImageIndex } from '../../utils/AppDB';
import { deleteImage, loadImages, getImageUrl } from '../../utils/localImages';

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
  const [images, setImages] = useState<{ key: string; url: string }[]>([]);

  useEffect(() => {
    loadImages().then((x) =>
      Promise.all(
        x.map((y) =>
          getImageUrl(y.key).then((url) => ({ key: y.key, url: url }))
        )
      ).then((r) => setImages(r))
    );
  });

  const copyLink = (link: string) => {
    clipboard.writeText(link);
  };

  const deleteImage = (key: string) => {
    deleteImage(key);
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
