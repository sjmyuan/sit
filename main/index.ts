import { app, ipcMain, globalShortcut } from 'electron';
import { is, enforceMacOSAppLocation } from 'electron-util';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import prepareNext from 'electron-next';
import { initializeTray } from './tray';
import {
  openMainWindow,
  closeMainWindow,
  hideMainWindow,
  editImageinMainWindow,
  resizeMainWindow,
  sendWorkerEventToMainWindow,
} from './main';
import { openWorkerWindow } from './worker';
import { initializeAppMenu } from './menu';
import { closeCropperWindow, openCropperWindow } from './cropper';
import { closePreferencesWindow } from './preferences';

app.commandLine.appendSwitch('--enable-features', 'OverlayScrollbar');

const checkForUpdates = async (): Promise<void> => {
  if (is.development) {
    return;
  }

  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    autoUpdater.logger?.error(error);
  }

  autoUpdater.logger = log;

  setInterval(checkForUpdates, 24 * 60 * 60 * 1000);
};

// Prepare the renderer once the app is ready
(async () => {
  await app.whenReady();

  app.setAboutPanelOptions({ copyright: 'Copyright © Sjmyuan' });

  // Ensure the app is in the Applications folder
  enforceMacOSAppLocation();

  if (is.development) {
    await prepareNext('./');
  } else {
    await prepareNext('./dist/renderer');
  }

  initializeTray();

  if (!app.isDefaultProtocolClient('sit')) {
    app.setAsDefaultProtocolClient('sit');
  }

  const mainWindow = await openMainWindow(false);
  initializeAppMenu(mainWindow);
  await openWorkerWindow();

  globalShortcut.register('CommandOrControl + Shift + 5', () => {
    hideMainWindow();
    openCropperWindow(false);
  });

  globalShortcut.register('CommandOrControl + Shift + 6', () => {
    hideMainWindow();
    openCropperWindow(true);
  });

  ipcMain.on('taking-screen-shot', (_, takeFullScreenShot: boolean) => {
    hideMainWindow();
    openCropperWindow(takeFullScreenShot);
  });

  ipcMain.on('took-screen-shot', (_, imageIndex) => {
    closeCropperWindow();
    editImageinMainWindow(imageIndex);
  });

  ipcMain.on('resize-main-window', (_, info) => {
    const [width, height] = info;
    resizeMainWindow(width, height);
  });

  ipcMain.on('worker-event', (_, event) => {
    sendWorkerEventToMainWindow(event);
  });

  checkForUpdates();
})();

app.on('activate', () => {
  openMainWindow(false);
});

app.on('will-quit', () => {
  closeCropperWindow();
  closePreferencesWindow();
  closeMainWindow();
  globalShortcut.unregisterAll();
});
