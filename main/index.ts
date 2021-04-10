import { app } from 'electron';
import { is, enforceMacOSAppLocation } from 'electron-util';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import prepareNext from 'electron-next';
import { initializeTray } from './tray';
import { openMainWindow } from './main';
import { openWorkerWindow } from './worker';
import { initializeAppMenu } from './menu';

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
    await prepareNext('./renderer');
  }

  initializeTray();

  if (!app.isDefaultProtocolClient('sit')) {
    app.setAsDefaultProtocolClient('sit');
  }

  //openBrowserWindow(false);
  const mainWindow = await openMainWindow(false);
  initializeAppMenu(mainWindow);
  await openWorkerWindow();

  checkForUpdates();
})();

app.on('window-all-closed', (event: { preventDefault: () => void }) => {
  app.dock.hide();
  event.preventDefault();
});
