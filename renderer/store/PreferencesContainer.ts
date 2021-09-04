import { pipe } from 'fp-ts/lib/function';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { O, Resolution } from '../types';
import { getFromStorage, saveToStorage } from '../utils/localStorage';

function usePreferences() {
  const [accessId, setAccessId] = useState<O.Option<string>>(O.none);
  const [secretAccessKey, setSecretAccessKey] = useState<O.Option<string>>(
    O.none
  );
  const [bucket, setBucket] = useState<O.Option<string>>(O.none);
  const [region, setRegion] = useState<O.Option<string>>(O.none);
  const [resolution, setResolution] = useState<Resolution>({
    width: 640,
    height: 480,
  });

  const setAndSaveAccessId = (newAccessId: O.Option<string>) => {
    setAccessId(newAccessId);
    pipe(
      newAccessId,
      O.map((x) => saveToStorage('access_id', x))
    );
  };
  const setAndSaveSecretAccessKey = (newSecretAccessKey: O.Option<string>) => {
    setSecretAccessKey(newSecretAccessKey);
    pipe(
      newSecretAccessKey,
      O.map((x) => saveToStorage('secret_access_key', x))
    );
  };

  const setAndSaveRegion = (newRegion: O.Option<string>) => {
    setRegion(newRegion);
    pipe(
      newRegion,
      O.map((x) => saveToStorage('region', x))
    );
  };

  const setAndSaveBucket = (newBucket: O.Option<string>) => {
    setBucket(newBucket);
    pipe(
      newBucket,
      O.map((x) => saveToStorage('bucket', x))
    );
  };

  const setAndSaveResolution = (newResolution: Resolution) => {
    setResolution(newResolution);
    saveToStorage('resolution', newResolution);
  };

  const loadPreferences = () => {
    setAccessId(O.fromEither(getFromStorage<string>('access_id')));
    setSecretAccessKey(
      O.fromEither(getFromStorage<string>('secret_access_key'))
    );
    setRegion(O.fromEither(getFromStorage<string>('region')));
    setBucket(O.fromEither(getFromStorage<string>('bucket')));

    setResolution(
      O.getOrElse(() => ({ width: 640, height: 480 }))(
        O.fromEither(getFromStorage<Resolution>('resolution'))
      )
    );
  };

  return {
    accessId,
    setAndSaveAccessId,
    secretAccessKey,
    setAndSaveSecretAccessKey,
    bucket,
    setAndSaveBucket,
    region,
    setAndSaveRegion,
    resolution,
    setAndSaveResolution,
    loadPreferences,
  };
}

// eslint-disable-next-line import/prefer-default-export
export const PreferencesContainer = createContainer(usePreferences);
