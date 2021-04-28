import React from 'react';
import { Box, IconButton } from '@material-ui/core';
import { Crop, AddAPhoto } from '@material-ui/icons';
import { ipcRenderer } from 'electron';
import { ChangeEvent } from 'react';
import { pipe } from 'fp-ts/lib/function';
import * as A from 'fp-ts/Array';
import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import { InfoContainer } from '../../store-unstated';
import { FileInfo } from '../../types';
import { uploadImage } from '../../utils/localImages';

const BrowserToolbar = (): React.ReactElement => {
  const notification = InfoContainer.useContainer();
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

      notification.startProcess();

      A.array
        .traverse(TE.taskEither)(uploadingImages, (file) =>
          uploadImage(file.name, file.content)
        )()
        .then(() => notification.showInfo(O.some('Image uploaded')))
        .catch(() => {
          notification.showError(O.some('Failed to upload image'));
        });
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
