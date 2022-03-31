import { BrowserWindow } from 'electron';
import { loadRoute } from './util/routes';

let workerWindow: BrowserWindow | null = null;

// eslint-disable-next-line import/prefer-default-export
export const openWorkerWindow = async (): Promise<void> => {
  workerWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  loadRoute(workerWindow, 'worker');

  workerWindow.on('closed', () => {
    workerWindow = null;
  });
};

export const prepareForCropperWindow = async (
  takeFullScreenShot: boolean
): Promise<void> => {
  if (workerWindow) {
    console.log('sending event to worker...');
    workerWindow.webContents.send('worker_prepare-for-cropper-window', {
      takeFullScreenShot: takeFullScreenShot,
    });
  }
};
