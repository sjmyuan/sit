import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';

export * as TE from 'fp-ts/TaskEither';
export * as O from 'fp-ts/Option';
export * as E from 'fp-ts/Either';
export * as A from 'fp-ts/Array';
export * as T from 'fp-ts/Task';

export type AppErrorOr<A> = TE.TaskEither<Error, A>;

export type S3ObjectPage = {
  objects: S3ObjectInfo[];
  pointer: O.Option<string>;
};

export type FileInfo = {
  name: string;
  content: Blob;
};

export type S3ObjectInfo = {
  key: string;
  url: string;
};

export interface AWSConfig {
  accessId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
}

export type Resolution = {
  width: number;
  height: number;
};
