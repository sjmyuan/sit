import React, { useEffect } from 'react';
import * as A from 'fp-ts/Array';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { Do } from 'fp-ts-contrib';
import { S3 } from 'aws-sdk';
import { pipe, constVoid, Lazy } from 'fp-ts/lib/function';
import { ipcRenderer } from 'electron';
import { AppErrorOr } from '../renderer/types';
import {
  loadImages,
  getImageCache,
  syncImages,
} from '../renderer/utils/localImages';
import {
  uploadImage,
  deleteImage,
  s3Client,
  listAllImages,
} from '../renderer/utils/aws';
import { ImageIndex } from '../renderer/utils/AppDB';
import { PreferencesContainer } from '../renderer/store-unstated';
import { sequenceS } from 'fp-ts/lib/Apply';
import { getFromStorage } from '../renderer/utils/localStorage';

const startWoker = (worker: Lazy<AppErrorOr<void>>): AppErrorOr<void> =>
  pipe(
    TE.fromIO(() => {
      console.log('starting worker.....');
      ipcRenderer.send('sync-status', { syncing: true });
    }),
    TE.chain(() => worker()),
    TE.orElse<Error, void, Error>((e: Error) =>
      TE.fromIO(() => console.log(`Error happend: ${e.message}`))
    ),
    TE.map(() => {
      console.log('end worker.....');
      ipcRenderer.send('sync-status', { syncing: false });
      setTimeout(() => startWoker(worker)(), 60000);
      return constVoid();
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
  const preferences = PreferencesContainer.useContainer();
  useEffect(() => {
    const worker = Do.Do(TE.taskEither)
      .bindL('awsConfig', () => {
        return TE.fromOption(() => new Error('No AWS Configuration'))(
          sequenceS(O.option)({
            accessId: O.fromEither(getFromStorage<string>('access_id')),
            secretAccessKey: O.fromEither(
              getFromStorage<string>('secret_access_key')
            ),
            bucket: O.fromEither(getFromStorage<string>('bucket')),
            region: O.fromEither(getFromStorage<string>('region')),
          })
        );
      })
      .doL(({ awsConfig }) =>
        TE.fromIO(() => console.log(JSON.stringify(awsConfig)))
      )
      .letL('s3', ({ awsConfig }) => s3Client(awsConfig))
      .bindL('allRemoteImages', ({ s3, awsConfig }) =>
        listAllImages(s3, awsConfig.bucket, O.none)
      )
      .doL(({ allRemoteImages }) =>
        TE.fromIO(() => console.log(JSON.stringify(allRemoteImages)))
      )
      .doL(({ allRemoteImages }) => syncImages(allRemoteImages))
      .doL(({ s3, awsConfig }) => syncLocalToS3(s3, awsConfig.bucket))
      .return(constVoid);

    startWoker(() => worker)();
  }, []);
  return <div />;
};

export default Worker;
