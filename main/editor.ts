import path from 'path';

import { app, BrowserWindow, ipcMain } from 'electron';
import { is } from 'electron-util';
import { loadRoute } from './util/routes';
import { initializeAppMenu } from './menu';
import { closeCropperWindow } from './cropper';

let editorWindow: BrowserWindow | null = null;

// eslint-disable-next-line import/prefer-default-export
export const openEditorWindow = async (minimize: boolean): Promise<void> => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../resources');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  editorWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      webSecurity: !is.development, // Disable webSecurity in dev to load video over file:// protocol while serving over insecure http, this is not needed in production where we use file:// protocol for html serving.
    },
  });

  loadRoute(editorWindow, 'editor');

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  editorWindow.webContents.on('did-finish-load', () => {
    if (!editorWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (minimize) {
      editorWindow.minimize();
    } else {
      editorWindow.show();
      editorWindow.focus();
    }
  });

  editorWindow.on('closed', () => {
    editorWindow = null;
  });

  ipcMain.on('took-screen-shot', (_, key) => {
    closeCropperWindow();
    if (editorWindow) {
      editorWindow.show();
      editorWindow.focus();
      editorWindow.webContents.send('edit-image', key);
    }
  });

  ipcMain.on('go-to-browser', () => {
    if (editorWindow) {
      loadRoute(editorWindow, 'browser');
    }
  });

  ipcMain.on('go-to-editor', (_, key) => {
    if (editorWindow) {
      loadRoute(editorWindow, 'editor');
      editorWindow.webContents.send('edit-image', key);
    }
  });

  initializeAppMenu(editorWindow);
};

export const hideEditorWindow = (): void => {
  if (editorWindow) editorWindow.hide();
};
