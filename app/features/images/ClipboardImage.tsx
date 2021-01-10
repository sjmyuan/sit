import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as O from 'fp-ts/Option';
import { v4 as uuidv4 } from 'uuid';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { clipboard, NativeImage } from 'electron';
import { Box, Button } from '@material-ui/core';
import { uploadImgs } from '../../utils/imagesThunk';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    image: {
      maxWidth: '100%',
      maxHeight: '100%',
    },
    paper: {
      position: 'absolute',
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[5],
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    },
  })
);

const ClipboardImage = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [nativeImage, setNativeImage] = useState<O.Option<NativeImage>>(O.none);

  useEffect(() => {
    const image = clipboard.readImage('clipboard');
    if (!image.isEmpty()) {
      setNativeImage(O.some(image));
    } else {
      setNativeImage(O.none);
    }
  }, []);

  const uploadImage = () => {
    if (O.isSome(nativeImage)) {
      const fileName = `${uuidv4()}.png`;
      dispatch(
        uploadImgs([
          { name: fileName, content: new Blob([nativeImage.value.toPNG()]) },
        ])
      );
    }
  };

  if (O.isNone(nativeImage)) {
    return <div />;
  }
  return (
    <Box>
      <img
        src={nativeImage.value.toDataURL()}
        alt=""
        className={classes.image}
      />
      <Button variant="contained" color="primary" onClick={uploadImage}>
        Upload
      </Button>
    </Box>
  );
};

export default ClipboardImage;
