import { screen, BrowserWindow, Display } from 'electron';
import { loadRoute } from './util/routes';

/**
 * open cover with transparent mode and hide mouse cursor
 * take the full screen short
 * close cover and open cropper, set background image to the screen short, then show the mouse cursor
 * crop
 */

let coverWindow: BrowserWindow | null = null;

const openCover = (display: Display, callback: () => void): BrowserWindow => {
  const { bounds } = display;
  const { x, y, width, height } = bounds;
  const cover = new BrowserWindow({
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
      contextIsolation: false,
    },
  });

  loadRoute(cover, 'cover');

  cover.setAlwaysOnTop(true, 'screen-saver', 1);

  // cover.webContents.on('did-finish-load', () => {
  //   cover.focus();
  //   callback();
  // });

  cover.webContents.on('dom-ready', () => {
    let css = '* { cursor: none !important; }';
    cover.webContents.insertCSS(css);
    cover.focus();
    cover.focusOnWebView();
    cover.moveTop();
    callback();
  });
  cover.on('closed', () => {
    cover.destroy();
  });

  return cover;
};

const openCoverWindow = async (callback: () => void): Promise<void> => {
  if (coverWindow) coverWindow.destroy();

  const activeDisplay = screen.getDisplayNearestPoint(
    screen.getCursorScreenPoint()
  );

  coverWindow = openCover(activeDisplay, callback);
};

const closeCoverWindow = (): void => {
  if (coverWindow) coverWindow.destroy();
};

export { openCoverWindow, closeCoverWindow };
