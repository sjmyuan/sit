import React from 'react';
import * as A from 'fp-ts/Array';
import * as TE from 'fp-ts/TaskEither';
import { AppErrorOr } from '../renderer/types';
import { loadImages } from '../renderer/utils/localImages';
import { useSelector } from 'react-redux';
import { selectAWSConfig } from '../renderer/store';
import { S3 } from 'aws-sdk';
import { pipe } from 'fp-ts/lib/function';
import { uploadImage, deleteImage } from '../renderer/utils/remoteImages';

const startWorker = (s3: S3, bucket: string): AppErrorOr<void> => {
  const processingImages = loadImages(['ADDING', 'DELETING']);
  pipe(
    processingImages,
    A.traverse(TE.taskEither)((image) => {
      if (image.state === 'ADDING') {
        const blob = getImageCache(image.key);
        uploadImage(s3, bucket)(image.key, null);
      } else {
        deleteImage(image.key);
      }
    })
  );
};

const Worker = (): React.ReactElement => {
  const awsConfig = useSelector(selectAWSConfig);
  return <div />;
};

export default Worker;
