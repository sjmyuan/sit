import { BrowserWindow } from 'electron';
import { is } from 'electron-util';
import { loadRoute } from './util/routes';

let preferencesWindow: BrowserWindow | null = null;

// eslint-disable-next-line import/prefer-default-export
export const openPreferencesWindow = async (): Promise<BrowserWindow> => {
  preferencesWindow = new BrowserWindow({
    show: false,
    width: 600,
    height: 300,
    maximizable: false,
    resizable: false,
    center: true,
    title: 'Preferences',
    webPreferences: {
      nodeIntegration: true,
      webSecurity: !is.development, // Disable webSecurity in dev to load video over file:// protocol while serving over insecure http, this is not needed in production where we use file:// protocol for html serving.
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
  });

  return preferencesWindow;
};

export const closePreferencesWindow = (): void => {
  if (preferencesWindow) preferencesWindow.destroy();
};
