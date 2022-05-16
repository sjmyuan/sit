import { BrowserWindow, systemPreferences } from 'electron';
import log from 'electron-log';
import { loadRoute } from './util/routes';

let workerWindow: BrowserWindow | null = null;

const hasScreenAccess = (): boolean => {
  try {
    if (process.platform !== 'darwin') {
      return true;
    }

    const status = systemPreferences.getMediaAccessStatus('screen');

    log.info('Current screen access status:', status);

    return status === 'granted';
  } catch (error) {
    log.error('Could not get screen permission:', error);
  }
  return false;
};

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
    workerWindow.webContents.send('worker_prepare-for-cropper-window', {
      takeFullScreenShot: takeFullScreenShot,
      hasPermission: hasScreenAccess(),
    });
  }
};
