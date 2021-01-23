import React, { useState, useEffect } from 'react';
import * as O from 'fp-ts/Option';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { clipboard, NativeImage } from 'electron';
import { Box, Button } from '@material-ui/core';
import Jimp from 'jimp';
import { useSelector, useDispatch } from 'react-redux';
import { selectSettings } from '../../store';
import { setError } from '../../utils/infoSlice';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    image: {
      maxWidth: '100%',
      maxHeight: '100%',
      marginBottom: '10px',
    },
  })
);

type ClipboardImageProps = {
  onUpload: (image: Blob) => void;
};

const ClipboardImage = (props: ClipboardImageProps) => {
  const classes = useStyles();
  const settings = useSelector(selectSettings);
  const dispatch = useDispatch();
  const [processedImage, setProcessedImage] = useState<O.Option<Blob>>(O.none);

  useEffect(() => {
    const image = clipboard.readImage('clipboard');
    if (!image.isEmpty()) {
      Jimp.read(image.toPNG())
        .then((jimp) =>
          jimp
            .contain(settings.resolution.width, settings.resolution.height)
            .getBufferAsync(Jimp.MIME_PNG)
        )
        .then((buff) => setProcessedImage(O.some(new Blob([buff]))))
        .catch(() => dispatch(setError('Failed to process image')));
    } else {
      setProcessedImage(O.none);
    }
  }, [settings.resolution]);

  if (O.isNone(processedImage)) {
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
        src={URL.createObjectURL(processedImage.value)}
        alt=""
        className={classes.image}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => props.onUpload(processedImage.value)}
      >
        Upload
      </Button>
    </Box>
  );
};

export default ClipboardImage;
