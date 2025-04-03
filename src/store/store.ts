import { configureStore } from '@reduxjs/toolkit';
import cryptoReducer from './slices/cryptoSlice';
import weatherReducer from './slices/weatherSlice';
import favoritesReducer from './slices/favoritesSlice';
import newsReducer from './slices/newsSlice';

export const store = configureStore({
  reducer: {
    crypto: cryptoReducer,
    weather: weatherReducer,
    favorites: favoritesReducer,
    news: newsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 