import React, { useState, useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Modal } from '@material-ui/core';
import { ShapeContainer } from '../../store-unstated';
import { O, TE } from '../../types';
import { getImageUrl } from '../../utils/localImages';
import { pipe } from 'fp-ts/lib/function';

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

type ImageProps = {
  imageKey: string;
};

const Image = (props: ImageProps) => {
  const classes = useStyles();
  const shapes = ShapeContainer.useContainer();
  const [src, setSrc] = useState<string>('');
  useEffect(() => {
    pipe(
      getImageUrl(props.imageKey),
      TE.map((url) => setSrc(url))
    )();
  }, [props.imageKey]);
  return (
    <div>
      <img
        src={src}
        key={props.imageKey}
        alt=""
        onDoubleClick={() => shapes.setEditingImage(O.some(props.imageKey))}
        role="presentation"
        className={classes.image}
      />
    </div>
  );
};

export default Image;
