import React, { useEffect } from 'react';
import * as A from 'fp-ts/Array';
import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import { Do } from 'fp-ts-contrib';
import { S3 } from 'aws-sdk';
import { pipe, constVoid, Lazy } from 'fp-ts/lib/function';
import { ipcRenderer } from 'electron';
import { sequenceS } from 'fp-ts/lib/Apply';
import { AppErrorOr } from '../renderer/types';
import {
  loadImages,
  getImageCache,
  syncImages,
  updateImageState,
} from '../renderer/utils/localImages';
import {
  uploadImage,
  deleteImage,
  s3Client,
  listAllImages,
} from '../renderer/utils/aws';
import { ImageIndex } from '../renderer/utils/AppDB';
import { getFromStorage } from '../renderer/utils/localStorage';
import {
  startToSync,
  successToSync,
  failedToSync,
  WorkerEvents,
  showStepInformation,
} from '../renderer/events';

const sendEvent = (event: WorkerEvents): AppErrorOr<void> =>
  TE.fromIO(() => {
    console.log(event);
    ipcRenderer.send('worker-event', event);
  });

const startWoker = (worker: Lazy<AppErrorOr<void>>): AppErrorOr<void> =>
  pipe(
    sendEvent(startToSync()),
    TE.chain(() => worker()),
    TE.chain(() => sendEvent(successToSync())),
    TE.orElse<Error, void, Error>((e: Error) =>
      sendEvent(failedToSync(e.message))
    ),
    TE.map(() => {
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
            TE.chain((x) => uploadImage(s3, bucket)(image.key, x)),
            TE.chain(() => updateImageState(image.key, 'ADDED'))
          );
        }
        return pipe(
          deleteImage(s3, bucket)(image.key),
          TE.chain(() => updateImageState(image.key, 'DELETED'))
        );
      })(images)
    ),
    TE.map(constVoid)
  );

const Worker = (): React.ReactElement => {
  useEffect(() => {
    const worker = Do.Do(TE.taskEither)
      .do(sendEvent(showStepInformation('Reading configuration...')))
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
      .letL('s3', ({ awsConfig }) => s3Client(awsConfig))
      .bindL('allRemoteImages', ({ s3, awsConfig }) =>
        listAllImages(s3, awsConfig.bucket, O.none)
      )
      .do(sendEvent(showStepInformation('Syncing remote images...')))
      .doL(({ allRemoteImages }) => syncImages(allRemoteImages))
      .do(sendEvent(showStepInformation('Syncing local images...')))
      .doL(({ s3, awsConfig }) => syncLocalToS3(s3, awsConfig.bucket))
      .return(constVoid);

    startWoker(() => worker)();
  }, []);
  return <div />;
};

export default Worker;
