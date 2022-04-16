import path from 'path';

import { app, BrowserWindow } from 'electron';
import { loadRoute } from './util/routes';

let mainWindow: BrowserWindow | null = null;

// eslint-disable-next-line import/prefer-default-export
export const openMainWindow = async (
  minimize: boolean
): Promise<BrowserWindow> => {
  if (mainWindow) {
    mainWindow.show();
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
      contextIsolation: false,
    },
  });

  loadRoute(mainWindow, 'main');

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('load main...');
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

export const editImageinMainWindow = async (imageIndex: any): Promise<void> => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('edit-image', imageIndex);
  } else {
    const newMainWindow = await openMainWindow(false);
    newMainWindow.show();
    newMainWindow.focus();
    newMainWindow.webContents.on('did-finish-load', () => {
      newMainWindow.webContents.send('edit-image', imageIndex);
    });
  }
};

export const resizeMainWindow = (width: number, height: number) => {
  if (mainWindow) {
    mainWindow.setContentSize(width + 160, height + 84);
  }
};

export const sendWorkerEventToMainWindow = (info: { syncing: boolean }) => {
  if (mainWindow) {
    mainWindow.webContents.send('worker-event', info);
  }
};

export const notifyPreferrencesChangedInMainWindow = () => {
  if (mainWindow) {
    mainWindow.webContents.send('preferences-changed');
  }
};

export const hideMainWindow = (): void => {
  if (mainWindow) mainWindow.hide();
};

export const closeMainWindow = (): void => {
  if (mainWindow) mainWindow.destroy();
};
