import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: string;
}

interface NewsState {
  items: NewsItem[];
  loading: boolean;
  error: string | null;
}

const initialState: NewsState = {
  items: [],
  loading: false,
  error: null,
};

// Mock news data for fallback
const mockNewsData: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Bitcoin surges past $40,000 as institutional adoption grows',
    description: 'The world\'s largest cryptocurrency has seen a significant price increase as more financial institutions add it to their portfolios.',
    url: 'https://example.com/bitcoin-surge',
    image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d',
    publishedAt: new Date().toISOString(),
    source: 'Crypto News',
  },
  {
    id: 'news-2',
    title: 'Ethereum 2.0 upgrade progresses with successful testnet implementation',
    description: 'The long-awaited upgrade to the Ethereum network is moving forward, promising improved scalability and reduced energy consumption.',
    url: 'https://example.com/ethereum-upgrade',
    image: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05',
    publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    source: 'Blockchain Times',
  },
  {
    id: 'news-3',
    title: 'Central banks worldwide explore digital currency options',
    description: 'Several major central banks have announced pilot programs for digital currencies as the financial landscape continues to evolve.',
    url: 'https://example.com/cbdc-exploration',
    image: 'https://images.unsplash.com/photo-1551135049-8a33b5883817',
    publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    source: 'Financial Review',
  },
  {
    id: 'news-4',
    title: 'New regulations proposed for cryptocurrency exchanges',
    description: 'Regulatory bodies are working on frameworks to provide better oversight and consumer protection in crypto markets.',
    url: 'https://example.com/crypto-regulations',
    image: 'https://images.unsplash.com/photo-1605792657660-596af9009e82',
    publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    source: 'Policy Insider',
  },
  {
    id: 'news-5',
    title: 'Solana ecosystem expands with new DeFi applications',
    description: 'The high-performance blockchain is seeing rapid growth in decentralized finance applications and developer activity.',
    url: 'https://example.com/solana-defi',
    image: 'https://images.unsplash.com/photo-1639762681057-408e52192e55',
    publishedAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    source: 'DeFi Daily',
  },
];

export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async () => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;

      if (!API_KEY) {
        console.log('News API key is not configured, using mock data');
        return mockNewsData;
      }

      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          country: 'us',
          apiKey: API_KEY,
          category: 'business',
          pageSize: 5,
        },
      });

      return response.data.articles.map((article: {
        title: string;
        description: string;
        url: string;
        urlToImage: string | null;
        publishedAt: string;
        source: { name: string };
      }, index: number) => ({
        id: `news-${index}-${Date.now()}`,
        title: article.title,
        description: article.description,
        url: article.url,
        image: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source.name,
      }));
    } catch (error: unknown) {
      console.error('Error fetching news:', error instanceof Error ? error.message : String(error));
      // Instead of throwing the error, return mock data
      console.log('Using mock news data due to API error');
      return mockNewsData;
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch news';
        // Apply mock data even in the rejected case
        state.items = mockNewsData;
      });
  },
});

export default newsSlice.reducer; 