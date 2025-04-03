import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
    main: string;
    id?: number;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  name: string;
  dt: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
  forecast?: ForecastData;
}

interface ForecastData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    weather: Array<{
      description: string;
      icon: string;
      main: string;
    }>;
  }>;
}

interface WeatherState {
  cities: { [key: string]: WeatherData };
  loading: boolean;
  error: string | null;
  lastAlerts: { [key: string]: { type: string, time: number } };
}

const initialState: WeatherState = {
  cities: {},
  loading: false,
  error: null,
  lastAlerts: {},
};

export const fetchWeatherData = createAsyncThunk(
  'weather/fetchWeatherData',
  async (city: string) => {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: city,
        appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
        units: 'metric',
      },
    });
    return { city, data: response.data };
  }
);

export const fetchForecast = createAsyncThunk(
  'weather/fetchForecast',
  async (city: string) => {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        q: city,
        appid: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
        units: 'metric',
      },
    });
    return { city, data: response.data };
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    triggerWeatherAlert: (state, action) => {
      const { city, type } = action.payload;
      state.lastAlerts[city] = {
        type,
        time: Date.now()
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action) => {
        state.loading = false;
        state.cities[action.payload.city] = action.payload.data;
        state.error = null;
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch weather data';
      })
      .addCase(fetchForecast.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForecast.fulfilled, (state, action) => {
        state.loading = false;
        // Store forecast data in the city's data
        if (state.cities[action.payload.city]) {
          state.cities[action.payload.city].forecast = action.payload.data;
        }
        state.error = null;
      })
      .addCase(fetchForecast.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch forecast data';
      });
  },
});

export const { triggerWeatherAlert } = weatherSlice.actions;
export default weatherSlice.reducer; 