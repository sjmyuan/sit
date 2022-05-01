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

export type Area = {
  origin: Point;
  topLeft: Point;
  bottomRight: Point;
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

export type Mask = {
  readonly _tag: 'mask';
  id: number;
  name: string;
  origin: Point;
  width: number;
  height: number;
};

export const getSize = (topLeft: Point, bottomRight: Point) => ({
  width: Math.abs(bottomRight.x - topLeft.x),
  height: Math.abs(bottomRight.y - topLeft.y),
});

export const getAbsolutePosition = (
  coordinate: Point,
  relativePosition: Point
) => {
  return {
    x: coordinate.x + relativePosition.x,
    y: coordinate.y + relativePosition.y,
  };
};

export const getRelativePosition = (
  coordinate: Point,
  absolutePosition: Point
) => {
  return {
    x: absolutePosition.x - coordinate.x,
    y: absolutePosition.y - coordinate.y,
  };
};

export const getTopLeftAndBottomRight = (rect: Rect | Mask) => {
  const left = rect.origin.x;
  const top = rect.origin.y;
  const right = rect.origin.x + rect.width;
  const bottom = rect.origin.y + rect.height;

  const realLeft = left < right ? left : right;
  const realRight = left < right ? right : left;
  const realTop = top < bottom ? top : bottom;
  const realBottom = top < bottom ? bottom : top;

  return {
    topLeft: { x: realLeft, y: realTop },
    bottomRight: { x: realRight, y: realBottom },
  };
};

export type Size = {
  width: number;
  height: number;
};

export type StageInfo = {
  offset: Point;
  size: Size;
  scale: number;
  drawingArea: {
    origin: Point; // relative to offset
    topLeft: Point; // relative to origin
    bottomRight: Point; // relative to origin
  };
};

export type SitShape = Rect | Text | Mask;

export type MODE = 'RECT' | 'TEXT' | 'MASK' | 'NONE' | 'ZOOM_IN' | 'ZOOM_OUT';
