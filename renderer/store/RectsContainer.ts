import { pipe } from 'fp-ts/lib/function';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { A, O, Point, Rect, RectProperties } from '../types';
import { CommandsContainer } from './CommandContainer';

function useRects(initialState: Rect[] = []) {
  const commands = CommandsContainer.useContainer();
  const [rects, setRects] = useState<Rect[]>(initialState);
  const [newRect, setNewRect] = useState<O.Option<Rect>>(O.none);
  const [nextRectId, setNextRectId] = useState<number>(100);
  const [props, setProps] = useState<RectProperties>({
    strokeWidth: 4,
    stroke: '#dc3268',
  });
  const startToDraw = (point: Point) => {
    setNewRect(
      O.some({
        _tag: 'rect',
        name: `rect-drawing-${nextRectId}`,
        id: nextRectId,
        origin: point,
        width: 0,
        height: 0,
        scaleX: 1,
        scaleY: 1,
        props: props,
      })
    );

    setNextRectId(nextRectId + 1);
  };
  const drawing = (point: Point) => {
    setNewRect(
      pipe(
        newRect,
        O.map((rect) => ({
          ...rect,
          width: point.x - rect.origin.x,
          height: point.y - rect.origin.y,
        }))
      )
    );
  };

  const endToDraw = () => {
    if (O.isSome(newRect)) {
      const completedNewRect = {
        ...newRect.value,
        name: `rect-${newRect.value.id}`,
      };
      setNewRect(O.none);
      if (
        Math.abs(newRect.value.width) > 0 &&
        Math.abs(newRect.value.height) > 0
      ) {
        setRects([...rects, completedNewRect]);
        commands.addShape(completedNewRect);
      }
    }
  };

  const getAllRects = () => {
    return O.isSome(newRect) ? [...rects, newRect.value] : rects;
  };

  const update = (rect: Rect) => {
    const oldRect = pipe(
      rects,
      A.findFirst((x) => x.id === rect.id)
    );
    pipe(
      rects,
      A.filter((x) => x.id !== rect.id),
      (x) => [...x, rect],
      setRects
    );
    commands.updateShape(oldRect, rect);
  };

  const deleteRect = (rect: Rect) => {
    setRects(rects.filter((x) => x.id !== rect.id));
    commands.deleteShape(rect);
  };

  const clear = () => setRects([]);

  return {
    getAllRects,
    startToDraw,
    drawing,
    endToDraw,
    update,
    clear,
    deleteRect,
    rects,
    props,
    setProps,
  };
}

// eslint-disable-next-line import/prefer-default-export
export const RectsContainer = createContainer(useRects);
