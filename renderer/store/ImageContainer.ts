import { useState } from 'react';
import { pipe, constVoid } from 'fp-ts/lib/function';
import { ImageIndex } from '../utils/AppDB';
import { loadImages, addImageIndex, uploadImage } from '../utils/localImages';
import { TE, A, Ord, AppErrorOr, O } from '../types';
import { InfoContainer } from '../store-unstated';
import { createContainer } from 'unstated-next';

function useImages() {
  const [images, setImages] = useState<ImageIndex[]>([]);

  const infoState = InfoContainer.useContainer();

  const loadAllImageIndexes = () => {
    infoState.runTask('load images')(
      pipe(
        loadImages(['ADDING', 'ADDED']),
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
        uploadImage(key, content),
        TE.chain((index) => addImageIndexes([index])),
        TE.map(constVoid)
      )
    );
  };

  return {
    images,
    loadAllImages: loadAllImageIndexes,
    addImageIndexes,
    addImage,
  };
}

export const ImageContainer = createContainer(useImages);
