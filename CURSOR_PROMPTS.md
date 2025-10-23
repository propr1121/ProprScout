# ProprScout - Complete Cursor Development Prompts

## Project Setup Prompts

### Prompt 1: Initial Project Setup
```
Create a new React project using Vite with the following setup:

1. Initialize project with Vite + React + JavaScript
2. Install and configure Tailwind CSS with these customizations:
   - Extend colors with emerald as primary (use full emerald palette)
   - Add Inter font family
   - Configure content paths for src/**/*.{js,jsx}
   - Add animation utilities

3. Install these dependencies:
   - react-leaflet (for maps)
   - leaflet (peer dependency)
   - lucide-react (for icons)
   - @turf/turf (geospatial calculations)
   - clsx (classname utility)

4. Project structure:
   /src
     /components
     /lib
       /scrapers
       /analysis
     /hooks
     App.jsx
     main.jsx
     index.css

5. Setup index.css with:
   - Tailwind directives
   - Custom CSS variables from DESIGN_SYSTEM.md
   - Leaflet CSS import
   - Base styles for body (Inter font, antialiased)

6. Create a basic App.jsx with:
   - ProprScout header (logo, title, nav)
   - Main content area with bg-gray-50
   - Responsive container (max-w-7xl mx-auto px-4 py-8)

Follow the design system in DESIGN_SYSTEM.md for all styling.
```

### Prompt 2: Property Input Component
```
Create a PropertyInput component in src/components/PropertyInput.jsx:

REQUIREMENTS:
- Accept props: { onAnalyze, loading, error }
- Responsive design (mobile-first)
- Follow DESIGN_SYSTEM.md for all styles

UI ELEMENTS:
1. Card container (white bg, rounded-lg, shadow-lg, p-8)

2. Header:
   - Title: "Analyze Any Property Listing" (text-xl font-semibold)
   - Description: "Paste a property URL from Idealista, Imovirtual, OLX, or Supercasa"

3. URL Input:
   - Full-width text input with:
     - Placeholder: "https://www.idealista.pt/imovel/..."
     - Search icon (lucide-react) positioned on left
     - Focus ring (emerald-500)
     - Disabled state when loading
   - Apply input styles from DESIGN_SYSTEM.md

4. Error Display:
   - Only show if error prop exists
   - Use Error Alert pattern from design system
   - Red color scheme with XCircle icon

5. Analyze Button:
   - Full width, primary button style from design system
   - Show loading spinner (Loader2 icon) when loading=true
   - Text: "Analyze Property" or "Analyzing..." when loading
   - Disabled when: no URL entered or loading=true

6. Examples Section:
   - Border-top divider (mt-6 pt-6)
   - Small text: "Try these examples:"
   - Clickable example URLs (ghost button style)
   - URLs: 
     * https://www.idealista.pt/imovel/33456789/
     * https://www.imovirtual.com/anuncios/...

7. Feature Stats (3-column grid):
   - "30s" - Analysis time
   - "10+" - Data points  
   - "Free" - Forever
   - Use stat card pattern from design system

INTERACTIONS:
- Click example URL → populate input field
- Click Analyze → call onAnalyze(url)
- Loading state → disable input & button, show spinner
- Error state → show error alert

EXPORT:
export default PropertyInput;
```

### Prompt 3: URL Parser & Scraper
Create the property scraping system with these files:
FILE 1: src/lib/scrapers/urlParser.js
────────────────────────────────────
Export a parsePropertyUrl function that:
INPUT: URL string
OUTPUT: { site: string, propertyId: string } or throws Error
SUPPORTED SITES:

Idealista: /imovel/(\d+)
Imovirtual: ID([A-Z0-9]+).html
OLX: ID([a-z0-9]+).html
Supercasa: /(\d+)$ at end of URL

IMPLEMENTATION:
```javascript
export function parsePropertyUrl(url) {
  const patterns = {
    idealista: /idealista\.pt\/imovel\/(\d+)/,
    imovirtual: /imovirtual\.com\/.*-ID([A-Z0-9]+)\.html/,
    olx: /olx\.pt\/.*-ID([a-z0-9]+)\.html/,
    supercasa: /supercasa\.pt\/.*\/(\d+)$/
  };
  
  for (const [site, pattern] of Object.entries(patterns)) {
    const match = url.match(pattern);
    if (match) {
      return { site, propertyId: match[1] };
    }
  }
  
  throw new Error('Unsupported property website. Please use Idealista, Imovirtual, OLX, or Supercasa.');
}
```

FILE 2: src/lib/scrapers/propertyScraper.js
─────────────────────────────────────────
Export a scrapeProperty function that:
INPUT: { site, propertyId }
OUTPUT: Promise<PropertyData> or throws Error

PROPERTY DATA STRUCTURE:
```javascript
{
  title: string,
  price: number,
  location: string,
  area: number,
  rooms: number,
  bathrooms: number,
  images: string[],
  description: string,
  features: string[],
  coordinates: { lat: number, lng: number },
  url: string,
  scrapedAt: string (ISO date)
}
```

