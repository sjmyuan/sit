import { S3 } from 'aws-sdk';
import { AppErrorOr } from '../types';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { constVoid, pipe } from 'fp-ts/lib/function';
import { ImageIndex } from './AppDB';

const uploadImage = (s3: S3, bucket: string) => (
  key: string,
  image: Blob
): AppErrorOr<void> =>
  pipe(
    TE.tryCatch<Error, unknown>(
      () =>
        s3
          .putObject({
            Bucket: bucket,
            Key: key,
            Body: image,
            StorageClass: 'STANDARD_IA',
          })
          .promise(),
      E.toError
    ),
    TE.map(constVoid)
  );

const deleteImage = (s3: S3, bucket: string) => (
  key: string
): AppErrorOr<void> =>
  pipe(
    TE.tryCatch<Error, unknown>(
      () =>
        s3
          .deleteObject({
            Bucket: bucket,
            Key: key,
          })
          .promise(),
      E.toError
    ),
    TE.map(constVoid)
  );

const listAllImages = (
  s3: S3,
  bucket: string,
  pointer: O.Option<string>
): AppErrorOr<ImageIndex[]> => {
};

const syncImageIndex = (s3: S3, bucket: string) => {};
