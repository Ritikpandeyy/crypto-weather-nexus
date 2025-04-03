'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchWeatherData } from '@/store/slices/weatherSlice';
import Link from 'next/link';
import { WiHumidity, WiBarometer } from 'react-icons/wi';
import { FaTemperatureHigh, FaTemperatureLow } from 'react-icons/fa';

const CITIES = ['London', 'New York', 'Tokyo', 'Paris', 'Sydney'];

export default function WeatherSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { cities, loading, error } = useSelector((state: RootState) => state.weather);

  useEffect(() => {
    CITIES.forEach(city => {
      dispatch(fetchWeatherData(city));
    });
    
    // Refresh weather data every 10 seconds
    const intervalId = setInterval(() => {
      CITIES.forEach(city => {
        dispatch(fetchWeatherData(city));
      });
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [dispatch]);

  if (loading && Object.keys(cities).length === 0) {
    return (
      <div className="col-span-1">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 h-full">
          <h2 className="text-xl font-semibold text-white mb-4">Weather Updates</h2>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-gray-700/50 rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-1">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 h-full">
          <h2 className="text-xl font-semibold text-white mb-4">Weather Updates</h2>
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => CITIES.forEach(city => dispatch(fetchWeatherData(city)))}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-1">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 h-full">
        <h2 className="text-xl font-semibold text-white mb-4">Weather Updates</h2>
        <div className="space-y-4">
          {CITIES.map((cityName) => {
            const cityData = cities[cityName];
            if (!cityData || !cityData.weather || !cityData.main) {
              return (
                <div key={cityName} className="bg-gray-700/50 rounded-lg p-4 animate-pulse">
                  <div className="h-6 bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                </div>
              );
            }

            return (
              <Link
                href={`/weather/${encodeURIComponent(cityName)}`}
                key={cityName}
                className="block bg-gray-700/50 hover:bg-gray-700/70 rounded-lg p-4 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-medium text-white group-hover:text-blue-400 transition-colors">
                      {cityName}
                    </h3>
                    <p className="text-gray-400 capitalize text-sm">
                      {cityData.weather[0].description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {Math.round(cityData.main.temp)}°C
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="flex items-center gap-1">
                      <FaTemperatureHigh className="text-blue-400" />
                      <span className="text-sm">H: {Math.round(cityData.main.temp_max)}°</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaTemperatureLow className="text-blue-400" />
                      <span className="text-sm">L: {Math.round(cityData.main.temp_min)}°</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 text-gray-400">
                    <div className="flex items-center gap-1">
                      <WiHumidity className="text-lg text-blue-400" />
                      <span className="text-sm">{cityData.main.humidity}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <WiBarometer className="text-lg text-blue-400" />
                      <span className="text-sm">{cityData.main.pressure}hPa</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
} 