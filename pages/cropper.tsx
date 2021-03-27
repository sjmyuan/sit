import React, { useEffect, useState } from 'react';
import { remote, desktopCapturer, clipboard, nativeImage } from 'electron';
import { Box } from '@material-ui/core';
import * as O from 'fp-ts/Option';
import jimp from 'jimp';

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

const overlayOpacity = 0.5;
const overlayColor = 'gray';

const CropperPage = (): React.ReactElement => {
  const [videoSrc, setVideoSrc] = useState<O.Option<MediaStream>>(O.none);
  const [startPoint, setStartPoint] = useState<O.Option<Point>>(O.none);
  const [mousePoint, setMousePoint] = useState<Point>({ x: 0, y: 0 });

  useEffect(() => {
    //const electronWindow = remote.getCurrentWindow();
    //electronWindow.setWindowButtonVisibility(false);
    //electronWindow.setOpacity(1);
    getVideo()
      .then((src) => setVideoSrc(O.some(src)))
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    //const electronWindow = remote.getCurrentWindow();
    const handleUserKeyUp = (event: { ctrlKey: boolean; keyCode: number }) => {
      const { keyCode } = event;

      if (keyCode === 27) {
        remote.getCurrentWindow().close();
        //electronWindow.setWindowButtonVisibility(true);
        //electronWindow.setOpacity(1);
      }
    };
    window.addEventListener('keyup', handleUserKeyUp);
    return () => {
      window.removeEventListener('keyup', handleUserKeyUp);
    };
  }, []);

  const takeShot = async (p1: Point, p2: Point, stream: MediaStream) => {
    const left = Math.min(p1.x, p2.x);
    const top = Math.min(p1.y, p2.y);
    const right = Math.max(p1.x, p2.x);
    const bottom = Math.max(p1.y, p2.y);

    const track = stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);
    const bitmap = await imageCapture.grabFrame();
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
      const imageBlob = await new Promise((resolve, reject) =>
        canvas.toBlob((blob) =>
          blob
            ? resolve(blob)
            : reject(new Error('Can not get blog from canvas'))
        )
      );
      const arrayBuffer = await (imageBlob as Blob).arrayBuffer();
      const Jimp = await jimp.read(Buffer.from(arrayBuffer));
      Jimp.crop(left, top, right - left, bottom - top);
      const buffer = await Jimp.getBufferAsync(jimp.MIME_PNG);
      clipboard.writeImage(nativeImage.createFromBuffer(buffer));
    }
  };

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
          takeShot(startPoint.value, mousePoint, videoSrc.value);
        }
        setStartPoint(O.none);
      }}
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
              backgroundColor: overlayColor,
              opacity: overlayOpacity,
            }}
          />
          <Box // right
            sx={{
              position: 'fixed',
              top: 0,
              bottom: 0,
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
