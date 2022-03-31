import { screen, BrowserWindow, Display } from 'electron';
import { loadRoute } from './util/routes';

let cropperWindow: BrowserWindow | null = null;

const openCropper = (
  display: Display,
  takeFullScreenShot: boolean,
  fullScreen: Buffer
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
    transparent: false,
    show: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  loadRoute(cropper, 'cropper');

  cropper.setAlwaysOnTop(true, 'screen-saver', 1);

  cropper.webContents.on('did-finish-load', () => {
    console.log('sending image....');
    cropper.webContents.send('cropper-config', {
      takeFullScreenShot,
      fullScreen,
    });
  });

  cropper.on('closed', () => {
    cropper.destroy();
  });

  return cropper;
};

const openCropperWindow = async (
  takeFullScreenShot: boolean,
  fullScreen: Buffer
): Promise<void> => {
  if (cropperWindow) cropperWindow.destroy();

  const activeDisplay = screen.getDisplayNearestPoint(
    screen.getCursorScreenPoint()
  );

  console.log('starting cropper....');

  // const video = await getVideo();
  // const buffer = await takeShot(O.none, video);

  // console.log('starting window....');

  cropperWindow = openCropper(activeDisplay, takeFullScreenShot, fullScreen);

  if (!takeFullScreenShot) {
    cropperWindow.focus();
  }
};

const closeCropperWindow = (): void => {
  if (cropperWindow) cropperWindow.destroy();
};

export { openCropperWindow, closeCropperWindow };
