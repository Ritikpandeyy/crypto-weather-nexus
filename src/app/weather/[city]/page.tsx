'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchWeatherData, fetchForecast } from '@/store/slices/weatherSlice';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
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
} from 'chart.js';

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

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  height: 300,
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#1F2937',
      titleColor: '#FFFFFF',
      bodyColor: '#FFFFFF',
      borderColor: '#374151',
      borderWidth: 1,
      padding: 10,
      displayColors: false,
    },
  },
  scales: {
    x: {
      type: 'category' as const,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: '#9CA3AF',
        maxRotation: 45,
        minRotation: 45,
      },
    },
    y: {
      type: 'linear' as const,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: '#9CA3AF',
      },
    },
  },
};

export default function WeatherDetailPage() {
  const params = useParams();
  const cityName = decodeURIComponent(params?.city as string);
  const dispatch = useDispatch<AppDispatch>();
  const { cities, loading, error } = useSelector((state: RootState) => state.weather);

  useEffect(() => {
    if (cityName) {
      dispatch(fetchWeatherData(cityName));
      dispatch(fetchForecast(cityName));
    }
  }, [dispatch, cityName]);

  if (loading || !cities[cityName]) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-700 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64 bg-gray-700 rounded"></div>
              <div className="h-64 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-white mb-4">Weather for {cityName}</h1>
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => {
              dispatch(fetchWeatherData(cityName));
              dispatch(fetchForecast(cityName));
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const cityData = cities[cityName];
  if (!cityData || !cityData.main || !cityData.weather) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-white mb-4">Weather for {cityName}</h1>
          <p className="text-gray-400">No weather data available for this city.</p>
        </div>
      </div>
    );
  }

  const forecast = cityData.forecast?.list || [];
  
  const temperatureData = {
    labels: forecast.map(item => format(new Date(item.dt * 1000), 'MMM d, HH:mm')),
    datasets: [{
      label: 'Temperature',
      data: forecast.map(item => item.main.temp),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  const humidityData = {
    labels: forecast.map(item => format(new Date(item.dt * 1000), 'MMM d, HH:mm')),
    datasets: [{
      label: 'Humidity',
      data: forecast.map(item => item.main.humidity),
      borderColor: 'rgb(139, 92, 246)',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">{cityName}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400">Temperature</p>
              <p className="text-2xl font-semibold text-white">{Math.round(cityData.main.temp)}°C</p>
              <p className="text-sm text-gray-400">
                Feels like {Math.round(cityData.main.feels_like)}°C
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400">Weather</p>
              <p className="text-2xl font-semibold text-white capitalize">
                {cityData.weather[0].description}
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400">Humidity</p>
              <p className="text-2xl font-semibold text-white">{cityData.main.humidity}%</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400">Wind Speed</p>
              <p className="text-2xl font-semibold text-white">{cityData.wind.speed} m/s</p>
            </div>
          </div>
        </div>

        {forecast.length > 0 && (
          <div className="space-y-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-white mb-4">Temperature Forecast</h2>
              <div className="h-64">
                <Line data={temperatureData} options={chartOptions} />
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-white mb-4">Humidity Forecast</h2>
              <div className="h-64">
                <Line data={humidityData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 