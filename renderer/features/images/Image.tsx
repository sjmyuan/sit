import React, { useState, useEffect } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { pipe } from 'fp-ts/lib/function';
import * as T from 'fp-ts/Task';
import { Do } from 'fp-ts-contrib';
import { sequenceS } from 'fp-ts/lib/Apply';
import { O, TE, AWSConfig, AppErrorOr } from '../../types';
import { getImageCacheUrl } from '../../utils/localImages';
import { s3Client, getSignedUrl } from '../../utils/aws';
import { ShapeContainer } from '../../store/ShapesContainer';
import { PreferencesContainer } from '../../store/PreferencesContainer';

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

const getObjectSignedUrl = (awsConfig: O.Option<AWSConfig>) => (
  key: string
): AppErrorOr<string> => {
  return Do.Do(TE.taskEither)
    .bind(
      'config',
      TE.fromOption<Error>(() => new Error('No AWS Configuration'))(awsConfig)
    )
    .letL('s3', ({ config }) => s3Client(config))
    .bindL('url', ({ s3, config }) => getSignedUrl(s3, config.bucket)(key))
    .return(({ url }) => url);
};

type ImageProps = {
  imageKey: string;
};

const Image = (props: ImageProps): React.ReactElement => {
  const { imageKey } = props;
  const classes = useStyles();
  const shapes = ShapeContainer.useContainer();
  const preferences = PreferencesContainer.useContainer();
  const [src, setSrc] = useState<string>('');
  useEffect(() => {
    pipe(
      getImageCacheUrl(imageKey),
      TE.orElse(() =>
        getObjectSignedUrl(
          sequenceS(O.option)({
            accessId: preferences.accessId,
            secretAccessKey: preferences.secretAccessKey,
            bucket: preferences.bucket,
            region: preferences.region,
          })
        )(imageKey)
      ),
      TE.fold(
        (e) => T.of(console.log(`image url error ${e.message}`)),
        (url) => T.of(setSrc(url))
      )
    )();
  }, [
    imageKey,
    preferences.accessId,
    preferences.secretAccessKey,
    preferences.bucket,
    preferences.region,
  ]);
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
