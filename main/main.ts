import path from 'path';

import { app, BrowserWindow, ipcMain } from 'electron';
import { is } from 'electron-util';
import { loadRoute } from './util/routes';
import { closeCropperWindow, openCropperWindow } from './cropper';

let mainWindow: BrowserWindow | null = null;

// eslint-disable-next-line import/prefer-default-export
export const openMainWindow = async (
  minimize: boolean
): Promise<BrowserWindow> => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../resources');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      webSecurity: !is.development, // Disable webSecurity in dev to load video over file:// protocol while serving over insecure http, this is not needed in production where we use file:// protocol for html serving.
    },
  });

  loadRoute(mainWindow, 'main');

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (minimize) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  ipcMain.on('taking-screen-shot', () => {
    if (mainWindow) {
      mainWindow.hide();
      openCropperWindow();
    }
  });

  ipcMain.on('took-screen-shot', (_, key) => {
    closeCropperWindow();
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send('edit-image', key);
    }
  });

  return mainWindow;
};

export const hideMainWindow = (): void => {
  if (mainWindow) mainWindow.hide();
};
