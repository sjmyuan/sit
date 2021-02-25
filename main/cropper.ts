import path from 'path';

import { app, BrowserWindow, Display } from 'electron';
import { is } from 'electron-util';
import { loadRoute } from './util/routes';
import MenuBuilder from '../app/menu';

let cropperWindow: BrowserWindow | null = null;

const openCropperWindow = async (
  display: Display,
  activeDisplayId: int
): Promise<void> => {
  const { id, bounds } = display;
  const { x, y, width, height } = bounds;
  cropperWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    hasShadow: false,
    enableLargerThanScreen: true,
    resizable: false,
    movable: false,
    frame: false,
    transparent: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  loadRoute(cropperWindow, 'cropper');

  cropperWindow.setAlwaysOnTop(true, 'screen-saver', 1);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  cropperWindow.webContents.on('did-finish-load', () => {
    if (!cropperWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    const isActive = activeDisplayId === id;
    const displayInfo = {
      isActive,
      id,
      x,
      y,
      width,
      height,
    };
    cropperWindow.webContents.send('display', displayInfo);
  });

  cropperWindow.on('closed', () => {
    cropperWindow = null;
  });

  const menuBuilder = new MenuBuilder(cropperWindow);
  menuBuilder.buildMenu();
};

export default { openBrowserWindow: openCropperWindow };
