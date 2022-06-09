import {
  addCommand,
  Command,
  CommandStack,
  O,
  reDoCommand,
  undoCommand,
} from './types';

const buildCommand: (id: number) => Command = (id: number) => ({
  op: 'ADD',
  newShape: O.some({
    _tag: 'rect',
    name: `rect-1`,
    id: id,
    origin: { x: 0, y: 0 },
    width: 0,
    height: 0,
    scaleX: 1,
    scaleY: 1,
    props: {
      strokeWidth: 4,
      stroke: '#dc3268',
    },
  }),
  oldShape: O.none,
});

describe('command history', () => {
  test('add command should append the command to the array', () => {
    const stack: CommandStack = { history: [], index: -1 };
    const command = buildCommand(1);
    const result = addCommand(stack)(command);
    expect(result).toStrictEqual({
      index: 0,
      history: [command],
    });
  });

  test('add command should override the command after index', () => {
    const command1 = buildCommand(1);
    const command2 = buildCommand(2);
    const command3 = buildCommand(3);
    const command4 = buildCommand(4);
    const stack: CommandStack = {
      history: [command1, command2, command3],
      index: 0,
    };
    const result = addCommand(stack)(command4);
    expect(result).toStrictEqual({
      index: 1,
      history: [command1, command4],
    });
  });

  test('undo command should undo the command under index', () => {
    const command1 = buildCommand(1);
    const command2 = buildCommand(2);
    const command3 = buildCommand(3);
    const stack: CommandStack = {
      history: [command1, command2, command3],
      index: 1,
    };
    const result = undoCommand(stack)((c) => expect(c).toStrictEqual(command2));
    expect(result).toStrictEqual({
      index: 0,
      history: [command1, command2, command3],
    });
  });

  test('redo command should redo the command after index', () => {
    const command1 = buildCommand(1);
    const command2 = buildCommand(2);
    const command3 = buildCommand(3);
    const stack: CommandStack = {
      history: [command1, command2, command3],
      index: 1,
    };
    const result = reDoCommand(stack)((c) => expect(c).toStrictEqual(command3));
    expect(result).toStrictEqual({
      index: 2,
      history: [command1, command2, command3],
    });
  });
});