IMPLEMENTATION APPROACH:
1. Use fetch() to get HTML content
2. Parse with DOMParser (browser) or cheerio (Node.js)
3. Extract data using CSS selectors
4. Handle errors gracefully
5. Return structured data

FILE 3: src/lib/analysis/propertyAnalyzer.js
───────────────────────────────────────────
Export an analyzeProperty function that:
INPUT: PropertyData
OUTPUT: AnalysisResult

ANALYSIS RESULT STRUCTURE:
```javascript
{
  overallScore: number (0-100),
  priceAnalysis: {
    score: number,
    marketComparison: string,
    valueAssessment: string
  },
  locationAnalysis: {
    score: number,
    neighborhood: string,
    amenities: string[],
    transportScore: number
  },
  propertyAnalysis: {
    score: number,
    sizeScore: number,
    conditionScore: number,
    featuresScore: number
  },
  recommendations: string[],
  risks: string[],
  opportunities: string[]
}
```

IMPLEMENTATION:
1. Calculate price per m²
2. Compare with market averages
3. Analyze location factors
4. Assess property features
5. Generate recommendations
6. Identify risks and opportunities

FILE 4: src/hooks/usePropertyAnalysis.js
─────────────────────────────────────
Custom hook for property analysis workflow:

```javascript
import { useState, useCallback } from 'react';
import { parsePropertyUrl } from '../lib/scrapers/urlParser';
import { scrapeProperty } from '../lib/scrapers/propertyScraper';
import { analyzeProperty } from '../lib/analysis/propertyAnalyzer';

export function usePropertyAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const analyze = useCallback(async (url) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Parse URL
      const { site, propertyId } = parsePropertyUrl(url);
      
      // Scrape property data
      const propertyData = await scrapeProperty({ site, propertyId });
      
      // Analyze property
      const analysis = await analyzeProperty(propertyData);
      
      setResult({ propertyData, analysis });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyze, loading, error, result };
}
```

## Component Development Prompts

### Prompt 4: Analysis Results Component
```
Create a PropertyResults component in src/components/PropertyResults.jsx:

REQUIREMENTS:
- Accept props: { result, loading, error }
- Display comprehensive analysis results
- Follow DESIGN_SYSTEM.md for all styles

UI SECTIONS:
1. Header with property title and main score
2. Score breakdown (3 main categories)
3. Key metrics grid
4. Recommendations section
5. Risk assessment
6. Property details table
7. Location map (placeholder)

LAYOUT:
- Responsive grid layout
- Cards for each section
- Progress bars for scores
- Color-coded indicators
- Interactive elements

EXPORT:
export default PropertyResults;
```

### Prompt 5: Dashboard Component
```
Create a Dashboard component in src/components/Dashboard.jsx:

REQUIREMENTS:
- Main application layout
- Integrate PropertyInput and PropertyResults
- Handle state management
- Follow DESIGN_SYSTEM.md for all styles

FEATURES:
1. Header with navigation
2. Property input section
3. Results display area
4. Loading states
5. Error handling
6. Responsive design

LAYOUT:
- Full-height layout
- Sidebar navigation (optional)
- Main content area
- Footer with links

EXPORT:
export default Dashboard;
```

## Testing Prompts

### Prompt 6: Component Testing
```
Create comprehensive tests for all components:

1. PropertyInput.test.jsx
   - Test URL input validation
   - Test example URL clicks
   - Test analyze button states
   - Test error display

2. PropertyResults.test.jsx
   - Test score display
   - Test recommendation rendering
   - Test responsive layout
   - Test loading states

3. usePropertyAnalysis.test.js
   - Test hook functionality
   - Test error handling
   - Test loading states
   - Test result structure

REQUIREMENTS:
- Use React Testing Library
- Mock external dependencies
- Test user interactions
- Test edge cases
- Achieve 90%+ coverage
```

## Deployment Prompts

### Prompt 7: Production Build
```
Configure production deployment:

1. Update package.json scripts
2. Configure build optimization
3. Set up environment variables
4. Create production Dockerfile
5. Configure CI/CD pipeline

REQUIREMENTS:
- Optimize bundle size
- Enable gzip compression
- Configure caching headers
- Set up monitoring
- Ensure security headers
```

## Performance Optimization Prompts

### Prompt 8: Performance Optimization
```
Optimize application performance:

1. Implement code splitting
2. Add lazy loading for components
3. Optimize images and assets
4. Implement caching strategies
5. Add performance monitoring

REQUIREMENTS:
- Lighthouse score 90+
- First Contentful Paint < 2s
- Largest Contentful Paint < 4s
- Cumulative Layout Shift < 0.1
- First Input Delay < 100ms
```

---

**Use these prompts systematically to build ProprScout step by step.**
