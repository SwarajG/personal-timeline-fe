import { combineReducers  } from '@reduxjs/toolkit';
import globalAppSlice from './globalSlice/appSlice';
import postsApp from './features/Timeline/slices/appSlice';

const app = combineReducers({
  globalSlice: globalAppSlice,
  timeline: combineReducers({
    post: postsApp
  })
});

export default combineReducers({
  app
});