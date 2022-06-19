import {
  app,
  Menu,
  shell,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';
import { is } from 'electron-util';

import { hideMainWindow } from './main';
import { prepareForCropperWindow } from './worker';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

const setupDevelopmentEnvironment = (mainWindow: BrowserWindow): void => {
  mainWindow.webContents.on('context-menu', (_, props) => {
    const { x, y } = props;

    Menu.buildFromTemplate([
      {
        label: 'Inspect element',
        click: () => {
          mainWindow.webContents.inspectElement(x, y);
        },
      },
    ]).popup({ window: mainWindow });
  });
};
const buildDarwinTemplate = (
  mainWindow: BrowserWindow
): MenuItemConstructorOptions[] => {
  const subMenuAbout: DarwinMenuItemConstructorOptions = {
    label: 'Sit',
    submenu: [
      {
        label: 'About Sit',
        selector: 'orderFrontStandardAboutPanel:',
      },
      { type: 'separator' },
      { label: 'Services', submenu: [] },
      { type: 'separator' },
      {
        label: 'Hide Sit',
        accelerator: 'Command+H',
        selector: 'hide:',
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        selector: 'hideOtherApplications:',
      },
      { label: 'Show All', selector: 'unhideAllApplications:' },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => {
          app.quit();
        },
      },
    ],
  };
  const subMenuEdit: DarwinMenuItemConstructorOptions = {
    label: 'Edit',
    submenu: [
      {
        label: 'Screen Shot',
        accelerator: 'Shift+Command+5',
        click: async () => {
          hideMainWindow();
          await prepareForCropperWindow(false);
        },
      },
      {
        label: 'Full Screen Shot',
        accelerator: 'Shift+Command+6',
        click: async () => {
          hideMainWindow();
          await prepareForCropperWindow(true);
        },
      },
      {
        label: 'Screen Shot Without Hiding Window',
        accelerator: 'Shift+Command+7',
        click: async () => {
          await prepareForCropperWindow(false);
        },
      },
      {
        label: 'Full Screen Shot Without Hiding Window',
        accelerator: 'Shift+Command+6',
        click: async () => {
          await prepareForCropperWindow(true);
        },
      },
      { type: 'separator' },
      { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
      { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
    ],
  };
  const subMenuViewDev: MenuItemConstructorOptions = {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'Command+R',
        click: () => {
          mainWindow.webContents.reload();
        },
      },
      {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click: () => {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        },
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Command+I',
        click: () => {
          mainWindow.webContents.toggleDevTools();
        },
      },
      {
        label: 'Refresh page',
        click: () => {
          mainWindow.reload();
        },
      },
    ],
  };
  const subMenuViewProd: MenuItemConstructorOptions = {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click: () => {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        },
      },
    ],
  };
  const subMenuWindow: DarwinMenuItemConstructorOptions = {
    label: 'Window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'Command+M',
        selector: 'performMiniaturize:',
      },
      { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
      { type: 'separator' },
      { label: 'Bring All to Front', selector: 'arrangeInFront:' },
    ],
  };
  const subMenuHelp: MenuItemConstructorOptions = {
    label: 'Help',
    submenu: [
      {
        label: 'Documentation',
        click() {
          shell.openExternal(
            'https://github.com/sjmyuan/sit/tree/master/docs#readme'
          );
        },
      },
      {
        label: 'Search Issues',
        click() {
          shell.openExternal('https://github.com/sjmyuan/sit/issues');
        },
      },
    ],
  };

  const subMenuView = is.development ? subMenuViewDev : subMenuViewProd;
  const subMenuView1 = is.development ? subMenuViewDev : subMenuView;

  return [subMenuAbout, subMenuEdit, subMenuView1, subMenuWindow, subMenuHelp];
};
const buildDefaultTemplate = (
  mainWindow: BrowserWindow
): MenuItemConstructorOptions[] => {
  const templateDefault = [
    {
      label: '&File',
      submenu: [
        {
          label: '&Close',
          accelerator: 'Ctrl+W',
          click: () => {
            mainWindow.close();
          },
        },
      ],
    },
    {
      label: '&View',
      submenu:
        process.env.NODE_ENV === 'development'
          ? [
              {
                label: '&Reload',
                accelerator: 'Ctrl+R',
                click: () => {
                  mainWindow.webContents.reload();
                },
              },
              {
                label: 'Toggle &Full Screen',
                accelerator: 'F11',
                click: () => {
                  mainWindow.setFullScreen(!mainWindow.isFullScreen());
                },
              },
              {
                label: 'Toggle &Developer Tools',
                accelerator: 'Alt+Ctrl+I',
                click: () => {
                  mainWindow.webContents.toggleDevTools();
                },
              },
            ]
          : [
              {
                label: 'Toggle &Full Screen',
                accelerator: 'F11',
                click: () => {
                  mainWindow.setFullScreen(!mainWindow.isFullScreen());
                },
              },
            ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click() {
            shell.openExternal(
              'https://github.com/sjmyuan/sit/tree/master/docs#readme'
            );
          },
        },
        {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/sjmyuan/sit/issues');
          },
        },
      ],
    },
  ];

  return templateDefault;
};

export const initializeAppMenu = (mainWindow: BrowserWindow): Menu => {
  if (process.env.NODE_ENV === 'development') {
    setupDevelopmentEnvironment(mainWindow);
  }

  const template =
    process.platform === 'darwin'
      ? buildDarwinTemplate(mainWindow)
      : buildDefaultTemplate(mainWindow);

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  return menu;
};
export const getTrayMenu = (): Menu => {
  const template = [
    {
      label: 'Screen Shot',
      accelerator: 'Shift+Command+5',
      click: async () => {
        hideMainWindow();
        await prepareForCropperWindow(false);
      },
    },
    {
      label: 'Full Screen Shot',
      accelerator: 'Shift+Command+6',
      click: async () => {
        hideMainWindow();
        await prepareForCropperWindow(true);
      },
    },
    {
      label: 'Screen Shot Without Hiding Window',
      accelerator: 'Shift+Command+7',
      click: async () => {
        await prepareForCropperWindow(false);
      },
    },
    {
      label: 'Full Screen Shot Without Hiding Window',
      accelerator: 'Shift+Command+8',
      click: async () => {
        await prepareForCropperWindow(true);
      },
    },
    {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: () => {
        app.quit();
      },
    },
  ];
  return Menu.buildFromTemplate(template);
};
