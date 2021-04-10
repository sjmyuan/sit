import { BrowserWindow } from 'electron';
import { is } from 'electron-util';
import { loadRoute } from './util/routes';

let workerWindow: BrowserWindow | null = null;

// eslint-disable-next-line import/prefer-default-export
export const openWorkerWindow = async (): Promise<void> => {
  workerWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: !is.development, // Disable webSecurity in dev to load video over file:// protocol while serving over insecure http, this is not needed in production where we use file:// protocol for html serving.
    },
  });

  loadRoute(workerWindow, 'worker');

  workerWindow.on('closed', () => {
    workerWindow = null;
  });
};
