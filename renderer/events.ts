export type StartToSync = {
  _tag: 'start-to-sync';
};

export type FailedToSync = {
  _tag: 'failed-to-sync';
  error: string;
};

export type SuccessToSync = {
  _tag: 'success-to-sync';
};

export type ShowStepInformation = {
  _tag: 'show-step-information';
  info: string;
};

export type WorkerEvents =
  | StartToSync
  | FailedToSync
  | SuccessToSync
  | ShowStepInformation;

export const startToSync = (): WorkerEvents => ({ _tag: 'start-to-sync' });
export const successToSync = (): WorkerEvents => ({ _tag: 'success-to-sync' });
export const failedToSync = (error: string): WorkerEvents => ({
  _tag: 'failed-to-sync',
  error,
});
export const showStepInformation = (info: string): WorkerEvents => ({
  _tag: 'show-step-information',
  info,
});
