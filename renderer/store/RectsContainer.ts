import { pipe } from 'fp-ts/lib/function';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { A, O, Point, Rect } from '../types';

function useRects(initialState: Rect[] = []) {
  const [rects, setRects] = useState<Rect[]>(initialState);
  const [newRect, setNewRect] = useState<O.Option<Rect>>(O.none);
  const startToDraw = (point: Point) =>
    setNewRect(
      O.some({
        id: rects.length + 1,
        origin: point,
        width: 0,
        height: 0,
      })
    );
  const drawing = (point: Point) =>
    setNewRect(
      pipe(
        newRect,
        O.map((rect) => ({
          id: rect.id,
          origin: rect.origin,
          width: point.x - rect.origin.x,
          height: point.y - rect.origin.y,
        }))
      )
    );

  const endToDraw = () => {
    if (O.isSome(newRect)) {
      setRects([...rects, newRect.value]);
      setNewRect(O.none);
    }
  };

  const getAllRects = () => {
    return O.isSome(newRect) ? [...rects, newRect.value] : rects;
  };

  const update = (rect: Rect) => {
    pipe(
      rects,
      A.filter((x) => x.id !== rect.id),
      (x) => [...x, rect]
    );
  };

  const clear = () => setRects([]);

  return {
    getAllRects,
    startToDraw,
    drawing,
    endToDraw,
    update,
    clear,
  };
}

// eslint-disable-next-line import/prefer-default-export
export const RectsContainer = createContainer(useRects);
