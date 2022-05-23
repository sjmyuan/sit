import { pipe } from 'fp-ts/lib/function';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { A, Point, Text, TextProperties } from '../types';

function useTexts(initialState: Text[] = []) {
  const [texts, setTexts] = useState<Text[]>(initialState);
  const [nextTextId, setNextTextId] = useState<number>(0);
  const [props, setProps] = useState<TextProperties>({
    fontSize: 30,
    stroke: '#dc3268',
  });
  const startToDraw = (point: Point) => {
    const newText: Text = {
      _tag: 'text',
      id: nextTextId,
      name: `text-${nextTextId}`,
      origin: point,
      value: '',
      props: props,
    };
    setTexts([...texts, newText]);
    setNextTextId(nextTextId + 1);
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

  return { texts, startToDraw, update, clear, deleteText, props, setProps };
}

// eslint-disable-next-line import/prefer-default-export
export const TextsContainer = createContainer(useTexts);
