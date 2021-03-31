import { useState } from 'react';
import * as A from 'fp-ts/Array';
import * as O from 'fp-ts/Option';
import { createContainer } from 'unstated-next';
import { pipe, constVoid } from 'fp-ts/lib/function';

type Point = {
  x: number;
  y: number;
};

type Rect = {
  id: number;
  origin: Point;
  width: number;
  height: number;
};

function useRects(initialState: Rect[] = []) {
  const [rects, setRects] = useState<Rect[]>(initialState);
  const add = (rect: Rect) => setRects([...rects, rect]);
  const remove = (id: number) => setRects(rects.filter((x) => x.id !== id));
  const getLast = (): O.Option<Rect> => A.last(rects);
  const updateLast = (bottomRight: Point) => {
    pipe(
      getLast(),
      O.map((rect) => ({
        id: rect.id,
        origin: rect.origin,
        width: bottomRight.x - rect.origin.x,
        height: bottomRight.y - rect.origin.y,
      })),
      O.fold(
        () => constVoid(),
        (rect) => setRects([...A.dropRight(1)(rects), rect])
      )
    );
  };

  const clearEmpty = () => rects.filter((x) => x.width > 0 && x.height > 0);

  return { rects, add, remove, getLast, updateLast, clearEmpty };
}

export const RectsContainer = createContainer(useRects);
