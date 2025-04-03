# CryptoWeather Nexus

A modern, multi-page dashboard combining weather data, cryptocurrency information, and real-time notifications via WebSocket.

## Features

- **Weather Dashboard**
  - Real-time weather data for multiple cities
  - 5-day weather forecast
  - Interactive temperature and humidity charts
  - Detailed weather information including sunrise/sunset times

- **Cryptocurrency Dashboard**
  - Live cryptocurrency prices via WebSocket
  - Historical price data and charts
  - Market statistics and metrics
  - Price change notifications

- **User Preferences**
  - Favorite cities and cryptocurrencies
  - Persistent user preferences
  - Real-time updates for favorites

- **Modern UI/UX**
  - Responsive design
  - Dark mode support
  - Interactive charts and visualizations
  - Toast notifications for important updates

## Tech Stack

- **Framework**: Next.js 13+ with App Router
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with React
- **Real-time Updates**: WebSocket
- **APIs**:
  - OpenWeatherMap for weather data
  - CoinGecko for cryptocurrency data
  - CoinCap WebSocket for real-time prices

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/crypto-weather-nexus.git
   cd crypto-weather-nexus
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your API keys:
   ```
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
   NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── crypto/            # Cryptocurrency pages
│   ├── weather/           # Weather pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
├── store/                 # Redux store and slices
├── services/             # API and WebSocket services
└── utils/                # Utility functions
```

## Design Decisions

1. **State Management**
   - Used Redux Toolkit for centralized state management
   - Implemented separate slices for crypto, weather, and favorites
   - Optimized re-renders with selective state updates

2. **Real-time Updates**
   - Implemented WebSocket connection for live crypto prices
   - Added reconnection logic with exponential backoff
   - Optimized WebSocket message handling

3. **UI/UX**
   - Chose dark mode as default for better readability
   - Implemented responsive design for all screen sizes
   - Added loading states and error handling
   - Used toast notifications for important updates

4. **Performance**
   - Implemented proper data caching
   - Optimized chart rendering
   - Added proper cleanup for WebSocket connections

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
