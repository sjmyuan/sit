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

export const loadImages = (states: ImageState[]): AppErrorOr<ImageIndex[]> =>
  TE.fromTask(() =>
    db.localIndex
      .where('state')
      .anyOf(...states)
      .toArray()
  );

export const addImageIndex = (imageIndexs: ImageIndex[]): AppErrorOr<void> =>
  pipe(
    TE.tryCatch<Error, unknown>(
      () => db.localIndex.bulkPut(imageIndexs),
      E.toError
    ),
    TE.map(constVoid)
  );

export const uploadImage = (
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
            state: state,
          })
          .then(() => {
            if (state === 'DELETED') {
              db.cache.delete(key);
            }
          }),
      E.toError
    ),
    TE.map(constVoid)
  );

export const getImageUrl = (key: string): AppErrorOr<string> =>
  TE.tryCatch(
    () =>
      db.cache
        .get(key)
        .then((imageCache) => URL.createObjectURL(imageCache.image)),
    E.toError
  );

export const getImageCache = (key: string): AppErrorOr<Blob> =>
  TE.fromTask(() => db.cache.get(key).then((imageCache) => imageCache.image));

export const syncImages = (remoteImages: ImageIndex[]): AppErrorOr<void> => {
  return Do.Do(TE.taskEither)
    .bind('localImages', loadImages(['ADDED', 'DELETING']))
    .letL('deletedImageInRemote', ({ localImages }) =>
      pipe(localImages, A.difference(imageIndexEq)(remoteImages))
    )
    .letL('addedImageInRemote', ({ localImages }) =>
      pipe(remoteImages, A.difference(imageIndexEq)(localImages))
    )
    .doL(({ addedImageInRemote }) =>
      pipe(
        addedImageInRemote,
        A.traverse(TE.taskEither)((image) => addImageIndex([image]))
      )
    )
    .doL(({ deletedImageInRemote }) =>
      pipe(
        deletedImageInRemote,
        A.traverse(TE.taskEither)((image) =>
          updateImageState(image.key, 'DELETED')
        )
      )
    )
    .return(constVoid);
};
