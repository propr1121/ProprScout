import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'ProprScout scraping server is running'
  });
});

// Simple scraping endpoint (will be enhanced later)
app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ 
        success: false,
        error: 'URL is required' 
      });
    }

    console.log(`🔍 Server-side scraping request: ${url}`);
    
    // For now, return an error indicating server needs enhancement
    // This prevents the frontend from showing fake data
    res.json({
      success: false,
      error: 'Server-side scraping not yet implemented. Using browser fallback.'
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
  console.log(`🚀 ProprScout scraping server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
