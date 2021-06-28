import React from 'react';
import { Box, IconButton } from '@material-ui/core';
import { Crop, AddAPhoto } from '@material-ui/icons';
import { ipcRenderer } from 'electron';
import { ChangeEvent } from 'react';
import { pipe } from 'fp-ts/lib/function';
import * as A from 'fp-ts/Array';
import * as TE from 'fp-ts/TaskEither';
import { FileInfo } from '../../types';
import { ImageContainer } from '../../store/ImageContainer';

const BrowserToolbar = (): React.ReactElement => {
  const imageContainer = ImageContainer.useContainer();
  const handleUploadFileImage = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files) {
      const uploadingImages = pipe(
        A.range(0, files.length - 1),
        A.reduce<number, FileInfo[]>([], (acc, ele) => {
          const file = files[ele];
          if (file) {
            return [...acc, { name: file.name, content: file }];
          }
          return acc;
        })
      );

      A.array.traverse(TE.taskEither)(uploadingImages, (file) =>
        imageContainer.addImage(file.name, file.content)
      )();
    }
  };
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <IconButton color="inherit" aria-label="upload picture" component="label">
        <AddAPhoto />
        <input
          accept="image/*"
          hidden
          id="icon-button-file"
          type="file"
          multiple
          onChange={handleUploadFileImage}
        />
      </IconButton>
      <IconButton
        color="inherit"
        aria-label="screen capture"
        onClick={() => {
          ipcRenderer.send('taking-screen-shot');
        }}
      >
        <Crop />
      </IconButton>
    </Box>
  );
};

export default BrowserToolbar;
