import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { O, Rect } from '../types';

function useClip() {
  const [clipRect, setClipRect] = useState<O.Option<Rect>>(
    O.some({
      _tag: 'rect',
      name: `clip-rect-1`,
      id: -1,
      origin: { x: 0, y: 0 },
      width: 100,
      height: 100,
    })
  );

  const clear = () => {
    setClipRect(O.none);
  };

  return {
    clipRect,
    setClipRect,
    clear,
  };
}

// eslint-disable-next-line import/prefer-default-export
export const ClipContainer = createContainer(useClip);
