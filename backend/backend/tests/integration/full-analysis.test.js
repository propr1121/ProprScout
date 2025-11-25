#!/usr/bin/env node
/**
 * ProprScout Integration Tests
 * Tests the full analysis flow end-to-end
 *
 * Usage:
 *   node tests/integration/full-analysis.test.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

const API_BASE_URL = process.env.API_URL || 'http://localhost:3002';
const FLASK_URL = process.env.FLASK_URL || 'http://localhost:3001';

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function logTest(name, passed, message = '') {
  const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
  console.log(`  ${status} - ${name}${message ? `: ${message}` : ''}`);
  results.tests.push({ name, passed, message });
  if (passed) results.passed++;
  else results.failed++;
}

// Test helper to make API calls
async function apiCall(method, endpoint, body = null, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    clearTimeout(timeoutId);

    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    clearTimeout(timeoutId);
    return { status: 0, data: null, ok: false, error: error.message };
  }
}

// ==================== TEST SUITES ====================

async function testHealthEndpoints() {
  log('\n--- Health Check Tests ---', 'cyan');

  // Test Node.js backend health
  const nodeHealth = await apiCall('GET', '/api/health');
  logTest('Node.js backend health',
    nodeHealth.ok && nodeHealth.data?.status === 'healthy',
    nodeHealth.ok ? `Uptime: ${Math.round(nodeHealth.data?.uptime || 0)}s` : nodeHealth.error
  );

  // Test Flask backend health
  try {
    const flaskResponse = await fetch(`${FLASK_URL}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    const flaskData = await flaskResponse.json();
    logTest('Flask/GeoCLIP backend health',
      flaskResponse.ok && flaskData?.status === 'healthy',
      flaskData?.geoclip_service || 'Connected'
    );
  } catch (error) {
    logTest('Flask/GeoCLIP backend health', false, error.message);
  }
}

async function testAPIValidation() {
  log('\n--- API Validation Tests ---', 'cyan');

  // Test missing URL
  const noUrl = await apiCall('POST', '/api/properties/analyze-url', {});
  logTest('Rejects missing URL',
    !noUrl.ok && noUrl.status === 400,
    noUrl.ok ? 'Should have rejected' : 'Correctly rejected'
  );

  // Test invalid URL format
  const invalidUrl = await apiCall('POST', '/api/properties/analyze-url', { url: 'not-a-url' });
  logTest('Rejects invalid URL format',
    !invalidUrl.ok && invalidUrl.status === 400,
    invalidUrl.ok ? 'Should have rejected' : 'Correctly rejected'
  );

  // Test unsupported portal
  const unsupported = await apiCall('POST', '/api/properties/analyze-url', {
    url: 'https://www.zillow.com/homedetails/12345'
  });
  logTest('Rejects unsupported portal',
    !unsupported.ok,
    unsupported.ok ? 'Should have rejected' : 'Correctly rejected unsupported portal'
  );
}

async function testAnalysisEndpoint() {
  log('\n--- Analysis Endpoint Tests ---', 'cyan');

  // Test with a real Idealista URL (may fail due to anti-bot)
  const testUrl = 'https://www.idealista.pt/imovel/33839962/';
  log(`  Testing with URL: ${testUrl}`, 'blue');

  const startTime = Date.now();
  const analysis = await apiCall('POST', '/api/properties/analyze-url', { url: testUrl }, 60000);
  const duration = Date.now() - startTime;

  if (analysis.ok && analysis.data?.success) {
    logTest('Analysis endpoint responds', true, `Completed in ${duration}ms`);

    // Verify response structure
    const data = analysis.data.data;
    logTest('Response has propertyData', !!data?.propertyData);
    logTest('Response has analysis', !!data?.analysis);
    logTest('Response has analyzedAt timestamp', !!data?.analyzedAt);

    if (data?.analysis) {
      logTest('Analysis has overallScore',
        typeof data.analysis.overallScore?.score === 'number',
        data.analysis.overallScore?.score ? `Score: ${data.analysis.overallScore.score}/100` : ''
      );
      logTest('Analysis has listingQuality', !!data.analysis.listingQuality);
      logTest('Analysis has recommendations', Array.isArray(data.analysis.recommendations));
    }

    if (data?.analysis?.aiAnalysis) {
      const ai = data.analysis.aiAnalysis;
      logTest('AI analysis present', !ai.error, ai.error ? 'AI unavailable' : 'AI analysis received');
      if (!ai.error) {
        logTest('AI has opportunities', Array.isArray(ai.opportunities) && ai.opportunities.length > 0);
        logTest('AI has agent tips', Array.isArray(ai.agentTips) && ai.agentTips.length > 0);
      }
    }
  } else {
    // Anti-bot protection likely blocked us
    logTest('Analysis endpoint responds', false,
      analysis.data?.message || analysis.error || 'Portal blocking detected'
    );
    log('  Note: This may be due to anti-bot protection on the portal', 'yellow');
  }
}

async function testScoringSystem() {
  log('\n--- Scoring System Tests ---', 'cyan');

  // Import scoring module directly for unit testing
  try {
    const { analyzeProperty } = await import('../../lib/analysis/propertyAnalyzer.js');

    // Test with complete property data
    const completeProperty = {
      title: 'Apartamento T2 em Lisboa',
      price: 350000,
      area: 85,
      rooms: 2,
      bathrooms: 1,
      location: 'Lisboa, Portugal',
      description: 'Excelente apartamento renovado no centro de Lisboa com vista para o rio.',
      features: ['Elevador', 'Estacionamento', 'Ar Condicionado', 'Aquecimento Central'],
      images: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 'img5.jpg']
    };

    const completeAnalysis = analyzeProperty(completeProperty);
    logTest('Scoring works with complete data',
      completeAnalysis.overallScore?.score > 0,
      `Score: ${completeAnalysis.overallScore?.score}/100`
    );
    logTest('Score is not placeholder 50',
      completeAnalysis.overallScore?.score !== 50,
      completeAnalysis.overallScore?.score === 50 ? 'Still showing placeholder' : 'Real calculation'
    );

    // Test with minimal property data
    const minimalProperty = {
      title: 'Property',
      price: null,
      area: null
    };

    const minimalAnalysis = analyzeProperty(minimalProperty);
    logTest('Scoring handles minimal data',
      typeof minimalAnalysis.overallScore?.score === 'number',
      `Score: ${minimalAnalysis.overallScore?.score}/100`
    );

    // Verify score breakdown exists
    logTest('Score breakdown present',
      !!completeAnalysis.overallScore?.breakdown,
      Object.keys(completeAnalysis.overallScore?.breakdown || {}).join(', ')
    );

  } catch (error) {
    logTest('Scoring module loads', false, error.message);
  }
}

async function testErrorHandling() {
  log('\n--- Error Handling Tests ---', 'cyan');

  // Test 404 route
  const notFound = await apiCall('GET', '/api/nonexistent');
  logTest('Returns 404 for unknown routes',
    notFound.status === 404,
    `Status: ${notFound.status}`
  );

  // Test malformed JSON (would need raw fetch)
  // Skipping as it requires different approach

  // Test timeout handling (would need very slow endpoint)
  log('  Timeout handling: Manual verification required', 'yellow');
}

async function testGeolocationEndpoint() {
  log('\n--- Geolocation (GeoCLIP) Tests ---', 'cyan');

  // Check if Flask is running
  try {
    const healthCheck = await fetch(`${FLASK_URL}/api/health`, {
      signal: AbortSignal.timeout(5000)
    });

    if (healthCheck.ok) {
      const data = await healthCheck.json();
      logTest('GeoCLIP service available',
        data.geoclip_service === 'available',
        data.geoclip_service || 'Status unknown'
      );

      // Test with image URL would require actual image
      log('  Image geolocation: Requires manual test with property image', 'yellow');
    } else {
      logTest('Flask backend accessible', false, 'Service not responding');
    }
  } catch (error) {
    logTest('Flask backend accessible', false, error.message);
  }
}

// ==================== RUN ALL TESTS ====================

async function runAllTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║          ProprScout Integration Test Suite                  ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  log(`\nStarted: ${new Date().toISOString()}`);
  log(`API URL: ${API_BASE_URL}`);
  log(`Flask URL: ${FLASK_URL}`);

  await testHealthEndpoints();
  await testAPIValidation();
  await testScoringSystem();
  await testAnalysisEndpoint();
  await testGeolocationEndpoint();
  await testErrorHandling();

  // Summary
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    TEST SUMMARY                             ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  const total = results.passed + results.failed;
  const passRate = total > 0 ? Math.round((results.passed / total) * 100) : 0;

  log(`\nTotal Tests: ${total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : passRate >= 50 ? 'yellow' : 'red');

  if (results.failed > 0) {
    log('\nFailed Tests:', 'red');
    results.tests
      .filter(t => !t.passed)
      .forEach(t => log(`  - ${t.name}: ${t.message}`, 'red'));
  }

  log(`\nCompleted: ${new Date().toISOString()}`);

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

runAllTests().catch(error => {
  log(`\nTest suite crashed: ${error.message}`, 'red');
  process.exit(1);
});
