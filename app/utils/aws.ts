import { sequenceS } from 'fp-ts/Apply';
import { S3 } from 'aws-sdk';
import { pipe, identity } from 'fp-ts/lib/function';
import {
  AWSConfig,
  AppErrorOr,
  TE,
  A,
  E,
  O,
  S3ObjectPage,
  FileInfo,
} from '../types';

export const s3Client = (config: AWSConfig) => {
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
  return TE.fromTask(() =>
    s3.getSignedUrlPromise('getObject', {
      Bucket: bucket,
      Key: key,
    })
  );
};

export const putObject = (s3: S3, bucket: string) => (
  key: string,
  blob: Blob
): AppErrorOr<string> => {
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
    TE.chain((_) => getSignedUrl(s3, bucket)(key))
  );
};

export const putObjects = (s3: S3, bucket: string) => (
  objects: FileInfo[]
): AppErrorOr<string[]> => {
  return A.array.traverse(TE.taskEither)(objects, ({ name, content }) =>
    putObject(s3, bucket)(name, content)
  );
};

export const listObjects = (s3: S3, bucket: string) => (
  pagePointer: O.Option<string>,
  pageSize: number
): AppErrorOr<S3ObjectPage> => {
  const markder: undefined | string = O.fold<string, undefined | string>(
    () => undefined,
    identity
  )(pagePointer);

  return pipe(
    TE.fromTask(() =>
      s3
        .listObjects({
          Bucket: bucket,
          MaxKeys: pageSize,
          Marker: markder,
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
          const objects = A.array.traverse(TE.taskEither)(contents, (k) =>
            pipe(
              TE.fromEither(
                E.fromNullable(new Error('The key is empty'))(k.Key)
              ),
              TE.chain(getSignedUrl(s3, bucket)),
              TE.map((url) => ({ key: k.Key, url }))
            )
          );

          const pointer =
            res.IsTruncated === true
              ? TE.of(
                  pipe(
                    A.last(contents),
                    O.chain((x) => O.fromNullable(x.Key))
                  )
                )
              : TE.of(O.none);

          return sequenceS(TE.taskEither)({
            objects,
            pointer,
          }) as TE.TaskEither<Error, S3ObjectPage>;
        })
      );
    })
  );
};