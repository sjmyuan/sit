import { pipe } from 'fp-ts/lib/function';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { A, Point, Text } from '../types';

function useTexts(initialState: Text[] = []) {
  const [texts, setTexts] = useState<Text[]>(initialState);
  const startToDraw = (point: Point) => {
    const newText: Text = {
      _tag: 'text',
      id: texts.length + 1,
      name: `text-${texts.length + 1}`,
      origin: point,
      value: '',
    };
    setTexts([...texts, newText]);
    return newText;
  };

  const update = (text: Text) => {
    pipe(
      texts,
      A.filter((x) => x.id !== text.id),
      (x) => [...x, text],
      setTexts
    );
  };

  const clear = () => setTexts([]);

  const deleteText = (text: Text) => {
    setTexts(texts.filter((x) => x.id !== text.id));
  };

  return { texts, startToDraw, update, clear, deleteText };
}

// eslint-disable-next-line import/prefer-default-export
export const TextsContainer = createContainer(useTexts);
