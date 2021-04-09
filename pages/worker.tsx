import React from 'react';
import * as A from 'fp-ts/Array';
import * as TE from 'fp-ts/TaskEither';
import { AppErrorOr } from '../renderer/types';
import { loadImages, getImageCache } from '../renderer/utils/localImages';
import { useSelector } from 'react-redux';
import { selectAWSConfig } from '../renderer/store';
import { S3 } from 'aws-sdk';
import { pipe, constVoid } from 'fp-ts/lib/function';
import { uploadImage, deleteImage } from '../renderer/utils/remoteImages';
import { ImageIndex } from '../renderer/utils/AppDB';

const startWorker = (s3: S3, bucket: string): AppErrorOr<void> =>
  pipe(
    loadImages(['ADDING', 'DELETING']),
    TE.chain((images) =>
      A.traverse(TE.taskEither)((image: ImageIndex) => {
        if (image.state === 'ADDING') {
          return pipe(
            getImageCache(image.key),
            TE.chain((x) => uploadImage(s3, bucket)(image.key, x))
          );
        } else {
          return deleteImage(s3, bucket)(image.key);
        }
      })(images)
    ),
    TE.map(constVoid)
  );
const Worker = (): React.ReactElement => {
  const awsConfig = useSelector(selectAWSConfig);
  return <div />;
};

export default Worker;
