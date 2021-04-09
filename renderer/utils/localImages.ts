import * as TE from 'fp-ts/TaskEither';
import { constVoid, pipe } from 'fp-ts/lib/function';
import { db, ImageIndex } from './AppDB';
import { AppErrorOr } from '../types';
export const loadImages = (states: string[]): AppErrorOr<ImageIndex[]> =>
  TE.fromTask(() =>
    db.localIndex
      .where('state')
      .anyOf(...states)
      .toArray()
  );

export const uploadImage = (key: string, image: Blob): AppErrorOr<void> =>
  pipe(
    TE.fromTask<Error, unknown>(() =>
      db.localIndex
        .add({
          key,
          lastModified: Date.now(),
          state: 'ADDING',
        })
        .then(() => db.cache.add({ key, image }))
    ),
    TE.map(constVoid)
  );
export const deleteImage = (key: string): AppErrorOr<void> =>
  pipe(
    TE.fromTask<Error, unknown>(() =>
      db.localIndex
        .update(key, {
          state: 'DELETING',
        })
        .then(() => db.cache.delete(key))
    ),
    TE.map(constVoid)
  );

export const getImageUrl = (key: string): AppErrorOr<string> =>
  TE.fromTask(() =>
    db.cache
      .get(key)
      .then((imageCache) => URL.createObjectURL(imageCache.image))
  );

export const getImageCache = (key: string): AppErrorOr<Blob> =>
  TE.fromTask(() => db.cache.get(key).then((imageCache) => imageCache.image));
