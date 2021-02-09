import { Tray } from 'electron';
import path from 'path';

// eslint-disable-next-line import/prefer-default-export
export const initializeTray = () => {
  const tray = new Tray(
    path.join(__dirname, '..', 'static', 'menubarDefaultTemplate.png')
  );
  tray.on('click', openCropperWindow);
  tray.on('right-click', openContextMenu);
  tray.on('drop-files', (_, files) => {
    track('editor/opened/tray');
    openFiles(...files);
  });

  return tray;
};
