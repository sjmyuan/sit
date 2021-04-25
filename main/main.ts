import path from 'path';

import { app, BrowserWindow } from 'electron';
import { loadRoute } from './util/routes';

let mainWindow: BrowserWindow | null = null;

// eslint-disable-next-line import/prefer-default-export
export const openMainWindow = async (
  minimize: boolean
): Promise<BrowserWindow> => {
  if (mainWindow) {
    return Promise.resolve(mainWindow);
  }

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
    center: true,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
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

  return mainWindow;
};

export const editImageinMainWindow = async (key: string): Promise<void> => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('edit-image', key);
  } else {
    const newMainWindow = await openMainWindow(false);
    newMainWindow.show();
    newMainWindow.focus();
    newMainWindow.webContents.on('did-finish-load', () => {
      newMainWindow.webContents.send('edit-image', key);
    });
  }
};

export const resizeMainWindow = (width: number, height: number) => {
  if (mainWindow) {
    const newWidth = Math.max(mainWindow.getSize()[0], width + 30);
    const newHeight = Math.max(mainWindow.getSize()[1], height + 30);
    mainWindow.setContentSize(newWidth, newHeight);
    mainWindow.center();
  }
};

export const hideMainWindow = (): void => {
  if (mainWindow) mainWindow.hide();
};

export const closeMainWindow = (): void => {
  if (mainWindow) mainWindow.destroy();
};
