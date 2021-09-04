import { desktopCapturer } from 'electron';
import jimp from 'jimp';
import * as O from 'fp-ts/Option';
import { Point } from '../store-unstated';

export const getVideo = async (): Promise<MediaStream> => {
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

export const takeShot = async (
  range: O.Option<[Point, Point]>,
  stream: MediaStream
): Promise<Buffer> => {
  const track = stream.getVideoTracks()[0];
  const imageCapture = new ImageCapture(track);
  const bitmap = await imageCapture.grabFrame();
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  let left = 0;
  let top = 0;
  let right = bitmap.width;
  let bottom = bitmap.height;

  if (O.isSome(range)) {
    const [p1, p2] = range.value;
    left = Math.min(p1.x, p2.x);
    top = Math.min(p1.y, p2.y);
    right = Math.max(p1.x, p2.x);
    bottom = Math.max(p1.y, p2.y);
  }

  const context = canvas.getContext('2d');
  if (context) {
    context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
    const imageBlob = await new Promise((resolve, reject) =>
      canvas.toBlob((blob) =>
        blob ? resolve(blob) : reject(new Error('Can not get blog from canvas'))
      )
    );
    const arrayBuffer = await (imageBlob as Blob).arrayBuffer();
    const Jimp = await jimp.read(Buffer.from(arrayBuffer));
    Jimp.crop(left, top, right - left, bottom - top);
    const buffer = await Jimp.getBufferAsync(jimp.MIME_PNG);

    return buffer;
  }

  return Promise.reject<Buffer>(new Error("Can't get the canvas context"));
};
