/**
 * API Contract Tests for ProprScout
 * Tests all API endpoints for correct responses
 *
 * Run with: node tests/api-contract.test.js
 */

import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3002';
let authToken = null;
let testUserId = null;
let testPropertyId = null;
let testAnalysisId = null;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  validateStatus: () => true // Don't throw on any status
});

// Test results tracking
const results = {
  passed: [],
  failed: [],
  skipped: []
};

function log(status, endpoint, message) {
  const icon = status === 'pass' ? '\x1b[32m✅\x1b[0m' : status === 'fail' ? '\x1b[31m❌\x1b[0m' : '\x1b[33m⏭️\x1b[0m';
  console.log(`${icon} ${endpoint}: ${message}`);
  results[status === 'pass' ? 'passed' : status === 'fail' ? 'failed' : 'skipped'].push({ endpoint, message });
}

async function test(name, fn) {
  try {
    await fn();
    log('pass', name, 'OK');
  } catch (error) {
    const msg = error.response?.data?.error || error.response?.data?.message || error.message;
    log('fail', name, msg);
  }
}

async function skip(name, reason) {
  log('skip', name, reason);
}

// ============ TESTS ============

async function runTests() {
  console.log('\n\x1b[36m🧪 Starting ProprScout API Contract Tests...\x1b[0m\n');
  console.log(`📡 Testing against: ${API_URL}\n`);

  // ============ HEALTH ENDPOINTS ============
  console.log('\x1b[35m--- Health Endpoints ---\x1b[0m');

  await test('GET /api/health', async () => {
    const res = await api.get('/api/health');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.status) throw new Error('Missing status field');
  });

  await test('GET /api/health/live', async () => {
    const res = await api.get('/api/health/live');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('GET /api/health/ready', async () => {
    const res = await api.get('/api/health/ready');
    if (res.status !== 200 && res.status !== 503) throw new Error(`Expected 200 or 503, got ${res.status}`);
  });

  await test('GET /api/health/detailed', async () => {
    const res = await api.get('/api/health/detailed');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // ============ AUTH ENDPOINTS ============
  console.log('\n\x1b[35m--- Auth Endpoints ---\x1b[0m');

  // Registration (may fail if user exists or invite required)
  await test('POST /api/auth/register', async () => {
    const res = await api.post('/api/auth/register', {
      email: 'apitest@proprscout.test',
      password: 'TestPass123!',
      name: 'API Test User',
      inviteCode: 'TESTCODE'
    });
    // 201 = created, 409 = already exists, 400 = validation error (no invite code)
    if (![200, 201, 400, 409].includes(res.status)) {
      throw new Error(`Expected 201/400/409, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
    if (res.status === 201 || res.status === 200) {
      authToken = res.data.token;
      testUserId = res.data.user?._id || res.data.user?.id;
    }
  });

  // Login
  await test('POST /api/auth/login', async () => {
    const res = await api.post('/api/auth/login', {
      email: 'apitest@proprscout.test',
      password: 'TestPass123!'
    });
    if (res.status === 200) {
      authToken = res.data.token;
      testUserId = res.data.user?._id || res.data.user?.id;
    } else if (res.status !== 401 && res.status !== 404) {
      throw new Error(`Expected 200/401/404, got ${res.status}`);
    }
  });

  // Login with bad credentials
  await test('POST /api/auth/login (bad credentials)', async () => {
    const res = await api.post('/api/auth/login', {
      email: 'apitest@proprscout.test',
      password: 'WrongPassword!'
    });
    if (res.status !== 401 && res.status !== 404) {
      throw new Error(`Expected 401/404, got ${res.status}`);
    }
  });

  // Get profile (requires auth)
  await test('GET /api/auth/me', async () => {
    if (!authToken) {
      throw new Error('No auth token - skipping');
    }
    const res = await api.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.email && !res.data.user?.email) throw new Error('Missing email in response');
  });

  // Get profile without token
  await test('GET /api/auth/me (no token)', async () => {
    const res = await api.get('/api/auth/me');
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // Update profile
  await test('PUT /api/auth/me', async () => {
    if (!authToken) throw new Error('No auth token - skipping');
    const res = await api.put('/api/auth/me',
      { name: 'Updated Test User' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // Get referral code
  await test('GET /api/auth/referral-code', async () => {
    if (!authToken) throw new Error('No auth token - skipping');
    const res = await api.get('/api/auth/referral-code', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // Refresh token
  await test('POST /api/auth/refresh', async () => {
    const res = await api.post('/api/auth/refresh', {
      refreshToken: 'invalid_token'
    });
    // Should return 401 for invalid token
    if (res.status !== 401 && res.status !== 400) {
      throw new Error(`Expected 401/400, got ${res.status}`);
    }
  });

  // ============ PRICING ENDPOINTS ============
  console.log('\n\x1b[35m--- Pricing Endpoints ---\x1b[0m');

  await test('GET /api/pricing/plans', async () => {
    const res = await api.get('/api/pricing/plans');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.plans && !res.data.data?.plans && !Array.isArray(res.data)) {
      throw new Error('Missing plans data');
    }
  });

  await test('GET /api/pricing/features', async () => {
    const res = await api.get('/api/pricing/features');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('GET /api/pricing/faq', async () => {
    const res = await api.get('/api/pricing/faq');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('GET /api/pricing/user-status', async () => {
    const res = await api.get('/api/pricing/user-status');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // ============ CREDITS ENDPOINTS ============
  console.log('\n\x1b[35m--- Credits Endpoints ---\x1b[0m');

  await test('GET /api/credits', async () => {
    const res = await api.get('/api/credits');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.data && res.data.balance === undefined) {
      throw new Error('Missing credits data');
    }
  });

  // ============ DASHBOARD ENDPOINTS ============
  console.log('\n\x1b[35m--- Dashboard Endpoints ---\x1b[0m');

  await test('GET /api/dashboard/stats', async () => {
    const res = await api.get('/api/dashboard/stats');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('GET /api/dashboard/activity', async () => {
    const res = await api.get('/api/dashboard/activity');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // ============ NOTIFICATIONS ENDPOINTS ============
  console.log('\n\x1b[35m--- Notifications Endpoints ---\x1b[0m');

  await test('GET /api/notifications', async () => {
    const res = await api.get('/api/notifications');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('PUT /api/notifications/read-all', async () => {
    const res = await api.put('/api/notifications/read-all');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // ============ DETECTIVE ENDPOINTS ============
  console.log('\n\x1b[35m--- Detective Endpoints ---\x1b[0m');

  await test('GET /api/detective/quota', async () => {
    if (!authToken) throw new Error('No auth token - requires auth');
    const res = await api.get('/api/detective/quota', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('GET /api/detective/quota (no auth)', async () => {
    const res = await api.get('/api/detective/quota');
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  await test('GET /api/detective/history', async () => {
    if (!authToken) throw new Error('No auth token - requires auth');
    const res = await api.get('/api/detective/history', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('GET /api/detective/stats', async () => {
    const res = await api.get('/api/detective/stats');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // ============ PROPERTY ENDPOINTS ============
  console.log('\n\x1b[35m--- Property Endpoints ---\x1b[0m');

  await test('GET /api/properties', async () => {
    const res = await api.get('/api/properties');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('POST /api/properties/scrape (invalid URL)', async () => {
    const res = await api.post('/api/properties/scrape', {
      url: 'not-a-valid-url'
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  await test('POST /api/properties/scrape (valid URL format)', async () => {
    const res = await api.post('/api/properties/scrape', {
      url: 'https://www.idealista.pt/imovel/12345678/'
    });
    // Could return 200 (scraped), 400 (bad URL), or 500 (scraping failed)
    if (![200, 400, 500].includes(res.status)) {
      throw new Error(`Expected 200/400/500, got ${res.status}`);
    }
  });

  await test('GET /api/properties/:id (non-existent)', async () => {
    const res = await api.get('/api/properties/99999999');
    if (res.status !== 404 && res.status !== 500) {
      throw new Error(`Expected 404/500, got ${res.status}`);
    }
  });

  // ============ GEOLOCATION ENDPOINTS ============
  console.log('\n\x1b[35m--- Geolocation Endpoints ---\x1b[0m');

  await test('GET /api/geolocation/history', async () => {
    const res = await api.get('/api/geolocation/history');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('GET /api/geolocation/stats', async () => {
    const res = await api.get('/api/geolocation/stats');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('POST /api/geolocation/reverse-geocode', async () => {
    const res = await api.post('/api/geolocation/reverse-geocode', {
      lat: 38.7223,
      lon: -9.1393
    });
    if (res.status !== 200 && res.status !== 400) {
      throw new Error(`Expected 200/400, got ${res.status}`);
    }
  });

  await test('POST /api/geolocation/forward-geocode', async () => {
    const res = await api.post('/api/geolocation/forward-geocode', {
      address: 'Lisbon, Portugal'
    });
    if (res.status !== 200 && res.status !== 400) {
      throw new Error(`Expected 200/400, got ${res.status}`);
    }
  });

  // ============ ANALYSIS ENDPOINTS ============
  console.log('\n\x1b[35m--- Analysis Endpoints ---\x1b[0m');

  await test('GET /api/analysis', async () => {
    const res = await api.get('/api/analysis');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('GET /api/analysis/stats', async () => {
    const res = await api.get('/api/analysis/stats');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // ============ REFERRALS ENDPOINTS ============
  console.log('\n\x1b[35m--- Referrals Endpoints ---\x1b[0m');

  await test('GET /api/referrals/stats', async () => {
    const res = await api.get('/api/referrals/stats');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('GET /api/referrals/leaderboard', async () => {
    const res = await api.get('/api/referrals/leaderboard');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test('GET /api/referrals/validate', async () => {
    const res = await api.get('/api/referrals/validate?code=TESTCODE');
    // Valid code returns 200, invalid returns 404 or 400
    if (![200, 400, 404].includes(res.status)) {
      throw new Error(`Expected 200/400/404, got ${res.status}`);
    }
  });

  // ============ INVITE ENDPOINTS ============
  console.log('\n\x1b[35m--- Invite Endpoints ---\x1b[0m');

  await test('GET /api/invite/check/:code', async () => {
    const res = await api.get('/api/invite/check/TESTCODE');
    // Valid code returns 200, invalid returns 404
    if (![200, 404].includes(res.status)) {
      throw new Error(`Expected 200/404, got ${res.status}`);
    }
  });

  await test('POST /api/invite/validate', async () => {
    const res = await api.post('/api/invite/validate', {
      code: 'TESTCODE'
    });
    if (![200, 400, 404].includes(res.status)) {
      throw new Error(`Expected 200/400/404, got ${res.status}`);
    }
  });

  // ============ PAYMENTS ENDPOINTS ============
  console.log('\n\x1b[35m--- Payments Endpoints ---\x1b[0m');

  await test('POST /api/payments/create-intent', async () => {
    const res = await api.post('/api/payments/create-intent', {
      amount: 1000,
      currency: 'eur'
    });
    // Stripe may not be configured, so accept multiple statuses
    if (![200, 400, 500, 503].includes(res.status)) {
      throw new Error(`Expected 200/400/500/503, got ${res.status}`);
    }
  });

  await test('GET /api/payments/status/:id', async () => {
    const res = await api.get('/api/payments/status/pi_test_invalid');
    // Stripe may not be configured
    if (![200, 400, 404, 500, 503].includes(res.status)) {
      throw new Error(`Expected 200/400/404/500/503, got ${res.status}`);
    }
  });

  // ============ ADMIN ENDPOINTS (Protected) ============
  console.log('\n\x1b[35m--- Admin Endpoints ---\x1b[0m');

  await test('GET /api/admin/stats (no auth)', async () => {
    const res = await api.get('/api/admin/stats');
    if (res.status !== 401 && res.status !== 403) {
      throw new Error(`Expected 401/403, got ${res.status}`);
    }
  });

  await test('GET /api/admin/users (no auth)', async () => {
    const res = await api.get('/api/admin/users');
    if (res.status !== 401 && res.status !== 403) {
      throw new Error(`Expected 401/403, got ${res.status}`);
    }
  });

  await test('GET /api/admin/invite-codes (no auth)', async () => {
    const res = await api.get('/api/admin/invite-codes');
    if (res.status !== 401 && res.status !== 403) {
      throw new Error(`Expected 401/403, got ${res.status}`);
    }
  });

  // ============ LOGOUT (Last) ============
  console.log('\n\x1b[35m--- Logout ---\x1b[0m');

  if (authToken) {
    await test('POST /api/auth/logout', async () => {
      const res = await api.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    });

    // Token should be blacklisted
    await test('GET /api/auth/me (after logout)', async () => {
      const res = await api.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.status !== 401) throw new Error(`Expected 401 (token blacklisted), got ${res.status}`);
    });
  } else {
    skip('POST /api/auth/logout', 'No auth token available');
    skip('GET /api/auth/me (after logout)', 'No auth token available');
  }

  // ============ SUMMARY ============
  console.log('\n\x1b[36m📊 Test Results:\x1b[0m');
  console.log(`   \x1b[32m✅ Passed: ${results.passed.length}\x1b[0m`);
  console.log(`   \x1b[31m❌ Failed: ${results.failed.length}\x1b[0m`);
  console.log(`   \x1b[33m⏭️ Skipped: ${results.skipped.length}\x1b[0m`);

  if (results.failed.length > 0) {
    console.log('\n\x1b[31m❌ Failed Tests:\x1b[0m');
    results.failed.forEach(f => console.log(`   - ${f.endpoint}: ${f.message}`));
  }

  if (results.skipped.length > 0) {
    console.log('\n\x1b[33m⏭️ Skipped Tests:\x1b[0m');
    results.skipped.forEach(s => console.log(`   - ${s.endpoint}: ${s.message}`));
  }

  const exitCode = results.failed.length > 0 ? 1 : 0;
  console.log(`\n${exitCode === 0 ? '\x1b[32m✅ All tests passed!\x1b[0m' : '\x1b[31m❌ Some tests failed\x1b[0m'}\n`);

  return exitCode;
}

runTests()
  .then(exitCode => process.exit(exitCode))
  .catch(err => {
    console.error('\x1b[31mTest runner error:\x1b[0m', err);
    process.exit(1);
  });
