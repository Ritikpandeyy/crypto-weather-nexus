'use client';

import WeatherSection from '@/components/WeatherSection';
import CryptoSection from '@/components/CryptoSection';
import NewsSection from '@/components/NewsSection';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8">
          CryptoWeather Nexus
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <WeatherSection />
          <CryptoSection />
          <NewsSection />
        </div>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Built with Next.js 14, Redux, and Tailwind CSS</p>
        </footer>
      </div>
    </main>
  );
}
