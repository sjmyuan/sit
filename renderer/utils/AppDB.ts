import Dexie from 'dexie';

class AppDB extends Dexie {
  cache: Dexie.Table<ImageCache, string>;

  constructor() {
    super('AppDB');
    this.version(1).stores({
      cache: "key, img, lastModified',
    });
  }
}

interface ImageCache {
  key: string;
  img: Blob;
  lastModified: number;
}
