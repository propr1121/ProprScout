import express from 'express';
import cors from 'cors';
import { enhancedScraper } from './src/lib/scrapers/enhancedScraper.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Scraping endpoint
app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`🔍 Server-side scraping: ${url}`);
    const propertyData = await enhancedScraper.scrapeProperty(url);
    
    res.json({
      success: true,
      data: propertyData
    });
  } catch (error) {
    console.error('Scraping error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Scraping server running on http://localhost:${PORT}`);
});
