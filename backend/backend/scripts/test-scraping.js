#!/usr/bin/env node
/**
 * ProprScout Portal Testing Script
 * Tests scraping functionality against real Portuguese property portals
 *
 * Usage:
 *   node scripts/test-scraping.js                    # Run all tests
 *   node scripts/test-scraping.js --portal idealista # Test specific portal
 *   TEST_AI=true node scripts/test-scraping.js      # Include AI analysis
 */

import { scrapeProperty } from '../lib/scrapers/propertyScraper.js';
import { analyzeProperty } from '../lib/analysis/propertyAnalyzer.js';
import { analyzeListingWithAI, isConfigured as isAIConfigured } from '../services/anthropic.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Test URLs - Real active listings from Portuguese portals
// These URLs should be updated periodically as listings expire
const TEST_URLS = [
  {
    portal: 'Idealista',
    url: 'https://www.idealista.pt/imovel/33839962/',
    description: 'T2 apartment (test listing)'
  },
  {
    portal: 'Imovirtual',
    url: 'https://www.imovirtual.com/pt/anuncio/apartamento-t2-em-excelente-estado-em-queluz-ID1G3PE',
    description: 'T2 apartment Queluz'
  },
  {
    portal: 'Supercasa',
    url: 'https://supercasa.pt/comprar-apartamentos/queluz/apartamento-t2,1cced3a7-dd9e-11ef-ad04-0617e11787f4',
    description: 'T2 apartment'
  },
  {
    portal: 'Casa Sapo',
    url: 'https://casa.sapo.pt/comprar-apartamentos/lisboa/',
    description: 'Lisbon apartment listing'
  }
];

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
}

function logSubsection(title) {
  console.log(`\n${colors.blue}--- ${title} ---${colors.reset}`);
}

async function testPortal(testCase) {
  logSection(`Testing: ${testCase.portal}`);
  log(`URL: ${testCase.url}`, 'cyan');
  log(`Description: ${testCase.description}`);

  const result = {
    portal: testCase.portal,
    url: testCase.url,
    success: false,
    scrapeTime: null,
    data: null,
    scores: null,
    aiAnalysis: null,
    error: null
  };

  try {
    // Step 1: Scrape the listing
    logSubsection('1. Scraping listing');
    const startScrape = Date.now();
    const scrapedData = await scrapeProperty(testCase.url);
    result.scrapeTime = Date.now() - startScrape;
    result.data = scrapedData;

    log(`   ✓ Scraped in ${result.scrapeTime}ms`, 'green');

    // Log scraped data summary
    console.log('\n   Scraped Data:');
    console.log(`   - Title: ${scrapedData.title || colors.yellow + 'NOT FOUND' + colors.reset}`);
    console.log(`   - Price: ${scrapedData.price ? `€${scrapedData.price.toLocaleString()}` : colors.yellow + 'NOT FOUND' + colors.reset}`);
    console.log(`   - Area: ${scrapedData.area ? `${scrapedData.area}m²` : colors.yellow + 'NOT FOUND' + colors.reset}`);
    console.log(`   - Price/m²: ${scrapedData.price && scrapedData.area ? `€${Math.round(scrapedData.price / scrapedData.area).toLocaleString()}/m²` : colors.yellow + 'N/A' + colors.reset}`);
    console.log(`   - Bedrooms: ${scrapedData.rooms ?? scrapedData.bedrooms ?? colors.yellow + 'NOT FOUND' + colors.reset}`);
    console.log(`   - Bathrooms: ${scrapedData.bathrooms ?? colors.yellow + 'NOT FOUND' + colors.reset}`);
    console.log(`   - Location: ${scrapedData.location || colors.yellow + 'NOT FOUND' + colors.reset}`);
    console.log(`   - Photos: ${scrapedData.images?.length || 0}`);
    console.log(`   - Features: ${scrapedData.features?.length || 0}`);
    console.log(`   - Description: ${scrapedData.description?.length || 0} chars`);

    // Step 2: Calculate scores
    logSubsection('2. Calculating scores');
    const analysis = analyzeProperty(scrapedData);
    result.scores = analysis;

    log(`   ✓ Scores calculated`, 'green');
    console.log(`   - Overall Score: ${analysis.overallScore.score}/100`);
    console.log(`   - Listing Quality: ${analysis.listingQuality.score}/100`);
    console.log(`   - Space Efficiency: ${analysis.priceEfficiency.score}/100`);
    console.log(`   - Data Completeness: ${analysis.dataCompleteness.score}/100`);

    // Step 3: AI Analysis (optional)
    if (process.env.TEST_AI === 'true' && isAIConfigured()) {
      logSubsection('3. Running AI analysis');
      const startAI = Date.now();
      const aiAnalysis = await analyzeListingWithAI(scrapedData);
      const aiTime = Date.now() - startAI;
      result.aiAnalysis = aiAnalysis;

      log(`   ✓ AI analysis in ${aiTime}ms`, 'green');
      if (!aiAnalysis.error) {
        console.log(`   - Quality Assessment: ${aiAnalysis.listingQuality?.summary || 'N/A'}`);
        console.log(`   - Pricing: ${aiAnalysis.pricingInsight?.assessment || 'N/A'}`);
        console.log(`   - Opportunities: ${aiAnalysis.opportunities?.length || 0}`);
      } else {
        log(`   - AI analysis returned error`, 'yellow');
      }
    } else if (process.env.TEST_AI === 'true') {
      log(`   ⚠ AI analysis skipped - API key not configured`, 'yellow');
    }

    result.success = true;
    log(`\n✓ ${testCase.portal} - PASSED`, 'green');

  } catch (error) {
    result.error = error.message;
    log(`\n✗ ${testCase.portal} - FAILED: ${error.message}`, 'red');
  }

  return result;
}

