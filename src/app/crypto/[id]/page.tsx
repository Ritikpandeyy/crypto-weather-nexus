'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem,
} from 'chart.js';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import { AppDispatch, RootState } from '@/store/store';
import { fetchCryptoData, fetchCryptoHistory } from '@/store/slices/cryptoSlice';
import { formatCurrency } from '@/utils/format';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { addToFavorites, removeFromFavorites } from '@/store/slices/favoritesSlice';
import Image from 'next/image';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function CryptoPage() {
  const params = useParams();
  const id = params.id as string;
  const dispatch = useDispatch<AppDispatch>();
  const { coins, history, loading, error } = useSelector((state: RootState) => state.crypto);
  const favoriteCryptos = useSelector((state: RootState) => state.favorites.cryptos);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (id) {
      dispatch(fetchCryptoData());
      dispatch(fetchCryptoHistory({ id, days: timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30 }));
      
      // Set up auto-refresh of price data
      const intervalId = setInterval(() => {
        dispatch(fetchCryptoData());
      }, 10000); // Refresh every 10 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [dispatch, id, timeRange]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 animate-pulse">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="h-96 bg-gray-800 rounded"></div>
            <div className="h-96 bg-gray-800 rounded"></div>
            <div className="h-96 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (loading && (!coins[id] || !history[id])) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 animate-pulse">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="h-96 bg-gray-800 rounded"></div>
            <div className="h-96 bg-gray-800 rounded"></div>
            <div className="h-96 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !coins[id]) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-8">Cryptocurrency Details</h1>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-red-500">{error || 'Failed to load cryptocurrency data'}</p>
            <button
              onClick={() => {
                dispatch(fetchCryptoData());
                dispatch(fetchCryptoHistory({ id, days: timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30 }));
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const coin = coins[id];
  const isFavorite = favoriteCryptos.includes(id);

  const priceChartData = {
    labels: history[id]?.prices.map(([timestamp]) => format(new Date(timestamp), 'MMM d, HH:mm')) || [],
    datasets: [
      {
        label: 'Price',
        data: history[id]?.prices.map(([, price]) => price) || [],
        borderColor: theme === 'dark' ? '#60A5FA' : '#2563EB',
        backgroundColor: theme === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const volumeChartData = {
    labels: history[id]?.total_volumes.map(([timestamp]) => format(new Date(timestamp), 'MMM d, HH:mm')) || [],
    datasets: [
      {
        label: 'Volume',
        data: history[id]?.total_volumes.map(([, volume]) => volume) || [],
        borderColor: theme === 'dark' ? '#34D399' : '#059669',
        backgroundColor: theme === 'dark' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(5, 150, 105, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
        titleColor: theme === 'dark' ? '#FFFFFF' : '#000000',
        bodyColor: theme === 'dark' ? '#FFFFFF' : '#000000',
        borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function(tooltipItem: TooltipItem<'line'>) {
            const value = tooltipItem.raw as number;
            return tooltipItem.dataset.label === 'Price'
              ? `Price: ${formatCurrency(value)}`
              : `Volume: ${formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
        },
      },
      y: {
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
        },
      },
    },
  };

  const TimeRangeButton = ({ range, current, label }: { range: '24h' | '7d' | '30d', current: string, label: string }) => (
    <button 
      onClick={() => setTimeRange(range)}
      className={`px-4 py-2 rounded ${range === current ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
              <Image
                src={coin.image}
                alt={coin.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Try the first fallback source
                  const target = e.target as HTMLImageElement;
                  if (target.src !== `https://cryptologos.cc/logos/${id}-${id}-logo.png`) {
                    target.src = `https://cryptologos.cc/logos/${id}-${id}-logo.png`;
                  } else if (target.src !== `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/${id}.png`) {
                    target.src = `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/${id}.png`;
                  }
                }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{coin.name}</h1>
              <p className="text-gray-400">{coin.symbol}</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(isFavorite ? removeFromFavorites(id) : addToFavorites(id))}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            {isFavorite ? (
              <StarIconSolid className="w-6 h-6 text-yellow-400" />
            ) : (
              <StarIconOutline className="w-6 h-6 text-gray-400" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Price Information */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Price Information</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Current Price</span>
                <span className="text-white font-medium">
                  {formatCurrency(coin.market_data.current_price.usd)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">24h Change</span>
                <span className={`font-medium ${
                  coin.market_data.price_change_percentage_24h >= 0
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  {coin.market_data.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Market Statistics */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Market Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Market Cap</span>
                <span className="text-white font-medium">
                  {formatCurrency(coin.market_data.market_cap.usd)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">24h Volume</span>
                <span className="text-white font-medium">
                  {formatCurrency(coin.market_data.total_volume.usd)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Circulating Supply</span>
                <span className="text-white font-medium">
                  {coin.market_data.circulating_supply.toLocaleString()} {coin.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Rank</span>
                <span className="text-white font-medium">
                  #{id === 'bitcoin' ? 1 : id === 'ethereum' ? 2 : 3}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Type</span>
                <span className="text-white font-medium">
                  Cryptocurrency
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Time Range Selection */}
        <div className="flex justify-end gap-2 mb-4">
          <TimeRangeButton range="24h" current={timeRange} label="24h" />
          <TimeRangeButton range="7d" current={timeRange} label="7d" />
          <TimeRangeButton range="30d" current={timeRange} label="30d" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          {/* Price Chart */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Price Chart</h2>
            <div className="h-96">
              {history[id] ? (
                <Line data={priceChartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">Loading chart data...</p>
                </div>
              )}
            </div>
          </div>

          {/* Volume Chart */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Volume Chart</h2>
            <div className="h-96">
              {history[id] ? (
                <Line data={volumeChartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">Loading chart data...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 