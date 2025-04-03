import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/store/provider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CryptoWeather Nexus',
  description: 'A modern dashboard combining weather data, cryptocurrency information, and real-time notifications',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