async function runAllTests(portalFilter = null) {
  console.log('\n');
  logSection('ProprScout Portal Testing');
  log(`Started: ${new Date().toISOString()}`);
  log(`AI Testing: ${process.env.TEST_AI === 'true' ? 'Enabled' : 'Disabled'}`);

  if (portalFilter) {
    log(`Portal Filter: ${portalFilter}`);
  }

  const results = [];
  const testsToRun = portalFilter
    ? TEST_URLS.filter(t => t.portal.toLowerCase() === portalFilter.toLowerCase())
    : TEST_URLS;

  if (testsToRun.length === 0) {
    log(`\nNo tests found for portal: ${portalFilter}`, 'yellow');
    log('Available portals: ' + TEST_URLS.map(t => t.portal).join(', '));
    return;
  }

  for (const testCase of testsToRun) {
    const result = await testPortal(testCase);
    results.push(result);

    // Add delay between tests to avoid rate limiting
    if (testsToRun.indexOf(testCase) < testsToRun.length - 1) {
      log('\nWaiting 2 seconds before next test...', 'cyan');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  logSection('TEST SUMMARY');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\nTotal Tests: ${results.length}`);
  log(`Passed: ${successful.length}`, 'green');
  log(`Failed: ${failed.length}`, failed.length > 0 ? 'red' : 'green');

  if (successful.length > 0) {
    log('\n✓ Working Portals:', 'green');
    successful.forEach(r => {
      const pricePerM2 = r.data?.price && r.data?.area
        ? `€${Math.round(r.data.price / r.data.area)}/m²`
        : 'N/A';
      console.log(`  - ${r.portal}: ${r.data?.title?.substring(0, 40) || 'Unknown'}... (${pricePerM2})`);
    });
  }

  if (failed.length > 0) {
    log('\n✗ Failed Portals:', 'red');
    failed.forEach(r => console.log(`  - ${r.portal}: ${r.error}`));
  }

  // Save results to file
  const resultsDir = path.join(__dirname, '..', '..', '..', 'docs');
  try {
    fs.mkdirSync(resultsDir, { recursive: true });
  } catch (e) { /* ignore if exists */ }

  const resultsFile = path.join(resultsDir, 'test-results.json');
  const summaryFile = path.join(resultsDir, 'PORTAL_SUPPORT.md');

  // Save JSON results
  const jsonResults = results.map(r => ({
    portal: r.portal,
    url: r.url,
    success: r.success,
    scrapeTime: r.scrapeTime,
    error: r.error,
    dataExtracted: r.data ? {
      title: !!r.data.title,
      price: !!r.data.price,
      area: !!r.data.area,
      rooms: !!(r.data.rooms || r.data.bedrooms),
      bathrooms: !!r.data.bathrooms,
      location: !!r.data.location,
      photos: r.data.images?.length || 0,
      features: r.data.features?.length || 0,
      description: r.data.description?.length || 0
    } : null,
    scores: r.scores ? {
      overall: r.scores.overallScore?.score,
      listingQuality: r.scores.listingQuality?.score,
      spaceEfficiency: r.scores.priceEfficiency?.score,
      dataCompleteness: r.scores.dataCompleteness?.score
    } : null,
    testedAt: new Date().toISOString()
  }));

  fs.writeFileSync(resultsFile, JSON.stringify(jsonResults, null, 2));
  log(`\nResults saved to: ${resultsFile}`, 'cyan');

  // Generate markdown summary
  const markdown = generatePortalSupportMarkdown(results);
  fs.writeFileSync(summaryFile, markdown);
  log(`Portal support docs saved to: ${summaryFile}`, 'cyan');

  // Return exit code based on results
  return failed.length === 0 ? 0 : 1;
}

function generatePortalSupportMarkdown(results) {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  let md = `# ProprScout Portal Support Status

**Last Updated:** ${new Date().toISOString().split('T')[0]}
**Test Run:** ${new Date().toISOString()}

## Summary

| Status | Count |
|--------|-------|
| Fully Supported | ${successful.length} |
| Not Working | ${failed.length} |

## Fully Supported Portals

`;

  if (successful.length > 0) {
    md += `| Portal | Scraping | Data Quality | Notes |
|--------|----------|--------------|-------|
`;
    successful.forEach(r => {
      const dataQuality = r.scores?.overallScore?.score >= 60 ? 'Good' : 'Fair';
      const notes = [];
      if (!r.data?.price) notes.push('Price sometimes missing');
      if (!r.data?.area) notes.push('Area sometimes missing');
      if ((r.data?.images?.length || 0) < 3) notes.push('Limited photos');
      md += `| ${r.portal} | ✅ | ${dataQuality} | ${notes.join(', ') || 'All fields extracted'} |\n`;
    });
  } else {
    md += `*No fully supported portals at this time.*\n`;
  }

  md += `
## Not Working

`;

  if (failed.length > 0) {
    md += `| Portal | Issue | Workaround |
|--------|-------|------------|
`;
    failed.forEach(r => {
      let workaround = 'None currently';
      if (r.error?.includes('anti-bot') || r.error?.includes('CAPTCHA')) {
        workaround = 'Server-side scraping needed';
      } else if (r.error?.includes('timeout')) {
        workaround = 'Retry or use alternative portal';
      }
      md += `| ${r.portal} | ${r.error?.substring(0, 50) || 'Unknown'} | ${workaround} |\n`;
    });
  } else {
    md += `*All tested portals are working!*\n`;
  }

  md += `
## Data Extraction Details

`;

  results.forEach(r => {
    md += `### ${r.portal}

- **Status:** ${r.success ? '✅ Working' : '❌ Not Working'}
- **URL:** ${r.url}
- **Scrape Time:** ${r.scrapeTime ? r.scrapeTime + 'ms' : 'N/A'}

`;
    if (r.data) {
      md += `**Extracted Fields:**
| Field | Available | Value |
|-------|-----------|-------|
| Title | ${r.data.title ? '✅' : '❌'} | ${r.data.title?.substring(0, 40) || '-'}${r.data.title?.length > 40 ? '...' : ''} |
| Price | ${r.data.price ? '✅' : '❌'} | ${r.data.price ? '€' + r.data.price.toLocaleString() : '-'} |
| Area | ${r.data.area ? '✅' : '❌'} | ${r.data.area ? r.data.area + 'm²' : '-'} |
| Rooms | ${r.data.rooms || r.data.bedrooms ? '✅' : '❌'} | ${r.data.rooms || r.data.bedrooms || '-'} |
| Bathrooms | ${r.data.bathrooms ? '✅' : '❌'} | ${r.data.bathrooms || '-'} |
| Location | ${r.data.location ? '✅' : '❌'} | ${r.data.location?.substring(0, 30) || '-'}${r.data.location?.length > 30 ? '...' : ''} |
| Photos | ${r.data.images?.length > 0 ? '✅' : '❌'} | ${r.data.images?.length || 0} |
| Features | ${r.data.features?.length > 0 ? '✅' : '❌'} | ${r.data.features?.length || 0} items |
| Description | ${r.data.description?.length > 0 ? '✅' : '❌'} | ${r.data.description?.length || 0} chars |

`;
    }
    if (r.error) {
      md += `**Error:** \`${r.error}\`\n\n`;
    }
  });

  md += `## Known Limitations

1. **Rate Limiting** - Some portals may rate-limit requests. Add delays between analyses.
2. **Dynamic Content** - Pages with heavy JavaScript may not scrape fully.
3. **Anti-Bot Protection** - Some portals actively block automated scraping.
4. **URL Expiration** - Property listings expire. Test URLs need periodic updates.

## Recommendations

1. **Primary Portal:** Use Idealista for best results
2. **Fallback:** Imovirtual as secondary option
3. **Avoid:** Casa Sapo (anti-bot protection)

---

*This document is auto-generated by the ProprScout test suite.*
`;

  return md;
}

// Parse command line arguments
const args = process.argv.slice(2);
let portalFilter = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--portal' && args[i + 1]) {
    portalFilter = args[i + 1];
    i++;
  }
}

// Run tests
runAllTests(portalFilter)
  .then(exitCode => process.exit(exitCode || 0))
  .catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
