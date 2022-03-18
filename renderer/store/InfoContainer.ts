import { pipe } from 'fp-ts/lib/function';
import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { AppErrorOr, O, TE } from '../types';

function useInfo() {
  const [info, setInfo] = useState<O.Option<string>>(O.none);
  const [error, setError] = useState<O.Option<string>>(O.none);
  const [inProgress, toggleInProgress] = useState<boolean>(false);

  const startProcess = () => toggleInProgress(true);
  const showInfo = (infoMsg: O.Option<string>) => {
    toggleInProgress(false);
    setInfo(infoMsg);
    setError(O.none);
  };
  const showError = (errorMsg: O.Option<string>) => {
    toggleInProgress(false);
    setInfo(O.none);
    setError(errorMsg);
  };

  const runTask =
    (description: string) =>
    <A>(task: AppErrorOr<A>): AppErrorOr<A> =>
      pipe(
        TE.fromIO<void, Error>(() => startProcess()),
        TE.chain(() => task),
        TE.fold(
          (e) =>
            pipe(
              TE.fromIO<void, Error>(() =>
                showError(O.some(`Failed to ${description}`))
              ),
              TE.chain(() => TE.left(e))
            ),
          (x) =>
            pipe(
              TE.fromIO<void, Error>(() =>
                showInfo(O.some(`Succeed to ${description}`))
              ),
              TE.map(() => x)
            )
        )
      );
  return {
    info,
    error,
    inProgress,
    startProcess,
    showInfo,
    showError,
    runTask,
  };
}

// eslint-disable-next-line import/prefer-default-export
export const InfoContainer = createContainer(useInfo);
