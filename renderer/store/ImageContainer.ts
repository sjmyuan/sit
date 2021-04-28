import { useState } from 'react';
import { ImageIndex } from '../utils/AppDB';
import { loadImages } from '../utils/localImages';
import { TE, A, Ord } from '../types';
import { pipe } from 'fp-ts/lib/function';
import { createContext } from 'vm';

function useImages() {
  const [images, setImages] = useState<ImageIndex[]>([]);

  const loadAllImages = () => {
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
    );
  };

  const addImages = (newImages: ImageIndex[]) => {
    setImages([...newImages, ...images]);
  };

  return {
    images,
    loadAllImages,
    addImages,
  };
}

export const ImageContainer = createContext(useImages);
