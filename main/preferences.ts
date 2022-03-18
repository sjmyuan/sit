import { BrowserWindow } from 'electron';
import { loadRoute } from './util/routes';
import { notifyPreferrencesChangedInMainWindow } from './main';

let preferencesWindow: BrowserWindow | null = null;

// eslint-disable-next-line import/prefer-default-export
export const openPreferencesWindow = async (): Promise<BrowserWindow> => {
  if (preferencesWindow) {
    preferencesWindow.show();
    preferencesWindow.focus();
    return Promise.resolve(preferencesWindow);
  }

  preferencesWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: 400,
    maximizable: false,
    resizable: false,
    center: true,
    title: 'Preferences',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  loadRoute(preferencesWindow, 'preferences');

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  preferencesWindow.webContents.on('did-finish-load', () => {
    if (!preferencesWindow) {
      throw new Error('"preferrenceWindow" is not defined');
    }
    preferencesWindow.show();
    preferencesWindow.focus();
  });

  preferencesWindow.on('closed', () => {
    preferencesWindow = null;
    notifyPreferrencesChangedInMainWindow();
  });
  return preferencesWindow;
};

export const closePreferencesWindow = (): void => {
  if (preferencesWindow) preferencesWindow.destroy();
};
