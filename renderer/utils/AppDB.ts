import Dexie from 'dexie';

export class AppDB extends Dexie {
  cache!: Dexie.Table<ImageCache, string>;

  localIndex!: Dexie.Table<ImageIndex, string>;

  remoteIndex!: Dexie.Table<ImageIndex, string>;

  constructor() {
    super('AppDB');
    this.version(3).stores({
      cache: 'key, image',
      localIndex: 'key, lastModified, state',
      remoteIndex: 'key, lastModified, state',
    });
  }
}

export type ImageState = 'ADDED' | 'DELETED' | 'ADDING' | 'DELETING';

export interface ImageCache {
  key: string;
  image: Blob;
}

export interface ImageIndex {
  key: string;
  lastModified: number;
  state: ImageState;
}

export const db = new AppDB();
