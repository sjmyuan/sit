import React, { useEffect, useState } from 'react';
import { remote, ipcRenderer } from 'electron';
import { Box } from '@material-ui/core';
import * as O from 'fp-ts/Option';
import { constVoid, pipe } from 'fp-ts/lib/function';
import { cacheImage } from '../renderer/utils/localImages';
import { TE, T } from '../renderer/types';
import { getVideo, takeShot } from '../renderer/utils/screen';

type Point = {
  x: number;
  y: number;
};

const overlayOpacity = 0.5;
const overlayColor = 'gray';

const takeShotAndCacheImage = async (
  range: O.Option<[Point, Point]>,
  stream: MediaStream
) => {
  const buffer = await takeShot(range, stream);

  const key = `screenshot-${Date.now()}.png`;

  await pipe(
    cacheImage(key, new Blob([buffer])),
    TE.map((index) => ipcRenderer.send('took-screen-shot', index))
  )();
};

const CropperPage = (): React.ReactElement => {
  const [videoSrc, setVideoSrc] = useState<O.Option<MediaStream>>(O.none);
  const [startPoint, setStartPoint] = useState<O.Option<Point>>(O.none);
  const [mousePoint, setMousePoint] = useState<Point>({ x: 0, y: 0 });

  useEffect(() => {
    ipcRenderer.on('cropper-type', (_, takeFullScreenShot: boolean) => {
      if (takeFullScreenShot) {
        getVideo()
          .then((src) => takeShotAndCacheImage(O.none, src))
          .catch((e) => console.log(e));
      } else {
        getVideo()
          .then((src) => setVideoSrc(O.some(src)))
          .catch((e) => console.log(e));

        const handleUserKeyUp = (event: {
          ctrlKey: boolean;
          keyCode: number;
        }) => {
          const { keyCode } = event;

          if (keyCode === 27) {
            remote.getCurrentWindow().close();
          }
        };
        window.addEventListener('keyup', handleUserKeyUp);
        return () => {
          window.removeEventListener('keyup', handleUserKeyUp);
        };
      }
      return constVoid();
    });
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
      }}
      onMouseMove={({ clientX, clientY }) =>
        setMousePoint({ x: clientX, y: clientY })
      }
      onMouseDown={({ clientX, clientY }) =>
        setStartPoint(O.some({ x: clientX, y: clientY }))
      }
      onMouseUp={() => {
        if (O.isSome(videoSrc) && O.isSome(startPoint)) {
          takeShotAndCacheImage(
            O.some([startPoint.value, mousePoint]),
            videoSrc.value
          );
        }
        setStartPoint(O.none);
      }}
    >
      {O.isSome(startPoint) ? (
        <Box>
          <Box // left
            sx={{
              position: 'fixed',
              top: Math.min(mousePoint.y, startPoint.value.y),
              height: Math.abs(mousePoint.y - startPoint.value.y),
              left: 0,
              width: Math.min(mousePoint.x, startPoint.value.x),
              backgroundColor: overlayColor,
              opacity: overlayOpacity,
            }}
          />
          <Box // right
            sx={{
              position: 'fixed',
              top: Math.min(mousePoint.y, startPoint.value.y),
              height: Math.abs(mousePoint.y - startPoint.value.y),
              left: Math.max(mousePoint.x, startPoint.value.x),
              right: 0,
              backgroundColor: overlayColor,
              opacity: overlayOpacity,
            }}
          />
          <Box // top
            sx={{
              position: 'fixed',
              left: 0,
              right: 0,
              top: 0,
              height: Math.min(mousePoint.y, startPoint.value.y),
              backgroundColor: overlayColor,
              opacity: overlayOpacity,
            }}
          />
          <Box // bottom
            sx={{
              position: 'fixed',
              left: 0,
              right: 0,
              top: Math.max(mousePoint.y, startPoint.value.y),
              bottom: 0,
              backgroundColor: overlayColor,
              opacity: overlayOpacity,
            }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        >
          <Box // vertical
            sx={{
              position: 'fixed',
              width: 2,
              top: 0,
              bottom: 0,
              left: mousePoint.x,
              borderLeft: '1px dotted white',
            }}
          />
          <Box // horizontal
            sx={{
              position: 'fixed',
              height: 2,
              left: 0,
              right: 0,
              top: mousePoint.y,
              borderTop: '1px dotted white',
            }}
          />
        </Box>
      )}

      <video
        muted
        hidden
        ref={(ref) => {
          if (ref && O.isSome(videoSrc)) {
            ref.srcObject = videoSrc.value;
          }
        }}
      />
    </Box>
  );
};

export default CropperPage;
