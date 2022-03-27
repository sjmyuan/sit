import { pipe } from 'fp-ts/lib/function';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { A, O, Point, Mask } from '../types';

function useMasks(initialState: Mask[] = []) {
  const [masks, setMasks] = useState<Mask[]>(initialState);
  const [newMask, setNewMask] = useState<O.Option<Mask>>(O.none);
  const [nextMaskId, setNextMaskId] = useState<number>(0);

  const startToDraw = (point: Point) => {
    setNewMask(
      O.some({
        _tag: 'mask',
        name: `mask-drawing-${nextMaskId}`,
        id: nextMaskId,
        origin: point,
        width: 0,
        height: 0,
      })
    );

    setNextMaskId(nextMaskId + 1);
  };
  const drawing = (point: Point) => {
    setNewMask(
      pipe(
        newMask,
        O.map((mask) => ({
          ...mask,
          width: point.x - mask.origin.x,
          height: point.y - mask.origin.y,
        }))
      )
    );
  };

  const endToDraw = () => {
    if (O.isSome(newMask)) {
      if (
        Math.abs(newMask.value.width) > 0 &&
        Math.abs(newMask.value.height) > 0
      ) {
        setMasks([
          ...masks,
          { ...newMask.value, name: `mask-${newMask.value.id}` },
        ]);
      }
      setNewMask(O.none);
    }
  };

  const getAllMasks = () => {
    return O.isSome(newMask) ? [...masks, newMask.value] : masks;
  };

  const update = (mask: Mask) => {
    pipe(
      masks,
      A.filter((x) => x.id !== mask.id),
      (x) => [...x, mask],
      setMasks
    );
  };

  const deleteMask = (mask: Mask) => {
    setMasks(masks.filter((x) => x.id !== mask.id));
  };

  const clear = () => setMasks([]);

  return {
    getAllMasks,
    startToDraw,
    drawing,
    endToDraw,
    update,
    clear,
    deleteMask,
    masks,
  };
}

// eslint-disable-next-line import/prefer-default-export
export const MasksContainer = createContainer(useMasks);
