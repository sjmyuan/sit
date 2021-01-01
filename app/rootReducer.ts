import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
// eslint-disable-next-line import/no-cycle
import counterReducer from './features/counter/counterSlice';
// eslint-disable-next-line import/no-cycle
import settingsReducer from './features/settings/settingsSlice';
// eslint-disable-next-line import/no-cycle
import infoReducer from './utils/infoSlice';

// eslint-disable-next-line import/no-cycle
import imagesReducer from './features/images/imagesSlice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    counter: counterReducer,
    settings: settingsReducer,
    information: infoReducer,
    images: imagesReducer,
  });
}
