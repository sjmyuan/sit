import { S3 } from 'aws-sdk';
import { AppErrorOr } from '../types';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as A from 'fp-ts/Array';
import { constVoid, pipe, identity } from 'fp-ts/lib/function';
import { ImageIndex } from './AppDB';
import { sequenceS } from 'fp-ts/lib/Apply';

export const uploadImage = (s3: S3, bucket: string) => (
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

export const deleteImage = (s3: S3, bucket: string) => (
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

export const listAllImages = (
  s3: S3,
  bucket: string,
  pointer: O.Option<string>
): AppErrorOr<ImageIndex[]> => {
  const markder: undefined | string = pipe(
    pointer,
    O.filter((x) => x.length > 0),
    O.toUndefined
  );
  return pipe(
    TE.fromTask(() =>
      s3
        .listObjectsV2({
          Bucket: bucket,
          MaxKeys: 100,
          ContinuationToken: markder,
        })
        .promise()
    ),
    TE.mapLeft((e) => new Error(`Failed to list objects, error is ${e}`)),
    TE.chain((res) => {
      return pipe(
        O.fromNullable(res.Contents),
        O.fold(() => [], identity),
        TE.of,
        TE.chain((contents) => {
          const nextPointer = O.fromNullable(res.NextContinuationToken);

          const currentPage: ImageIndex[] = pipe(
            contents,
            A.filterMap(
              (x) =>
                sequenceS(O.option)({
                  key: O.fromNullable<string>(x.Key),
                  lastModified: O.fromNullable<number>(1),
                  state: O.some('ADDED'),
                }) as O.Option<ImageIndex>
            )
          );

          if (O.isSome(nextPointer)) {
            const nextPage = listAllImages(s3, bucket, nextPointer);
            return pipe(
              nextPage,
              TE.map((x) => [...currentPage, ...x])
            );
          }

          return TE.of<Error, ImageIndex[]>(currentPage);
        })
      );
    })
  );
};
