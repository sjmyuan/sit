import { combineReducers } from 'redux';
import settingsReducer from './features/settings/settingsSlice';
import infoReducer from './utils/infoSlice';
import imagesReducer from './features/images/imagesSlice';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function createRootReducer() {
  return combineReducers({
    settings: settingsReducer,
    information: infoReducer,
    images: imagesReducer,
  });
}
