import { sequenceS } from 'fp-ts/Apply';
import { S3 } from 'aws-sdk';
import { pipe, constVoid, identity } from 'fp-ts/lib/function';
import * as Ord from 'fp-ts/Ord';
import {
  AWSConfig,
  AppErrorOr,
  TE,
  A,
  E,
  O,
  S3ObjectPage,
  FileInfo,
  S3ObjectInfo,
} from '../types';
import { ImageIndex } from './AppDB';

export const s3Client = (config: AWSConfig): S3 => {
  const { accessId, secretAccessKey, region } = config;
  return new S3({
    accessKeyId: accessId,
    secretAccessKey,
    region,
  });
};

export const getSignedUrl = (s3: S3, bucket: string) => (
  key: string
): AppErrorOr<string> => {
  return TE.tryCatch(
    () =>
      s3.getSignedUrlPromise('getObject', {
        Bucket: bucket,
        Key: key,
      }),
    E.toError
  );
};

export const putObject = (s3: S3, bucket: string, cdn: O.Option<string>) => (
  key: string,
  blob: Blob
): AppErrorOr<S3ObjectInfo> => {
  return pipe(
    TE.tryCatch(
      () =>
        s3
          .putObject({
            Bucket: bucket,
            Key: key,
            Body: blob,
            StorageClass: 'STANDARD_IA',
          })
          .promise(),
      E.toError
    ),
    TE.chain(() =>
      O.isSome(cdn)
        ? TE.of(`${cdn.value}${key}`)
        : getSignedUrl(s3, bucket)(key)
    ),
    TE.map((url) => ({
      key,
      url,
    }))
  );
};

export const deleteObject = (s3: S3, bucket: string) => (
  key: string
): AppErrorOr<void> => {
  return pipe(
    TE.tryCatch(
      () =>
        s3
          .deleteObject({
            Bucket: bucket,
            Key: key,
          })
          .promise(),
      E.toError
    ),
    TE.map(() => constVoid())
  );
};

export const deleteObjects = (s3: S3, bucket: string) => (
  keys: string[]
): AppErrorOr<void> => {
  return pipe(
    A.array.traverse(TE.taskEither)(keys, (key) =>
      deleteObject(s3, bucket)(key)
    ),
    TE.map(() => constVoid())
  );
};

export const putObjects = (s3: S3, bucket: string, cdn: O.Option<string>) => (
  objects: FileInfo[]
): AppErrorOr<S3ObjectInfo[]> => {
  return A.array.traverse(TE.taskEither)(objects, ({ name, content }) =>
    putObject(s3, bucket, cdn)(name, content)
  );
};

export const listObjects = (s3: S3, bucket: string) => (
  pagePointer: O.Option<string>,
  pageSize: number,
  cdn: O.Option<string>
): AppErrorOr<S3ObjectPage> => {
  const markder: undefined | string = O.fold<string, undefined | string>(
    () => undefined,
    (x) => (x === '' ? undefined : x)
  )(pagePointer);

  return pipe(
    TE.fromTask(() =>
      s3
        .listObjectsV2({
          Bucket: bucket,
          MaxKeys: pageSize,
          ContinuationToken: markder,
        })
        .promise()
    ),
    TE.mapLeft((e) => new Error(`Failed to list objects, error is ${e}`)),
    TE.chain((res) => {
      return pipe(
        TE.fromEither(
          E.fromNullable(new Error('There is no keys in bucket'))(res.Contents)
        ),
        TE.chain((contents) => {
          const sortedContents = A.sort(
            Ord.fromCompare<S3.Object>((x, y) => {
              if (x.LastModified && y.LastModified) {
                return x.LastModified.getTime() > y.LastModified.getTime()
                  ? -1
                  : 1;
              }
              if (x.LastModified) {
                return -1;
              }
              return 1;
            })
          )(contents);
          const objects = A.array.traverse(TE.taskEither)(sortedContents, (k) =>
            pipe(
              TE.fromEither(
                E.fromNullable(new Error('The key is empty'))(k.Key)
              ),
              TE.chain((key) =>
                O.isSome(cdn)
                  ? TE.of(`${cdn.value}${key}`)
                  : getSignedUrl(s3, bucket)(key)
              ),
              TE.map((url) => ({ key: k.Key, url }))
            )
          );

          const pointer = TE.of(O.fromNullable(res.NextContinuationToken));

          return sequenceS(TE.taskEither)({
            objects,
            pointer,
          }) as TE.TaskEither<Error, S3ObjectPage>;
        })
      );
    })
  );
};
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
    TE.tryCatch(
      () =>
        s3
          .listObjectsV2({
            Bucket: bucket,
            MaxKeys: 100,
            ContinuationToken: markder,
          })
          .promise(),
      E.toError
    ),
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
                  lastModified: O.fromNullable<number>(
                    x.LastModified?.getTime()
                  ),
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
