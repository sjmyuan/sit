import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';

export * as TE from 'fp-ts/TaskEither';
export * as O from 'fp-ts/Option';
export * as E from 'fp-ts/Either';
export * as A from 'fp-ts/Array';
export * as T from 'fp-ts/Task';
export * as Ord from 'fp-ts/Ord';

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

export type Point = {
  x: number;
  y: number;
};

export type Rect = {
  readonly _tag: 'rect';
  id: number;
  name: string;
  origin: Point;
  width: number;
  height: number;
};

export type Text = {
  readonly _tag: 'text';
  id: number;
  name: string;
  origin: Point;
  value: string;
};

export type SitShape = Rect | Text;

export type MODE = 'RECT' | 'TEXT';
