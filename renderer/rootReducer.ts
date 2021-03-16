import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import settingsReducer from './features/settings/settingsSlice';
import infoReducer from './utils/infoSlice';
import imagesReducer from './features/images/imagesSlice';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    settings: settingsReducer,
    information: infoReducer,
    images: imagesReducer,
  });
}
