import React, { useEffect } from 'react';
import * as O from 'fp-ts/Option';
import { ipcRenderer } from 'electron';
import { getVideo, takeShot } from '../renderer/utils/screen';

const Worker = () => {
  useEffect(() => {
    ipcRenderer.on(
      'worker_prepare-for-cropper-window',
      async (_, { takeFullScreenShot }: { takeFullScreenShot: boolean }) => {
        const video = await getVideo();
        const buffer = await takeShot(O.none, video);
        ipcRenderer.send('main_open-cropper-window', {
          fullScreen: buffer,
          takeFullScreenShot,
        });
      }
    );
  }, []);
  return <div>Worker</div>;
};

export default Worker;
