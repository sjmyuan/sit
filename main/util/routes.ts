import { app, BrowserWindow } from 'electron';
import { is } from 'electron-util';

// eslint-disable-next-line import/prefer-default-export
export const loadRoute = (
  win: BrowserWindow,
  routeName: string,
  { openDevTools }: { openDevTools: boolean } = { openDevTools: false }
): void => {
  if (is.development) {
    win.loadURL(`http://localhost:8000/${routeName}`);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(`${app.getAppPath()}/renderer/out/${routeName}.html`);
    if (openDevTools) {
      win.webContents.openDevTools({ mode: 'detach' });
    }
  }
};
