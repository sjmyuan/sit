import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { remote, ipcRenderer } from 'electron';
import { Box } from '@mui/material';
import * as O from 'fp-ts/Option';
import { constVoid, pipe } from 'fp-ts/lib/function';
import { cacheImage } from '../renderer/utils/localImages';
import { TE } from '../renderer/types';
import { takeShotFromImage } from '../renderer/utils/screen';
import { css } from '@emotion/css';

type Point = {
  x: number;
  y: number;
};

const overlayOpacity = 0.5;
const overlayColor = 'gray';

const cacheImageBlob = async (blob: Blob) => {
  const key = `screenshot-${Date.now()}.png`;

  await pipe(
    cacheImage(key, blob),
    TE.map((index) => ipcRenderer.send('took-screen-shot', index))
  )();
};

const CropperPage: NextPage = () => {
  const [startPoint, setStartPoint] = useState<O.Option<Point>>(O.none);
  const [mousePoint, setMousePoint] = useState<Point>({ x: 0, y: 0 });
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState<
    O.Option<[string, Blob]>
  >(O.none);

  useEffect(() => {
    ipcRenderer.on(
      'cropper-config',
      (
        _,
        {
          takeFullScreenShot,
          fullScreen,
        }: { takeFullScreenShot: boolean; fullScreen: Buffer }
      ) => {
        const blob = new Blob([fullScreen]);
        if (takeFullScreenShot) {
          cacheImageBlob(blob);
        } else {
          const url = URL.createObjectURL(blob);
          setFullScreenImageUrl(O.some([url, blob]));
        }
        return constVoid();
      }
    );

    const handleUserKeyUp = (_: { ctrlKey: boolean; keyCode: number }) => {
      remote.getCurrentWindow().close();
    };
    window.addEventListener('keyup', handleUserKeyUp);
    return () => {
      window.removeEventListener('keyup', handleUserKeyUp);
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundImage: `url(${
          O.isSome(fullScreenImageUrl) ? fullScreenImageUrl.value[0] : ''
        })`,
      }}
      onMouseMove={({ clientX, clientY }) =>
        setMousePoint({ x: clientX, y: clientY })
      }
      onMouseDown={({ clientX, clientY }) =>
        setStartPoint(O.some({ x: clientX, y: clientY }))
      }
      onMouseUp={async () => {
        if (O.isSome(fullScreenImageUrl) && O.isSome(startPoint)) {
          const imageBlob = await takeShotFromImage(
            [startPoint.value, mousePoint],
            fullScreenImageUrl.value[1]
          );
          await cacheImageBlob(imageBlob);
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
    </Box>
  );
};

export default CropperPage;
