import { app } from 'electron';
import { is, enforceMacOSAppLocation } from 'electron-util';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import prepareNext from 'electron-next';
import { initializeTray } from './tray';
import { openBrowserWindow } from './browser';

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

  app.dock.hide();
  app.setAboutPanelOptions({ copyright: 'Copyright © Sjmyuan' });

  // Ensure the app is in the Applications folder
  enforceMacOSAppLocation();

  await prepareNext('./renderer');

  initializeTray();

  if (!app.isDefaultProtocolClient('sit')) {
    app.setAsDefaultProtocolClient('sit');
  }

  openBrowserWindow(false);

  checkForUpdates();
})();

app.on('window-all-closed', (event: { preventDefault: () => void }) => {
  app.dock.hide();
  event.preventDefault();
});
