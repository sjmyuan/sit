import path from 'path';

import { ipcMain, app, BrowserWindow } from 'electron';
import { is } from 'electron-util';
import { loadRoute } from './util/routes';
import { initializeAppMenu } from './menu';
import { closeCropperWindow } from './cropper';

let mainWindow: BrowserWindow | null = null;

// eslint-disable-next-line import/prefer-default-export
export const openBrowserWindow = async (minimize: boolean): Promise<void> => {
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

  loadRoute(mainWindow, 'browser');

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

  ipcMain.on('took-screen-shot', () => {
    closeCropperWindow();
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send('took-screen-shot');
    }
  });

  initializeAppMenu(mainWindow);
};

export const hideBrowserWindow = (): void => {
  if (mainWindow) mainWindow.hide();
};
