import { screen, BrowserWindow, Display } from 'electron';
import { loadRoute } from './util/routes';

let cropperWindow: BrowserWindow | null = null;

const openCropper = (
  display: Display,
  takeFullScreenShot: boolean
): BrowserWindow => {
  const { bounds } = display;
  const { x, y, width, height } = bounds;
  const cropper = new BrowserWindow({
    x,
    y,
    width,
    height,
    hasShadow: false,
    enableLargerThanScreen: true,
    resizable: false,
    movable: false,
    frame: false,
    transparent: true,
    show: !takeFullScreenShot,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  loadRoute(cropper, 'cropper');

  if (!takeFullScreenShot) {
    cropper.setAlwaysOnTop(true, 'screen-saver', 1);
  }

  cropper.webContents.on('did-finish-load', () => {
    cropper.webContents.send('cropper-type', takeFullScreenShot);
  });

  cropper.on('closed', () => {
    cropper.destroy();
  });

  return cropper;
};

const openCropperWindow = async (
  takeFullScreenShot: boolean
): Promise<void> => {
  if (cropperWindow) cropperWindow.destroy();

  const activeDisplay = screen.getDisplayNearestPoint(
    screen.getCursorScreenPoint()
  );

  cropperWindow = openCropper(activeDisplay, takeFullScreenShot);

  if (!takeFullScreenShot) {
    cropperWindow.focus();
  }
};

const closeCropperWindow = (): void => {
  if (cropperWindow) cropperWindow.destroy();
};

export { openCropperWindow, closeCropperWindow };
