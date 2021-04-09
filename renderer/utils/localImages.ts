import { db, ImageIndex } from './AppDB';
export const loadImages = (states: string[]): Promise<ImageIndex[]> =>
  db.localIndex
    .where('state')
    .anyOf(...states)
    .toArray();

export const uploadImage = async (key: string, image: Blob): Promise<void> => {
  await db.localIndex.add({
    key: key,
    lastModified: Date.now(),
    state: 'ADDING',
  });

  await db.cache.add({ key, image });
};

export const deleteImage = async (key: string): Promise<void> => {
  await db.localIndex.update(key, {
    state: 'DELETING',
  });

  await db.cache.delete(key);
};

export const getImageUrl = async (key: string): Promise<string> => {
  const imageCache = await db.cache.get(key);
  return URL.createObjectURL(imageCache.image);
};

export const getImageCache = async (key: string): Promise<Blob> => {
  const imageCache = await db.cache.get(key);
  return imageCache.image;
};
