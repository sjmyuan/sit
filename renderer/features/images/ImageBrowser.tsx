/* eslint-disable react/jsx-wrap-multilines */
import React, { useState } from 'react';
import {
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Box,
  ImageList,
} from '@mui/material';
import { DeleteOutline, CloudDownloadOutlined } from '@mui/icons-material';
import InfiniteScroll from 'react-infinite-scroll-component';
import Image from './Image';
import { ImageContainer } from '../../store/ImageContainer';
import { TE } from '../../types';
import { constVoid, pipe } from 'fp-ts/lib/function';

const PAGE_SIZE = 20;

const ImageBrowser = (): React.ReactElement => {
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
      <ImageList sx={{ overflow: 'hidden' }} cols={4} gap={8} rowHeight="auto">
        {imageContainer.images
          .slice(0, totalPage * PAGE_SIZE)
          .map(({ key }) => (
            <ImageListItem
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                overflow: 'hidden',
                position: 'relative',
                minHeight: '164px',
              }}
              key={key}
            >
              <Image imageKey={key} />
              <ImageListItemBar
                sx={{ height: '30px' }}
                actionIcon={
                  <Box>
                    <IconButton
                      sx={{
                        color: 'rgba(255, 255, 255, 0.54)',
                        padding: '6px',
                      }}
                      aria-label={`delete ${key}`}
                      onClick={() => imageContainer.deleteImage(key)()}
                    >
                      <DeleteOutline />
                    </IconButton>
                    <IconButton
                      sx={{
                        color: 'rgba(255, 255, 255, 0.54)',
                        padding: '6px',
                      }}
                      aria-label={`download ${key}`}
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
