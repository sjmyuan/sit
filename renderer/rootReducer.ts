import { combineReducers } from 'redux';
import infoReducer from './utils/infoSlice';
import imagesReducer from './features/images/imagesSlice';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function createRootReducer() {
  return combineReducers({
    information: infoReducer,
    images: imagesReducer,
  });
}
