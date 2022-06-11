import { useState } from 'react';
import { createContainer } from 'unstated-next';
import {
  A,
  addCommand,
  canRedo,
  canUndo,
  Command,
  CommandStack,
  O,
  reDoCommand,
  SitShape,
  undoCommand,
} from '../types';

function useCommands(initialState: CommandStack = { history: [], index: -1 }) {
  const [commandStack, setCommandStack] = useState<CommandStack>(initialState);

  const addShape = (shape: SitShape) => {
    setCommandStack(
      addCommand(commandStack)({
        op: 'ADD',
        newShape: O.some(shape),
        oldShape: O.none,
        do: () => {},
        undo: () => {},
      })
    );
  };

  const deleteShape = (shape: SitShape) => {
    setCommandStack(
      addCommand(commandStack)({
        op: 'DELETE',
        newShape: O.none,
        oldShape: O.some(shape),
        do: () => {},
        undo: () => {},
      })
    );
  };

  const updateShape = (oldShape: O.Option<SitShape>, newShape: SitShape) => {
    setCommandStack(
      addCommand(commandStack)({
        op: 'UPDATE',
        newShape: O.some(newShape),
        oldShape: oldShape,
        do: () => {},
        undo: () => {},
      })
    );
  };

  const addNewCommand = (doF: () => void, undoF: () => void) => {
    setCommandStack(
      addCommand(commandStack)({
        op: 'UPDATE',
        newShape: O.none,
        oldShape: O.none,
        do: doF,
        undo: undoF,
      })
    );
  };

  const redo = () => {
    setCommandStack(reDoCommand(commandStack));
  };

  const undo = () => {
    setCommandStack(undoCommand(commandStack));
  };

  const canRedo1 = () => canRedo(commandStack);
  const canUndo1 = () => canUndo(commandStack);

  return {
    addShape,
    deleteShape,
    updateShape,
    redo,
    undo,
    canRedo1,
    canUndo1,
    addNewCommand,
  };
}

// eslint-disable-next-line import/prefer-default-export
export const CommandsContainer = createContainer(useCommands);
