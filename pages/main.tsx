import React, { useEffect, useState } from 'react';
import * as O from 'fp-ts/Option';
import {
  Container,
  CircularProgress,
  Snackbar,
  Backdrop,
  Alert,
  Box,
} from '@mui/material';
import MouseTrap from 'mousetrap';
import { constVoid, pipe } from 'fp-ts/lib/function';
import { ipcRenderer, clipboard } from 'electron';
import ImageBrowser from '../renderer/features/images/ImageBrowser';
import Editor from '../renderer/features/canvas/Editor';
import BrowserToolbar from '../renderer/features/toolbar/BrowserToolbar';
import EditorToolbar from '../renderer/features/toolbar/EditorToolbar';
import { ImageContainer } from '../renderer/store/ImageContainer';
import { TE, AppErrorOr } from '../renderer/types';
import { ImageIndex } from '../renderer/utils/AppDB';
import { getImageCacheUrl } from '../renderer/utils/localImages';
import { InfoContainer } from '../renderer/store/InfoContainer';
import { ShapeContainer } from '../renderer/store/ShapesContainer';

type STATUS = 'EDITOR' | 'HISTORY';

const MainPage = (): React.ReactElement => {
  const notification = InfoContainer.useContainer();
  const shapes = ShapeContainer.useContainer();
  const imageContainer = ImageContainer.useContainer();
  const { inProgress } = notification;
  const [pasting, togglePasting] = useState<boolean>(false);
  const [croppingImage, setCroppingImage] = useState<O.Option<ImageIndex>>(
    O.none
  );

  const [status, setStatus] = useState<STATUS>('EDITOR');

  useEffect(() => {
    setStatus('EDITOR');
  }, [shapes.editingImageUrl]);

  useEffect(() => {
    ipcRenderer.on('edit-image', (_, imageIndex: ImageIndex) => {
      pipe(
        getImageCacheUrl(imageIndex.key),
        TE.chain((url) =>
          TE.fromIO(() => {
            shapes.setEditingImage(O.some(url));
            setCroppingImage(O.some(imageIndex));
          })
        )
      )();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    imageContainer.loadAllImageIndexes()();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    MouseTrap.bind(['ctrl+v', 'command+v'], () => togglePasting(true));
    return () => {
      MouseTrap.unbind(['ctrl+v', 'command+v']);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const pasteImageFromClipboard = (): AppErrorOr<void> => {
      const image = clipboard.readImage('clipboard');
      if (!image.isEmpty()) {
        const key = `clipboard-${Date.now()}.png`;
        return pipe(
          imageContainer.addImage(key, new Blob([image.toPNG()])),
          TE.chain((_) => getImageCacheUrl(key)),
          TE.map((url: string) => {
            if (O.isSome(shapes.editingImageUrl)) {
              return shapes.setEditingImage(O.some(url));
            }
            return constVoid();
          })
        );
      }

      return TE.of(constVoid());
    };

    if (pasting) {
      togglePasting(false);
      pasteImageFromClipboard()();
    }

    if (O.isSome(croppingImage)) {
      setCroppingImage(O.none);
      imageContainer.setImages([croppingImage.value, ...imageContainer.images]);
    }
  }, [pasting, croppingImage]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={{ height: '100%' }}>
      {status === 'HISTORY' ? (
        <BrowserToolbar onBack={() => setStatus('EDITOR')} />
      ) : (
        <EditorToolbar onHistory={() => setStatus('HISTORY')} />
      )}
      <Container
        sx={{
          marginTop: '10px',
          marginBottom: '30px',
          height: 'calc(100% - (104px))',
          display: 'flex',
        }}
        maxWidth="xl"
      >
        {status === 'HISTORY' ? <ImageBrowser /> : <Editor />}
      </Container>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={O.isSome(notification.info)}
        autoHideDuration={6000}
        onClose={() => notification.showInfo(O.none)}
      >
        <Alert
          variant="filled"
          onClose={() => notification.showInfo(O.none)}
          severity="info"
        >
          {O.getOrElse(() => '')(notification.info)}
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={O.isSome(notification.error)}
        autoHideDuration={6000}
        onClose={() => notification.showError(O.none)}
      >
        <Alert
          variant="filled"
          onClose={() => notification.showError(O.none)}
          severity="error"
        >
          {O.getOrElse(() => '')(notification.error)}
        </Alert>
      </Snackbar>
      <Backdrop
        sx={{
          zIndex: 100,
          color: '#fff',
        }}
        open={inProgress}
      >
        <CircularProgress />
      </Backdrop>
    </Box>
  );
};

export default MainPage;
