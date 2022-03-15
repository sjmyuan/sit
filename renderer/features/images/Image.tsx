import React, { useEffect, useState } from 'react';
import { pipe } from 'fp-ts/lib/function';
import { O, T, TE } from '../../types';
import { ShapeContainer } from '../../store/ShapesContainer';
import { ImageContainer } from '../../store/ImageContainer';
import { css } from '@emotion/css';

type ImageProps = {
  imageKey: string;
};

const Image = (props: ImageProps): React.ReactElement => {
  const { imageKey } = props;
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
        className={css`
          max-width: '100%';
          max-height: '100%';
        `}
        src={src}
        key={imageKey}
        alt=""
        onDoubleClick={() => shapes.setEditingImage(O.some(src))}
        role="presentation"
      />
    </div>
  );
};

export default Image;
