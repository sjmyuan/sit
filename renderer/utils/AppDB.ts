import Dexie from 'dexie';

export class AppDB extends Dexie {
  cache: Dexie.Table<ImageCache, string>;
  index: Dexie.Table<ImageIndex, string>;

  constructor() {
    super('AppDB');
    this.version(2).stores({
      cache: 'key, image',
      index: 'key, lastModified, state',
    });
  }
}

export interface ImageCache {
  key: string;
  image: Blob;
}

export interface ImageIndex {
  key: string;
  lastModified: number;
  state: 'ADDED' | 'DELETED' | 'ADDING' | 'DELETING';
}

export const db = new AppDB();
