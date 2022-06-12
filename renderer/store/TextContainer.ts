import { pipe } from 'fp-ts/lib/function';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { A, O, Point, Text, TextProperties } from '../types';
import { CommandsContainer } from './CommandContainer';

function useTexts(initialState: Text[] = []) {
  const commands = CommandsContainer.useContainer();
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
    const oldText = pipe(
      texts,
      A.findFirst((x) => x.id === text.id)
    );

    //Ignore the new text with empty string
    if (O.isNone(oldText) && text.value === '') {
      return;
    }

    pipe(
      texts,
      A.filter((x) => x.id !== text.id),
      (x) => [...x, text],
      setTexts
    );

    commands.push({
      do: () =>
        pipe(
          texts,
          A.filter((x) => x.id !== text.id),
          (x) => [...x, text],
          setTexts
        ),
      undo: () =>
        pipe(
          texts,
          A.filter((x) => x.id !== text.id),
          (x) => (O.isSome(oldText) ? [...x, oldText.value] : x),
          setTexts
        ),
    });
  };

  const clear = () => setTexts([]);

  const deleteText = (text: Text) => {
    setTexts(texts.filter((x) => x.id !== text.id));
    commands.push({
      do: () => setTexts(texts.filter((x) => x.id !== text.id)),
      undo: () => setTexts([...texts, text]),
    });
  };

  return { texts, startToDraw, update, clear, deleteText, props, setProps };
}

// eslint-disable-next-line import/prefer-default-export
export const TextsContainer = createContainer(useTexts);
