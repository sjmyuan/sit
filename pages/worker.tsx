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

const startWoker = (worker: Lazy<AppErrorOr<void>>): T.Task<void> =>
  pipe(
    TE.fromIO(() => {
      console.log('starting worker.....');
      ipcRenderer.send('sync-status', { syncing: true });
    }),
    TE.chain(() => worker()),
    T.map((x) => {
      E.fold(
        (e) => console.log(`end worker, error is ${JSON.stringify(e)}`),
        () => console.log('end worker successfully')
      )(x);
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
    preferences.loadPreferences();
    const worker = Do.Do(TE.taskEither)
      .doL(() => {
        console.log('loading aws configuration...');
        return TE.fromIO(() => preferences.loadPreferences());
      })
      .bindL('awsConfig', () =>
        TE.fromOption(() => new Error('No AWS Configuration'))(
          preferences.getAWSConfig()
        )
      )
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
