import { configureStore, getDefaultMiddleware, Action } from '@reduxjs/toolkit';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import { ThunkAction } from 'redux-thunk';
import * as O from 'fp-ts/Option';
import { sequenceS } from 'fp-ts/Apply';
import createRootReducer from './rootReducer';

export const history = createHashHistory();
const rootReducer = createRootReducer(history);
export type RootState = ReturnType<typeof rootReducer>;

export const selectImages = (state: RootState) => state.images;
export const selectInformation = (state: RootState) => state.information;

export const selectAWSConfig = (state: RootState) => {
  const awsConfig = {
    accessId: state.settings.accessId,
    secretAccessKey: state.settings.secretAccessKey,
    bucket: state.settings.bucket,
    region: state.settings.region,
  };

  return sequenceS(O.option)(awsConfig);
};

export const selectAWSSettings = (state: RootState) => {
  return {
    accessId: state.settings.accessId,
    secretAccessKey: state.settings.secretAccessKey,
    bucket: state.settings.bucket,
    region: state.settings.region,
  };
};

export const selectSettings = (state: RootState) => {
  return state.settings;
};

const router = routerMiddleware(history);
const middleware = [...getDefaultMiddleware(), router];

const excludeLoggerEnvs = ['test', 'production'];
const shouldIncludeLogger = !excludeLoggerEnvs.includes(
  process.env.NODE_ENV || ''
);

if (shouldIncludeLogger) {
  const logger = createLogger({
    level: 'info',
    collapsed: true,
  });
  middleware.push(logger);
}

export const configuredStore = (initialState?: RootState) => {
  // Create Store
  const store = configureStore({
    reducer: rootReducer,
    middleware,
    preloadedState: initialState,
  });

  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept(
      './rootReducer',
      // eslint-disable-next-line global-require
      () => store.replaceReducer(require('./rootReducer').default)
    );
  }
  return store;
};
export type Store = ReturnType<typeof configuredStore>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
