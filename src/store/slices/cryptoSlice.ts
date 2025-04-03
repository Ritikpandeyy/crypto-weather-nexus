import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface MarketData {
  current_price: {
    usd: number;
  };
  market_cap: {
    usd: number;
  };
  total_volume: {
    usd: number;
  };
  circulating_supply: number;
  price_change_percentage_24h: number;
}

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  market_data: MarketData;
}

interface CryptoHistory {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

interface CryptoState {
  coins: { [key: string]: Coin };
  history: { [key: string]: CryptoHistory };
  loading: boolean;
  error: string | null;
  lastAlertTime: { [key: string]: number };
}

const initialState: CryptoState = {
  coins: {},
  history: {},
  loading: false,
  error: null,
  lastAlertTime: {},
};

const COIN_IDS = ['bitcoin', 'ethereum', 'solana'];

// Function to simulate price updates for in-house data
export const simulatePriceUpdate = (currentPrice: number): number => {
  // Random change between -2% and +2%
  const percentChange = (Math.random() * 4) - 2;
  return currentPrice * (1 + percentChange / 100);
};

// Generate realistic mock data for a crypto coin
export const generateMockHistory = (days: number, basePrice: number): CryptoHistory => {
  const now = Date.now();
  const interval = days <= 1 ? 3600000 : 86400000; // 1 hour or 1 day in ms
  const dataPoints = days <= 1 ? 24 : days;
  
  let currentPrice = basePrice;
  let currentVolume = basePrice * 10000000;
  let currentMarketCap = basePrice * 1000000000;
  
  const prices: [number, number][] = [];
  const volumes: [number, number][] = [];
  const marketCaps: [number, number][] = [];
  
  for (let i = 0; i < dataPoints; i++) {
    const timestamp = now - ((dataPoints - i) * interval);
    
    // Add some variance to the data
    currentPrice = simulatePriceUpdate(currentPrice);
    currentVolume = currentVolume * (1 + ((Math.random() * 6) - 3) / 100);
    currentMarketCap = currentPrice * 1000000000 * (1 + ((Math.random() * 2) - 1) / 100);
    
    prices.push([timestamp, currentPrice]);
    volumes.push([timestamp, currentVolume]);
    marketCaps.push([timestamp, currentMarketCap]);
  }
  
  return {
    prices,
    total_volumes: volumes,
    market_caps: marketCaps
  };
};

export const fetchCryptoData = createAsyncThunk(
  'crypto/fetchCryptoData',
  async () => {
    try {
      // Using the markets endpoint which provides all data in one call
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            ids: COIN_IDS.join(','),
            order: 'market_cap_desc',
            per_page: 3,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h'
          },
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      const coins: { [key: string]: Coin } = {};
      response.data.forEach((coin: { 
        id: string; 
        name: string; 
        symbol: string; 
        image: string; 
        current_price: number;
        market_cap: number;
        total_volume: number;
        circulating_supply: number;
        price_change_percentage_24h: number;
      }) => {
        coins[coin.id] = {
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          image: coin.image,
          market_data: {
            current_price: {
              usd: coin.current_price
            },
            market_cap: {
              usd: coin.market_cap
            },
            total_volume: {
              usd: coin.total_volume
            },
            circulating_supply: coin.circulating_supply,
            price_change_percentage_24h: coin.price_change_percentage_24h || 0
          }
        };
      });

      return coins;
    } catch (error: unknown) {
      console.error('Error fetching crypto data:', error instanceof Error ? error.message : String(error));
      // Fallback to simulated data if API fails
      const coins: { [key: string]: Coin } = {};
      
      const basePrices: { [key: string]: number } = {
        bitcoin: 36000,
        ethereum: 2400,
        solana: 145
      };
      
      COIN_IDS.forEach(id => {
        const basePrice = basePrices[id];
        const priceChange = ((Math.random() * 10) - 5);
        
        coins[id] = {
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          symbol: id.substring(0, 3).toUpperCase(),
          image: `https://cryptologos.cc/logos/${id}-${id}-logo.png`, // Better fallback URLs
          market_data: {
            current_price: {
              usd: basePrice
            },
            market_cap: {
              usd: basePrice * 1000000000
            },
            total_volume: {
              usd: basePrice * 10000000
            },
            circulating_supply: basePrice * 1000000,
            price_change_percentage_24h: priceChange
          }
        };
      });
      
      return coins;
    }
  }
);

export const fetchCryptoHistory = createAsyncThunk(
  'crypto/fetchCryptoHistory',
  async ({ id, days }: { id: string; days: number }, { getState }) => {
    try {
      // Try fetching from API first
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days,
            interval: days > 1 ? 'daily' : 'hourly',
          },
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      return { id, data: response.data };
    } catch (error: unknown) {
      console.error('Error fetching crypto history:', error instanceof Error ? error.message : String(error));
      
      // Fallback to mock data
      const state = getState() as { crypto: CryptoState };
      const coin = state.crypto.coins[id];
      const basePrice = coin?.market_data.current_price.usd || 
        (id === 'bitcoin' ? 36000 : 
         id === 'ethereum' ? 2400 : 145);
      
      const mockData = generateMockHistory(days, basePrice);
      return { id, data: mockData };
    }
  }
);

// Action to simulate regular price updates
export const updateCryptoPrices = createAsyncThunk(
  'crypto/updateCryptoPrices',
  async (_, { getState }) => {
    const state = getState() as { crypto: CryptoState };
    const coins = state.crypto.coins;
    
    const updates: { [key: string]: Coin } = {};
    
    Object.keys(coins).forEach(id => {
      const coin = coins[id];
      if (coin) {
        const currentPrice = coin.market_data.current_price.usd;
        const newPrice = simulatePriceUpdate(currentPrice);
        const percentChange = ((newPrice - currentPrice) / currentPrice) * 100;
        
        updates[id] = {
          ...coin,
          market_data: {
            ...coin.market_data,
            current_price: {
              usd: newPrice
            },
            price_change_percentage_24h: 
              (coin.market_data.price_change_percentage_24h * 0.95) + (percentChange * 0.05)
          }
        };
      }
    });
    
    return updates;
  }
);

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    updateCryptoPrice: (state, action) => {
      const { id, price } = action.payload;
      if (state.coins[id]) {
        const oldPrice = state.coins[id].market_data.current_price.usd;
        state.coins[id].market_data.current_price.usd = price;
        
        // Calculate percentage change for 24h
        const percentChange = ((price - oldPrice) / oldPrice) * 100;
        state.coins[id].market_data.price_change_percentage_24h = 
          (state.coins[id].market_data.price_change_percentage_24h * 0.95) + (percentChange * 0.05);
      }
    },
    triggerPriceAlert: (state, action) => {
      const { id } = action.payload;
      // Track when we last sent an alert
      state.lastAlertTime[id] = Date.now();
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCryptoData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCryptoData.fulfilled, (state, action) => {
        state.loading = false;
        state.coins = action.payload;
        state.error = null;
      })
      .addCase(fetchCryptoData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch crypto data';
      })
      .addCase(fetchCryptoHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCryptoHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history[action.payload.id] = action.payload.data;
        state.error = null;
      })
      .addCase(fetchCryptoHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch crypto history data';
      })
      .addCase(updateCryptoPrices.fulfilled, (state, action) => {
        // Update coins with new price data
        const updates = action.payload;
        Object.keys(updates).forEach(id => {
          state.coins[id] = updates[id];
        });
      });
  },
});

export const { updateCryptoPrice, triggerPriceAlert } = cryptoSlice.actions;
export default cryptoSlice.reducer; 