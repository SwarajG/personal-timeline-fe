import { combineReducers  } from '@reduxjs/toolkit';
import globalAppSlice from './globalSlice/appSlice';

const app = combineReducers({
  globalSlice: globalAppSlice
});

export default combineReducers({
  app
});