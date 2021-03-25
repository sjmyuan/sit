import { Tray } from 'electron';
import path from 'path';
import { getTrayMenu } from './menu';

let tray: Tray;

const openContextMenu = async () => {
  tray.popUpContextMenu(getTrayMenu());
};

// eslint-disable-next-line import/prefer-default-export
export const initializeTray = (): Tray => {
  tray = new Tray(
    path.join(__dirname, '..', 'resources', 'icons', '16x16.png')
  );
  tray.on('click', openContextMenu);

  return tray;
};
