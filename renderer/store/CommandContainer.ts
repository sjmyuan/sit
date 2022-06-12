import { useState } from 'react';
import { createContainer } from 'unstated-next';
import {
  addCommand,
  canRedo,
  canUndo,
  Command,
  CommandStack,
  reDoCommand,
  undoCommand,
} from '../types';

function useCommands(initialState: CommandStack = { history: [], index: -1 }) {
  const [commandStack, setCommandStack] = useState<CommandStack>(initialState);

  const push = (command: Command) => {
    setCommandStack(addCommand(commandStack)(command));
  };

  const redo = () => {
    setCommandStack(reDoCommand(commandStack));
  };

  const undo = () => {
    setCommandStack(undoCommand(commandStack));
  };

  const hasRedoCommand = () => canRedo(commandStack);
  const hasUndoCommand = () => canUndo(commandStack);

  const clear = () => setCommandStack(initialState);

  return {
    redo,
    undo,
    hasRedoCommand,
    hasUndoCommand,
    push,
    clear,
  };
}

// eslint-disable-next-line import/prefer-default-export
export const CommandsContainer = createContainer(useCommands);
