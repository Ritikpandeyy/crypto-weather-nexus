'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchNews } from '@/store/slices/newsSlice';
import { format } from 'date-fns';
import { BiTime } from 'react-icons/bi';
import { FiExternalLink } from 'react-icons/fi';
import Image from 'next/image';

export default function NewsSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((state: RootState) => state.news);

  useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="col-span-1">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 h-full">
          <h2 className="text-xl font-semibold text-white mb-4">Latest News</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-gray-700/50 rounded-lg p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-600 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                  </div>
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
          <h2 className="text-xl font-semibold text-white mb-4">Latest News</h2>
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => dispatch(fetchNews())}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const newsItems = Array.isArray(items) ? items : [];

  return (
    <div className="col-span-1">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 h-full">
        <h2 className="text-xl font-semibold text-white mb-4">Latest News</h2>
        {newsItems.length === 0 ? (
          <p className="text-gray-400">No news available at the moment.</p>
        ) : (
          <div className="space-y-4">
            {newsItems.slice(0, 5).map((news) => (
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                key={news.id}
                className="block bg-gray-700/50 hover:bg-gray-700/70 rounded-lg p-4 transition-all duration-200 group"
              >
                <div className="flex gap-4">
                  {news.image && (
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={news.image}
                        alt={news.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {news.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                      {news.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <BiTime className="text-gray-400" />
                        {format(new Date(news.publishedAt), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        {news.source}
                        <FiExternalLink className="text-gray-400" />
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 