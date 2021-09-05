/* eslint-disable react/jsx-wrap-multilines */
import React, { useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import {
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Box,
  ImageList,
} from '@material-ui/core';
import { DeleteOutline, CloudDownloadOutlined } from '@material-ui/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import Image from './Image';
import { ImageContainer } from '../../store/ImageContainer';
import { ImageIndex } from '../../utils/AppDB';
import { O, TE } from '../../types';
import { constVoid, pipe } from 'fp-ts/lib/function';

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

const PAGE_SIZE = 20;

const ImageBrowser = (): React.ReactElement => {
  const classes = useStyles();
  const imageContainer = ImageContainer.useContainer();
  const [totalPage, setTotalPage] = useState<number>(1);

  const downloadImage = (key: string) => {
    pipe(
      imageContainer.getImageUrl(key),
      TE.map((url) => {
        const a = document.createElement('a');
        a.setAttribute('download', key);
        a.setAttribute('href', url);
        a.click();
        return constVoid();
      })
    )();
  };

  return (
    <InfiniteScroll
      dataLength={totalPage * PAGE_SIZE}
      next={() => {
        setTotalPage(totalPage + 1);
      }}
      hasMore={totalPage * PAGE_SIZE < imageContainer.images.length}
      loader={<h4>Loading...</h4>}
    >
      <ImageList cols={4} gap={8} rowHeight="auto" className={classes.root}>
        {imageContainer.images
          .slice(0, totalPage * PAGE_SIZE)
          .map(({ key }) => (
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
                    <IconButton
                      aria-label={`download ${key}`}
                      className={classes.icon}
                      onClick={() => downloadImage(key)}
                    >
                      <CloudDownloadOutlined />
                    </IconButton>
                  </Box>
                }
              />
            </ImageListItem>
          ))}
      </ImageList>
    </InfiniteScroll>
  );
};

export default ImageBrowser;
