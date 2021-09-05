import React, { useEffect, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { pipe } from 'fp-ts/lib/function';
import { O, T, TE } from '../../types';
import { ShapeContainer } from '../../store/ShapesContainer';
import { ImageContainer } from '../../store/ImageContainer';

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

const Image = (props: ImageProps): React.ReactElement => {
  const { imageKey } = props;
  const classes = useStyles();
  const shapes = ShapeContainer.useContainer();
  const images = ImageContainer.useContainer();
  const [src, setSrc] = useState<string>('');
  useEffect(() => {
    pipe(
      images.getImageUrl(imageKey),
      TE.fold(
        (e) => T.of(console.log(`image url error ${e.message}`)),
        (url) => T.of(setSrc(url))
      )
    )();
  }, [imageKey]);

  return (
    <div>
      <img
        src={src}
        key={imageKey}
        alt=""
        onDoubleClick={() => shapes.setEditingImage(O.some(src))}
        role="presentation"
        className={classes.image}
      />
    </div>
  );
};

export default Image;
