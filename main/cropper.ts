import { screen, BrowserWindow, Display } from 'electron';
import { loadRoute } from './util/routes';

let cropperWindow: BrowserWindow | null = null;

const openCropper = (
  display: Display,
  activeDisplayId: number
): BrowserWindow => {
  const { id, bounds } = display;
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
    show: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  loadRoute(cropper, 'cropper');

  cropper.setAlwaysOnTop(true, 'screen-saver', 1);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  cropper.webContents.on('did-finish-load', () => {
    const isActive = activeDisplayId === id;
    const displayInfo = {
      isActive,
      id,
      x,
      y,
      width,
      height,
    };
    cropper.webContents.send('display', displayInfo);
  });

  cropper.on('closed', () => {
    cropper.destroy();
  });

  return cropper;
};

const openCropperWindow = async (): Promise<void> => {
  if (cropperWindow) cropperWindow.destroy();

  const activeDisplay = screen.getDisplayNearestPoint(
    screen.getCursorScreenPoint()
  );

  cropperWindow = openCropper(activeDisplay, activeDisplay.id);

  cropperWindow.focus();
};

const closeCropperWindow = (): void => {
  if (cropperWindow) cropperWindow.destroy();
};

export { openCropperWindow, closeCropperWindow };
