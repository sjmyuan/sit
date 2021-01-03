import {
  configureStore,
  getDefaultMiddleware,
  Action,
  combineReducers,
} from '@reduxjs/toolkit';
import { createHashHistory } from 'history';
import { routerMiddleware, connectRouter } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import { ThunkAction } from 'redux-thunk';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import * as Storage from './utils/localStorage';
import settingsReducer from './features/settings/settingsSlice';
import infoReducer from './utils/infoSlice';
import imagesReducer from './features/images/imagesSlice';

function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    settings: settingsReducer,
    information: infoReducer,
    images: imagesReducer,
  });
}

export const history = createHashHistory();
const rootReducer = createRootReducer(history);
export type RootState = ReturnType<typeof rootReducer>;

export const selectImages = (state: RootState) => state.images;
export const selectInformation = (state: RootState) => state.information;
export const selectAWSConfig = (state: RootState) => state.settings.awsConfig;

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

  store.subscribe(() => {
    pipe(
      store.getState().settings.awsConfig,
      O.map((x) => Storage.saveToStorage('aws_config', x))
    );
  });

  return store;
};
export type Store = ReturnType<typeof configuredStore>;
export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;
