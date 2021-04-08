import Dexie from 'dexie';

export class AppDB extends Dexie {
  cache: Dexie.Table<ImageCache, string>;

  constructor() {
    super('AppDB');
    this.version(1).stores({
      cache: 'key, img, lastModified, boolean',
    });
  }
}

export interface ImageCache {
  key: string;
  img: Blob;
  lastModified: number;
  sync: boolean;
}

export const db = new AppDB();
