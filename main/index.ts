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
  editImageInMainWindow,
  sendWorkerEventToMainWindow,
} from './main';
import { openWorkerWindow, prepareForCropperWindow } from './worker';
import { initializeAppMenu } from './menu';
import {
  closeCropperWindow,
  openCropperWindow,
  showCropperWindow,
} from './cropper';

app.commandLine.appendSwitch('--enable-features', 'OverlayScrollbar');

// const checkForUpdates = async (): Promise<void> => {
//   if (is.development) {
//     return;
//   }

//   try {
//     await autoUpdater.checkForUpdates();
//   } catch (error) {
//     autoUpdater.logger?.error(error);
//   }

//   autoUpdater.logger = log;

//   setInterval(checkForUpdates, 24 * 60 * 60 * 1000);
// };

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

  globalShortcut.register('CommandOrControl+Shift+5', () => {
    hideMainWindow();
    prepareForCropperWindow(false);
  });

  globalShortcut.register('CommandOrControl+Shift+6', () => {
    hideMainWindow();
    prepareForCropperWindow(true);
  });

  ipcMain.on('taking-screen-shot', (_, takeFullScreenShot: boolean) => {
    hideMainWindow();
    prepareForCropperWindow(takeFullScreenShot);
  });

  ipcMain.on(
    'main_open-cropper-window',
    (
      _,
      {
        fullScreen,
        takeFullScreenShot,
      }: { fullScreen: Buffer; takeFullScreenShot: boolean }
    ) => {
      hideMainWindow();
      openCropperWindow(takeFullScreenShot, fullScreen);
    }
  );

  ipcMain.on('main_show-cropper-window', () => {
    showCropperWindow();
  });

  ipcMain.on('main_close-cropper-window', () => {
    closeCropperWindow();
    openMainWindow(false);
  });

  ipcMain.on('took-screen-shot', (_, imageIndex) => {
    closeCropperWindow();
    editImageInMainWindow(imageIndex);
  });

  ipcMain.on('worker-event', (_, event) => {
    sendWorkerEventToMainWindow(event);
  });

  // checkForUpdates();
})();

app.on('activate', () => {
  openMainWindow(false);
});

app.on('will-quit', () => {
  closeCropperWindow();
  closeMainWindow();
  globalShortcut.unregisterAll();
});
