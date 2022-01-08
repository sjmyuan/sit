import path from 'path';

import { screen, app, BrowserWindow } from 'electron';
import { loadRoute } from './util/routes';

let mainWindow: BrowserWindow | null = null;

// eslint-disable-next-line import/prefer-default-export
export const openMainWindow = async (
  minimize: boolean
): Promise<BrowserWindow> => {
  if (mainWindow) {
    return Promise.resolve(mainWindow);
  }

  console.log('open main...');

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../resources');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const activeDisplay = screen.getDisplayNearestPoint(
    screen.getCursorScreenPoint()
  );

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    minWidth: 1024,
    minHeight: 728,
    maxWidth: activeDisplay.bounds.width,
    maxHeight: activeDisplay.bounds.height,
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
    console.log('cloase main...');
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
    const minWidth = width + 160;
    const [oldWidth] = mainWindow.getContentSize();
    const newWidth = oldWidth < minWidth ? minWidth : oldWidth;
    const newHeight = Math.floor((newWidth * height) / width) + 84;
    mainWindow.setContentSize(newWidth, newHeight);
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
