import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './features/authSlice';
import permissionReducer from './features/permissionSlice';
const persistConfig = {
  key: 'accounting',
  storage
};

const rootReducer = combineReducers({
  auth: authReducer,
  permission: permissionReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer
});

export type AppDispatch = typeof store.dispatch;

export default store;
