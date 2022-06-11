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

export type RectProperties = {
  strokeWidth: number;
  stroke: string;
};

export type Rect = {
  readonly _tag: 'rect';
  id: number;
  name: string;
  origin: Point;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  props: RectProperties;
};

export type TextProperties = {
  fontSize: number;
  stroke: string;
};

export type Text = {
  readonly _tag: 'text';
  id: number;
  name: string;
  origin: Point;
  value: string;
  props: TextProperties;
};

export type LineProperties = {
  strokeWidth: number;
  stroke: string;
};

export type Line = {
  readonly _tag: 'line';
  id: number;
  name: string;
  points: Point[];
  props: LineProperties;
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

export const getTopLeftAndBottomRight = (rect: Rect) => {
  const left = rect.origin.x;
  const top = rect.origin.y;
  const right = rect.origin.x + rect.width * rect.scaleX;
  const bottom = rect.origin.y + rect.height * rect.scaleY;

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

/**
 * There are 3 coordinates
 * 1. canvas, which is the lowest level coordinate, no scale concept
 * 2. stage, which is virtual coordinate, support scale and transform
 * 3. drawingArea, virtual coordinate, stage/canvas independence
 */
export type StageInfo = {
  offsetOfCanvas: Point; // move the origin of canvas to (-1*offsetOfCanvas.x, -1*offsetOfCanvas.y)

  /**
   * We always map the (0, 0) of stage to canvas (-1*offsetOfCanvas.x, -1*offsetOfCanvas.y)
   * and map the view port origin to (0, 0) of canvas
   * So the top left point of view port in stage coordinate is (-1*stageInfo.offsetOfCanvas.x / stageInfo.scale, -1*stageInfo.offsetOfCanvas.y / stageInfo.scale)
   */
  viewPortOrigin: Point;
  viewPortSize: Size;
  scale: number;
  drawingArea: {
    origin: Point; // drawing are top left point position in stage coordinate
    topLeft: Point; // relative to drawing area origin
    bottomRight: Point; // relative to drawing area origin
  };
};

export type SitShape = Rect | Text | Line;

export type MODE =
  | 'RECT'
  | 'TEXT'
  | 'NONE'
  | 'ZOOM_IN'
  | 'ZOOM_OUT'
  | 'CLIP'
  | 'LINE';

export type Command = {
  op: 'ADD' | 'DELETE' | 'UPDATE';
  newShape: O.Option<SitShape>;
  oldShape: O.Option<SitShape>;
  do: () => void;
  undo: () => void;
};

export type CommandStack = {
  history: Command[];
  index: number; // the index of latest executed command
};

export const addCommand =
  (commandStack: CommandStack) => (command: Command) => ({
    index: commandStack.index + 1,
    history: [
      ...commandStack.history.slice(0, commandStack.index + 1),
      command,
    ],
  });

// export const undoCommand =
//   (commandStack: CommandStack) => (f: (command: Command) => void) => {
//     if (commandStack.index > -1) {
//       f(commandStack.history[commandStack.index]);
//       return { ...commandStack, index: commandStack.index - 1 };
//     }
//     return commandStack;
//   };

// export const reDoCommand =
//   (commandStack: CommandStack) => (f: (command: Command) => void) => {
//     if (commandStack.index + 1 < commandStack.history.length) {
//       f(commandStack.history[commandStack.index + 1]);
//       return { ...commandStack, index: commandStack.index + 1 };
//     }
//     return commandStack;
//   };
export const undoCommand = (commandStack: CommandStack) => {
  if (commandStack.index > -1) {
    commandStack.history[commandStack.index].undo();
    return { ...commandStack, index: commandStack.index - 1 };
  }
  return commandStack;
};

export const reDoCommand = (commandStack: CommandStack) => {
  if (commandStack.index + 1 < commandStack.history.length) {
    commandStack.history[commandStack.index + 1].do();
    return { ...commandStack, index: commandStack.index + 1 };
  }
  return commandStack;
};

export const canUndo = (commandStack: CommandStack): boolean =>
  commandStack.index > -1;

export const canRedo = (commandStack: CommandStack): boolean =>
  commandStack.index + 1 < commandStack.history.length;
