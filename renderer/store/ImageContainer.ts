import { useState } from 'react';
import { pipe, constVoid } from 'fp-ts/lib/function';
import { createContainer } from 'unstated-next';
import { ImageIndex } from '../utils/AppDB';
import {
  loadImageIndexes,
  addImageIndex,
  cacheImage,
  updateImageState,
  getImageCacheUrl,
} from '../utils/localImages';
import { TE, A, Ord, AppErrorOr } from '../types';
import { InfoContainer } from './InfoContainer';

function useImages() {
  const [images, setImages] = useState<ImageIndex[]>([]);

  const infoState = InfoContainer.useContainer();

  const loadAllImageIndexes = () => {
    return infoState.runTask('load images')(
      pipe(
        loadImageIndexes(['ADDING', 'ADDED']),
        TE.map(
          A.sortBy([
            Ord.fromCompare<ImageIndex>((x: ImageIndex, y: ImageIndex) =>
              x.lastModified > y.lastModified ? -1 : 1
            ),
          ])
        ),
        TE.map(setImages)
      )
    );
  };

  const addImageIndexes = (newImages: ImageIndex[]): AppErrorOr<void> => {
    return infoState.runTask('add image')(
      pipe(
        addImageIndex(newImages),
        TE.map(() => setImages([...newImages, ...images])),
        TE.map(constVoid)
      )
    );
  };

  const addImage = (key: string, content: Blob): AppErrorOr<void> => {
    return infoState.runTask('add image')(
      pipe(
        cacheImage(key, content),
        TE.map((index) => setImages([index, ...images])),
        TE.map(constVoid)
      )
    );
  };

  const deleteImage = (key: string): AppErrorOr<void> => {
    return infoState.runTask('delete image')(
      pipe(
        updateImageState(key, 'DELETING'),
        TE.map(() => setImages(images.filter((x) => x.key !== key))),
        TE.map(constVoid)
      )
    );
  };

  const getImageUrl = (key: string): AppErrorOr<string> => {
    return getImageCacheUrl(key);
  };

  return {
    images,
    setImages,
    loadAllImageIndexes,
    addImageIndexes,
    addImage,
    deleteImage,
    getImageUrl,
  };
}

// eslint-disable-next-line import/prefer-default-export
export const ImageContainer = createContainer(useImages);
