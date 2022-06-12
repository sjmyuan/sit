/* eslint-disable react/jsx-wrap-multilines */
import React, { useState } from 'react';
import {
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Box,
  ImageList,
  Modal,
} from '@mui/material';
import {
  DeleteOutline,
  CloudDownloadOutlined,
  UploadOutlined,
} from '@mui/icons-material';
import InfiniteScroll from 'react-infinite-scroll-component';
import Image from './Image';
import { ImageContainer } from '../../store/ImageContainer';
import { O, TE } from '../../types';
import { constVoid, identity, pipe } from 'fp-ts/lib/function';
import AWSPreferences from '../preferences/AWSPreferences';
import { uploadImage } from '../../utils/awsUtil';
import { InfoContainer } from '../../store/InfoContainer';

const PAGE_SIZE = 20;

const ImageBrowser = (): React.ReactElement => {
  const imageContainer = ImageContainer.useContainer();
  const notification = InfoContainer.useContainer();
  const [totalPage, setTotalPage] = useState<number>(1);
  const [uploadingImageKey, setUploadingImageKey] = useState<O.Option<string>>(
    O.none
  );

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
    <Box>
      <InfiniteScroll
        dataLength={totalPage * PAGE_SIZE}
        next={() => {
          setTotalPage(totalPage + 1);
        }}
        hasMore={totalPage * PAGE_SIZE < imageContainer.images.length}
        loader={<h4>Loading...</h4>}
      >
        <ImageList
          sx={{ overflow: 'hidden' }}
          cols={4}
          gap={8}
          rowHeight="auto"
        >
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
                        aria-label={`delete ${key}`}
                        onClick={() => setUploadingImageKey(O.some(key))}
                      >
                        <UploadOutlined />
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
      <Modal
        open={O.isSome(uploadingImageKey)}
        onClose={() => setUploadingImageKey(O.none)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: 'absolute' as 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            width: 400,
            height: 400,
            p: 4,
          }}
        >
          <AWSPreferences
            initKey={O.fold<string, string>(
              () => '',
              identity
            )(uploadingImageKey)}
            onCancel={() => setUploadingImageKey(O.none)}
            onUpload={(
              accessId,
              secretAccessKey,
              bucket,
              region,
              remoteKey
            ) => {
              setUploadingImageKey(O.none);
              return notification.runTask(`upload ${remoteKey}`)(
                uploadImage(
                  accessId,
                  secretAccessKey,
                  bucket,
                  region,
                  O.getOrElse(() => '')(uploadingImageKey),
                  remoteKey
                )
              )();
            }}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default ImageBrowser;
