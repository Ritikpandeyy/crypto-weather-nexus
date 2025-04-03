import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FavoritesState {
  cities: string[];
  cryptos: string[];
}

const initialState: FavoritesState = {
  cities: [],
  cryptos: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addToFavorites: (state, action: PayloadAction<string>) => {
      const item = action.payload;
      if (!state.cities.includes(item) && !state.cryptos.includes(item)) {
        // Determine if it's a city or crypto based on the item
        if (['new york', 'london', 'tokyo'].includes(item.toLowerCase())) {
          state.cities.push(item);
        } else {
          state.cryptos.push(item);
        }
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      const item = action.payload;
      state.cities = state.cities.filter((city) => city !== item);
      state.cryptos = state.cryptos.filter((crypto) => crypto !== item);
    },
    setFavorites: (state, action: PayloadAction<FavoritesState>) => {
      state.cities = action.payload.cities;
      state.cryptos = action.payload.cryptos;
    },
  },
});

export const { addToFavorites, removeFromFavorites, setFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer; 