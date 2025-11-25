# ProprScout Portal Support Status

**Last Updated:** 2025-11-25
**Version:** 1.0.0

## Summary

| Status | Portals |
|--------|---------|
| Supported (with limitations) | Idealista, Imovirtual |
| Partial Support | Supercasa, OLX |
| Not Supported | Casa Sapo |

## Anti-Bot Protection Notice

Portuguese real estate portals actively employ anti-bot protection measures including:
- CAPTCHA challenges
- JavaScript rendering requirements
- Rate limiting
- IP blocking

This significantly impacts automated data extraction. For production use, consider:
1. Using a headless browser service (Puppeteer, Playwright)
2. Residential proxy rotation
3. Rate limiting requests to avoid detection

## Portal Details

### Idealista.pt (Primary Portal)

| Feature | Status | Notes |
|---------|--------|-------|
| URL Recognition | ✅ Working | Pattern: `/imovel/[ID]/` |
| Scraping | ⚠️ Limited | CAPTCHA protection active |
| Firecrawl Fallback | ✅ Available | Use when browser scraping fails |
| Data Extraction | ✅ Good | Most fields extractable |

**Supported URL Formats:**
```
https://www.idealista.pt/imovel/12345678/
https://www.idealista.pt/en/imovel/12345678/
```

**Fields Extracted:**
- Title, Price, Area, Bedrooms, Bathrooms
- Location, Description, Features
- Images (from gallery)
- Coordinates (from JSON-LD)

### Imovirtual.com

| Feature | Status | Notes |
|---------|--------|-------|
| URL Recognition | ✅ Working | Multiple formats supported |
| Scraping | ⚠️ Limited | Anti-bot protection |
| Firecrawl Fallback | ✅ Available | Recommended |
| Data Extraction | ✅ Good | Most fields extractable |

**Supported URL Formats:**
```
https://www.imovirtual.com/pt/anuncio/[slug]-ID[ID]
https://www.imovirtual.com/.../[property-slug]
```

### Supercasa.pt

| Feature | Status | Notes |
|---------|--------|-------|
| URL Recognition | ✅ Working | UUID and numeric IDs |
| Scraping | ⚠️ Limited | CAPTCHA blocking |
| Firecrawl Fallback | ⚠️ Partial | May not bypass CAPTCHA |
| Data Extraction | ⚠️ Partial | Limited by access |

**Supported URL Formats:**
```
https://supercasa.pt/comprar-[type]/[location]/[slug],[uuid]
https://supercasa.pt/.../[numeric-id]
```

### OLX.pt

| Feature | Status | Notes |
|---------|--------|-------|
| URL Recognition | ✅ Working | Standard OLX format |
| Scraping | ⚠️ Limited | Rate limiting active |
| Data Extraction | ⚠️ Partial | Seller-dependent data |

### Casa Sapo (casa.sapo.pt)

| Feature | Status | Notes |
|---------|--------|-------|
| URL Recognition | ✅ Working | Recently added |
| Scraping | ❌ Blocked | Strong anti-bot protection |
| Data Extraction | ❌ N/A | Cannot access content |

## Implementation Notes

### URL Parser
File: `backend/lib/scrapers/urlParser.js`

The URL parser supports:
- Idealista (numeric IDs)
- Imovirtual (multiple formats)
- Supercasa (UUIDs and numeric)
- OLX (standard format)
- Casa Sapo (recently added)

### Scraping Strategy

1. **Browser Scraping** (primary)
   - Uses CORS proxies for cross-origin requests
   - Tries multiple proxies for reliability
   - Falls back to Firecrawl on failure

2. **Firecrawl API** (fallback)
   - Headless browser rendering
   - Better JavaScript execution
   - API key required

3. **Data Extraction**
   - Site-specific selectors
   - Fallback to generic selectors
   - JSON-LD structured data support

### Recommended Configuration

For production deployment:

```env
# Firecrawl API (required for reliable scraping)
FIRECRAWL_API_KEY=your_api_key

# AI Analysis
ANTHROPIC_API_KEY=your_anthropic_key

# Rate limiting (requests per minute)
SCRAPE_RATE_LIMIT=10
```

## Testing

Run portal tests:
```bash
cd backend/backend
node scripts/test-scraping.js
node scripts/test-scraping.js --portal idealista
TEST_AI=true node scripts/test-scraping.js
```

## Troubleshooting

### CAPTCHA Challenges
- Most common issue
- Solution: Use Firecrawl with JavaScript rendering
- Alternative: Implement residential proxy rotation

### Rate Limiting
- Error: "Too many requests"
- Solution: Add delays between requests
- Recommended: 2-5 seconds between analyses

### Data Extraction Failures
- Check site selectors in `browserScraper.js`
- Portal HTML structure may have changed
- Update selectors as needed

## Roadmap

1. **Short-term:** Improve Firecrawl integration
2. **Medium-term:** Add Puppeteer/Playwright for local rendering
3. **Long-term:** Implement residential proxy rotation

---

*This document is maintained alongside the codebase. Update when portal structures change.*
