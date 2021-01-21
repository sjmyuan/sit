import React, { useState, useEffect } from 'react';
import * as O from 'fp-ts/Option';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { clipboard, NativeImage } from 'electron';
import { Box, Button } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    image: {
      maxWidth: '100%',
      maxHeight: '720px',
      marginBottom: '10px',
    },
  })
);

type ClipboardImageProps = {
  onUpload: (image: NativeImage) => void;
};

const ClipboardImage = (props: ClipboardImageProps) => {
  const classes = useStyles();
  const [nativeImage, setNativeImage] = useState<O.Option<NativeImage>>(O.none);

  useEffect(() => {
    const image = clipboard.readImage('clipboard');
    if (!image.isEmpty()) {
      setNativeImage(O.some(image));
    } else {
      setNativeImage(O.none);
    }
  }, []);

  if (O.isNone(nativeImage)) {
    return <div />;
  }
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px',
      }}
    >
      <img
        src={nativeImage.value.toDataURL()}
        alt=""
        className={classes.image}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => props.onUpload(nativeImage.value)}
      >
        Upload
      </Button>
    </Box>
  );
};

export default ClipboardImage;
