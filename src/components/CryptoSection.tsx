'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchCryptoData } from '@/store/slices/cryptoSlice';
import { formatCurrency } from '@/utils/format';
import Link from 'next/link';
import Image from 'next/image';
import { FaBitcoin } from 'react-icons/fa';
import { SiEthereum, SiSolana } from 'react-icons/si';
import { TiArrowSortedUp, TiArrowSortedDown } from 'react-icons/ti';

const CRYPTO_ICONS: { [key: string]: React.ReactNode } = {
  bitcoin: <FaBitcoin className="text-[#F7931A]" />,
  ethereum: <SiEthereum className="text-[#627EEA]" />,
  solana: <SiSolana className="text-[#14F195]" />,
};

export default function CryptoSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { coins, loading, error } = useSelector((state: RootState) => state.crypto);

  useEffect(() => {
    dispatch(fetchCryptoData());

    // Refresh crypto data every 10 seconds
    const intervalId = setInterval(() => {
      dispatch(fetchCryptoData());
    }, 10000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  if (loading && Object.keys(coins).length === 0) {
    return (
      <div className="col-span-1">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 h-full">
          <h2 className="text-xl font-semibold text-white mb-4">Cryptocurrency Updates</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-700/50 rounded-lg p-4 animate-pulse">
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gray-600 rounded-full"></div>
                    <div className="h-6 w-24 bg-gray-600 rounded"></div>
                  </div>
                  <div className="h-6 w-20 bg-gray-600 rounded"></div>
                </div>
                <div className="mt-4">
                  <div className="h-4 bg-gray-600 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-600 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-600 rounded w-2/3"></div>
                </div>
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
          <h2 className="text-xl font-semibold text-white mb-4">Cryptocurrency Updates</h2>
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => dispatch(fetchCryptoData())}
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
        <h2 className="text-xl font-semibold text-white mb-4">Cryptocurrency Updates</h2>
        <div className="space-y-4">
          {Object.entries(coins).map(([id, coin]) => {
            if (!coin || !coin.market_data?.current_price?.usd || typeof coin.market_data.price_change_percentage_24h === 'undefined') {
              return null;
            }

            const priceChange = coin.market_data.price_change_percentage_24h;
            const isPositive = priceChange >= 0;

            return (
              <Link
                href={`/crypto/${id}`}
                key={id}
                className="block bg-gray-700/50 hover:bg-gray-700/70 rounded-lg p-4 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      {CRYPTO_ICONS[id] ? (
                        CRYPTO_ICONS[id]
                      ) : coin.image ? (
                        <div className="w-6 h-6 relative">
                          <Image 
                            src={coin.image} 
                            alt={coin.name}
                            width={24}
                            height={24}
                            className="object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.parentElement) {
                                target.parentElement.innerHTML = coin.symbol.charAt(0);
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <span className="text-white">{coin.symbol.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white group-hover:text-blue-400 transition-colors">
                        {coin.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {coin.symbol}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-white">
                      {formatCurrency(coin.market_data.current_price.usd)}
                    </p>
                    <div className={`flex items-center justify-end gap-1 ${
                      isPositive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {isPositive ? <TiArrowSortedUp size={20} /> : <TiArrowSortedDown size={20} />}
                      <span className="text-sm">
                        {Math.abs(priceChange).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-2">
                    <p className="text-gray-400 text-sm">Market Cap</p>
                    <p className="text-white font-medium text-sm">{formatCurrency(coin.market_data.market_cap.usd)}</p>
                  </div>
                  <div className="mb-2">
                    <p className="text-gray-400 text-sm">Volume (24h)</p>
                    <p className="text-white font-medium text-sm">{formatCurrency(coin.market_data.total_volume.usd)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Supply</p>
                    <p className="text-white font-medium text-sm">
                      {Math.round(coin.market_data.circulating_supply).toLocaleString()} {coin.symbol}
                    </p>
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