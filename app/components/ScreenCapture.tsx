import React, { useEffect, useState } from 'react';
import { remote, desktopCapturer } from 'electron';
import { Box } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import * as O from 'fp-ts/Option';

const getVideo = async () => {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
  });

  const stream = await (navigator.mediaDevices as any).getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sources[0].id,
        minWidth: window.screen.width,
        maxWidth: window.screen.width,
        minHeight: window.screen.height,
        maxHeight: window.screen.height,
      },
    },
  });
  return stream;
};

type Point = {
  x: number;
  y: number;
};

const ScreenCapture = () => {
  const electronWindow = remote.getCurrentWindow();
  const history = useHistory();
  const [videoSrc, setVideoSrc] = useState<O.Option<MediaStream>>(O.none);
  const [startPoint, setStartPoint] = useState<O.Option<Point>>(O.none);
  const [mousePoint, setMousePoint] = useState<Point>({ x: 0, y: 0 });

  useEffect(() => {
    electronWindow.setWindowButtonVisibility(false);
    electronWindow.setOpacity(1);
    // getVideo()
    // .then((src) => setVideoSrc(O.some(src)))
    // .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    const handleUserKeyUp = (event: { ctrlKey: boolean; keyCode: number }) => {
      const { keyCode } = event;

      if (keyCode === 27) {
        electronWindow.setWindowButtonVisibility(true);
        electronWindow.setOpacity(1);
        history.goBack();
      }
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
        opacity: '1',
        backgroundColor: 'white',
      }}
      onMouseMove={({ clientX, clientY }) =>
        setMousePoint({ x: clientX, y: clientY })
      }
      onMouseDown={({ clientX, clientY }) =>
        setStartPoint(O.some({ x: clientX, y: clientY }))
      }
      onMouseUp={() => setStartPoint(O.none)}
    >
      {O.isSome(startPoint) ? (
        <Box>
          <Box // left
            sx={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              left: 0,
              width: Math.min(mousePoint.x, startPoint.value.x),
              backgroundColor: 'gray',
            }}
          />
          <Box // right
            sx={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              left: Math.max(mousePoint.x, startPoint.value.x),
              right: 0,
              backgroundColor: 'gray',
            }}
          />
          <Box // top
            sx={{
              position: 'fixed',
              left: 0,
              right: 0,
              top: 0,
              height: Math.min(mousePoint.y, startPoint.value.y),
              backgroundColor: 'gray',
            }}
          />
          <Box // bottom
            sx={{
              position: 'fixed',
              left: 0,
              right: 0,
              top: Math.max(mousePoint.y, startPoint.value.y),
              bottom: 0,
              backgroundColor: 'gray',
            }}
          />
        </Box>
      ) : (
        <Box>
          <Box // vertical
            sx={{
              position: 'fixed',
              width: 2,
              top: 0,
              bottom: 0,
              left: mousePoint.x,
              borderLeft: '1px dotted grey',
            }}
          />
          <Box // horizontal
            sx={{
              position: 'fixed',
              height: 2,
              left: 0,
              right: 0,
              top: mousePoint.y,
              borderTop: '1px dotted grey',
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ScreenCapture;
