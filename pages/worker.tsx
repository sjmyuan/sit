import React, { useEffect, useState } from 'react';
import * as O from 'fp-ts/Option';
import { ipcRenderer } from 'electron';
import { getVideo, takeShot } from '../renderer/utils/screen';

const Worker = () => {
  const [checkedPermission, setCheckedPermission] = useState<boolean>(false);

  useEffect(() => {
    ipcRenderer.on(
      'worker_prepare-for-cropper-window',
      async (
        _,
        {
          takeFullScreenShot,
          hasPermission,
        }: { takeFullScreenShot: boolean; hasPermission: boolean }
      ) => {
        const video = await getVideo();
        const buffer = await takeShot(O.none, video);

        // only ask for permission once
        if (hasPermission || checkedPermission) {
          ipcRenderer.send('main_open-cropper-window', {
            fullScreen: buffer,
            takeFullScreenShot,
          });
        }
        setCheckedPermission(true);
      }
    );
  }, [checkedPermission]);
  return <div>Worker</div>;
};

export default Worker;
