import React, { useEffect } from 'react';
import * as A from 'fp-ts/Array';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import { Do } from 'fp-ts-contrib';
import { AppErrorOr } from '../renderer/types';
import { loadImages, getImageCache } from '../renderer/utils/localImages';
import { S3 } from 'aws-sdk';
import { pipe, constVoid, Lazy } from 'fp-ts/lib/function';
import { uploadImage, deleteImage } from '../renderer/utils/remoteImages';
import { ImageIndex } from '../renderer/utils/AppDB';
import { getFromStorage } from '../renderer/utils/localStorage';
import { s3Client } from '../renderer/utils/aws';

const startWoker = (worker: Lazy<AppErrorOr<void>>): T.Task<void> =>
  pipe(
    TE.fromIO(() => console.log('starting worker.....')),
    TE.chain(() => worker()),
    T.map((x) => {
      console.log(`end worker, result is ${JSON.stringify(x)}`);
      setTimeout(() => startWoker(worker)(), 60000);
    })
  );
const syncLocalToS3 = (s3: S3, bucket: string): AppErrorOr<void> =>
  pipe(
    loadImages(['ADDING', 'DELETING']),
    TE.chain((images) =>
      A.traverse(TE.taskEither)((image: ImageIndex) => {
        if (image.state === 'ADDING') {
          return pipe(
            getImageCache(image.key),
            TE.chain((x) => uploadImage(s3, bucket)(image.key, x))
          );
        }
        return deleteImage(s3, bucket)(image.key);
      })(images)
    ),
    TE.map(constVoid)
  );

const Worker = (): React.ReactElement => {
  useEffect(() => {
    const worker = Do.Do(TE.taskEither)
      .bindL('accessId', () =>
        TE.fromEither(getFromStorage<string>('access_id'))
      )
      .bindL('secretAccessKey', () =>
        TE.fromEither(getFromStorage<string>('secret_access_key'))
      )
      .bindL('region', () => TE.fromEither(getFromStorage<string>('region')))
      .bindL('bucket', () => TE.fromEither(getFromStorage<string>('bucket')))
      .letL('s3', ({ accessId, secretAccessKey, bucket, region }) =>
        s3Client({ accessId, secretAccessKey, region, bucket })
      )
      .doL(({ s3, bucket }) => syncLocalToS3(s3, bucket))
      .return(constVoid);

    startWoker(() => worker)();
  }, []);
  return <div />;
};

export default Worker;
