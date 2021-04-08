import { db, ImageIndex } from './AppDB';
export const loadImages = (): Promise<ImageIndex[]> =>
  db.index.where('state').anyOf('ADDING', 'ADDED').toArray();

export const uploadImage = async (key: string, image: Blob): Promise<void> => {
  await db.index.add({
    key: key,
    lastModified: Date.now(),
    state: 'ADDING',
  });

  await db.cache.add({ key, image });
};

export const deleteImage = async (key: string): Promise<void> => {
  await db.index.update(key, {
    state: 'DELETING',
  });

  await db.cache.delete(key);
};

export const getImageUrl = async (key: string): Promise<string> => {
  const imageCache = await db.cache.get(key);
  return URL.createObjectURL(imageCache.image);
};
