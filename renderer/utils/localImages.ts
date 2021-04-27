import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import * as Eq from 'fp-ts/Eq';
import { Do } from 'fp-ts-contrib';
import { constVoid, pipe } from 'fp-ts/lib/function';
import { db, ImageIndex, ImageState } from './AppDB';
import { AppErrorOr } from '../types';

const imageIndexEq = Eq.fromEquals(
  (x: ImageIndex, y: ImageIndex) => x.key === y.key
);

export const loadImages = (states: ImageState[]): AppErrorOr<ImageIndex[]> =>
  TE.fromTask(() =>
    db.localIndex
      .where('state')
      .anyOf(...states)
      .toArray()
  );

export const syncImages = (remoteImages: ImageIndex[]): AppErrorOr<void> => {
  return Do.Do(TE.taskEither)
    .bind('localImages', loadImages(['ADDED']))
    .letL('deletedImageInRemote', ({ localImages }) =>
      pipe(localImages, A.difference(imageIndexEq)(remoteImages))
    )
    .letL('addedImageInRemote', ({ localImages }) =>
      pipe(remoteImages, A.difference(imageIndexEq)(localImages))
    )
    .doL(({ addedImageInRemote }) =>
      pipe(
        addedImageInRemote,
        A.traverse(TE.taskEither)((image) => addImageIndex(image))
      )
    )
    .doL(({ deletedImageInRemote }) =>
      pipe(
        deletedImageInRemote,
        A.traverse(TE.taskEither)((image) => deleteImage(image.key))
      )
    )
    .return(constVoid);
};

export const addImageIndex = (imageIndex: ImageIndex): AppErrorOr<void> =>
  pipe(
    TE.fromTask<Error, unknown>(() => db.localIndex.add(imageIndex)),
    TE.map(constVoid)
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

export const updateImage = (key: string, image: Blob): AppErrorOr<void> =>
  pipe(
    TE.fromTask<Error, unknown>(() =>
      db.localIndex
        .update(key, { lastModified: Date.now(), state: 'ADDING' })
        .then(() => db.cache.update(key, { image }))
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
