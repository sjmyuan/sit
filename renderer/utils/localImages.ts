import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import * as Eq from 'fp-ts/Eq';
import * as E from 'fp-ts/Either';
import { Do } from 'fp-ts-contrib';
import { constVoid, pipe } from 'fp-ts/lib/function';
import { db, ImageIndex, ImageState } from './AppDB';
import { AppErrorOr } from '../types';

const imageIndexEq = Eq.fromEquals(
  (x: ImageIndex, y: ImageIndex) => x.key === y.key
);

export const loadImageIndexes = (
  states: ImageState[]
): AppErrorOr<ImageIndex[]> =>
  TE.fromTask(() =>
    db.localIndex
      .where('state')
      .anyOf(...states)
      .toArray()
  );

export const addImageIndex = (imageIndexes: ImageIndex[]): AppErrorOr<void> =>
  pipe(
    TE.tryCatch<Error, unknown>(
      () => db.localIndex.bulkPut(imageIndexes),
      E.toError
    ),
    TE.map(constVoid)
  );

export const cacheImage = (
  key: string,
  image: Blob
): AppErrorOr<ImageIndex> => {
  const imageIndex: ImageIndex = {
    key,
    lastModified: Date.now(),
    state: 'ADDING',
  };
  return pipe(
    addImageIndex([imageIndex]),
    TE.chain(() =>
      TE.tryCatch<Error, unknown>(() => db.cache.put({ key, image }), E.toError)
    ),
    TE.map(() => imageIndex)
  );
};

export const updateImageState = (
  key: string,
  state: ImageState
): AppErrorOr<void> =>
  pipe(
    TE.tryCatch<Error, unknown>(
      () =>
        db.localIndex
          .update(key, {
            state,
          })
          .then(() => {
            // eslint-disable-next-line promise/always-return
            if (state === 'DELETED') {
              db.cache.delete(key);
            }
          }),
      E.toError
    ),
    TE.map(constVoid)
  );

export const getImageCacheUrl = (key: string): AppErrorOr<string> =>
  TE.tryCatch(
    () =>
      db.cache
        .get(key)
        .then((imageCache) =>
          imageCache
            ? Promise.resolve(URL.createObjectURL(imageCache.image))
            : Promise.reject('null image cache')
        ),
    E.toError
  );

export const getImageCache = (key: string): AppErrorOr<Blob> =>
  TE.fromTask(() =>
    db.cache
      .get(key)
      .then((imageCache) =>
        imageCache
          ? Promise.resolve(imageCache.image)
          : Promise.reject('null image cache')
      )
  );

export const syncImageCaches = (
  remoteImages: ImageIndex[]
): AppErrorOr<void> => {
  return Do.Do(TE.Monad)
    .bind('localImages', loadImageIndexes(['ADDED', 'DELETING']))
    .letL('deletedImageInRemote', ({ localImages }) =>
      pipe(localImages, A.difference(imageIndexEq)(remoteImages))
    )
    .letL('addedImageInRemote', ({ localImages }) =>
      pipe(remoteImages, A.difference(imageIndexEq)(localImages))
    )
    .doL(({ addedImageInRemote }) =>
      pipe(
        addedImageInRemote,
        A.traverse(TE.Monad)((image) => addImageIndex([image]))
      )
    )
    .doL(({ deletedImageInRemote }) =>
      pipe(
        deletedImageInRemote,
        A.traverse(TE.Monad)((image) => updateImageState(image.key, 'DELETED'))
      )
    )
    .return(constVoid);
};
