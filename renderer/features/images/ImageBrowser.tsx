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
import { DeleteOutline } from '@material-ui/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import Image from './Image';
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

const PAGE_SIZE = 20;

const ImageBrowser = (): React.ReactElement => {
  const classes = useStyles();
  const imageContainer = ImageContainer.useContainer();
  const [totalPage, setTotalPage] = useState<number>(1);

  return (
    <InfiniteScroll
      dataLength={totalPage * PAGE_SIZE}
      next={() => {
        console.log('load....');
        console.log(totalPage);
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
