# ProprScout Security Audit Report

**Date:** 2025-11-29
**Auditor:** Claude Code Security Scanner
**Version:** 1.0.0

---

## Executive Summary

This security audit identified **3 critical issues**, **4 warnings**, and **8 passed checks**. The critical issues must be addressed before production deployment.

---

## ❌ CRITICAL ISSUES (Must Fix Before Production)

### 1. Missing Authentication on User Data Routes

**Severity:** CRITICAL
**Location:** Multiple route files

The following routes expose user data without authentication:

| File | Route | Issue |
|------|-------|-------|
| `notifications.js` | `GET /api/notifications` | Accepts `user_id` from query params - anyone can read any user's notifications |
| `notifications.js` | `PUT /api/notifications/:id/read` | Accepts `user_id` from query params - anyone can mark any notification as read |
| `notifications.js` | `PUT /api/notifications/read-all` | Accepts `user_id` from query params |
| `notifications.js` | `DELETE /api/notifications/:id` | Accepts `user_id` from query params |
| `credits.js` | `GET /api/credits` | Accepts `user_id` from query params - anyone can view any user's credits |
| `dashboard.js` | `GET /api/dashboard/stats` | Accepts `user_id` from query params - leaks user analytics |
| `dashboard.js` | `GET /api/dashboard/activity` | Accepts `user_id` from query params |

**Impact:** Any attacker can access any user's notifications, credits, and analytics by simply passing a different `user_id` query parameter.

**Fix Required:**
```javascript
// Add requireAuth middleware and use req.user._id instead of query params
import { requireAuth } from '../middleware/auth.js';

router.get('/', requireAuth, async (req, res) => {
  const user_id = req.user._id; // Use authenticated user, not query param
  // ...
});
```

---

### 2. Missing Ownership Check on Property Delete

**Severity:** CRITICAL
**Location:** `backend/backend/routes/property.js:384`

```javascript
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await query('DELETE FROM properties WHERE id = $1 RETURNING id', [id]);
  // No auth check, no ownership verification
});
```

**Impact:** Any user can delete any property in the database.

**Fix Required:**
```javascript
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  // Verify ownership before deletion
  const result = await query(
    'DELETE FROM properties WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  // ...
});
```

---

### 3. Vulnerable Multer Version

**Severity:** CRITICAL
**Location:** `backend/backend/package.json`

The package-lock.json shows:
```
"multer": "1.4.5-lts.2" - "deprecated": "Multer 1.x is impacted by a number of vulnerabilities"
```

**Impact:** Known security vulnerabilities in file upload handling.

**Fix Required:**
```bash
npm install multer@2
```

---

## ⚠️ WARNINGS (Should Fix Before Production)

### 1. Password Validation Too Weak

**Location:** `backend/backend/routes/auth.js:54`

Current validation only checks minimum length:
```javascript
body('password').isLength({ min: 8 })
```

**Recommendation:** Add complexity requirements:
```javascript
body('password')
  .isLength({ min: 8 })
  .matches(/[A-Z]/).withMessage('Password must contain uppercase letter')
  .matches(/[a-z]/).withMessage('Password must contain lowercase letter')
  .matches(/[0-9]/).withMessage('Password must contain number')
```

---

### 2. Default Database Credentials in Code

**Location:** `backend/backend/database/init.js:22-23`

```javascript
user: process.env.DB_USER || 'postgres',
password: process.env.DB_PASSWORD || 'password',
```

**Issue:** Default password 'password' could be used accidentally in production.

**Recommendation:** Remove defaults for production or fail if not set.

---

### 3. MongoDB URI Has Local Fallback

**Location:** `backend/backend/database/mongodb.js:8`

```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/proprscout';
```

**Issue:** Could accidentally connect to local MongoDB instead of production.

**Recommendation:** In production, require MONGODB_URI to be set explicitly.

---

### 4. Property Routes Missing Authentication

**Location:** `backend/backend/routes/property.js`

These public endpoints could be abused for scraping:

| Route | Issue |
|-------|-------|
| `POST /api/properties/scrape` | No auth - anyone can trigger scraping |
| `POST /api/properties/analyze-url` | No auth - anyone can use AI analysis |
| `GET /api/properties` | No auth - full property listing exposed |
| `GET /api/properties/stats` | No auth - statistics exposed |

**Recommendation:** Add `requireAuth` or rate limiting per user.

---

## ✅ PASSED CHECKS

### 1. No Hardcoded Secrets ✅
- No API keys found in source code
- Stripe keys properly checked (sk_test_... pattern)
- JWT_SECRET loaded from environment only

### 2. SSRF Protection ✅
**Location:** `backend/backend/lib/scrapers/urlParser.js`

Properly blocks:
- localhost, 127.0.0.1, 0.0.0.0, ::1
- Private IP ranges: 10.x.x.x, 172.16-31.x.x, 192.168.x.x
- Link-local: 169.254.x.x
- Non-HTTP protocols (file://, javascript://, data://)

### 3. Rate Limiting ✅
**Location:** `backend/backend/server.js:101-107`

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
});
```

Auth endpoints have additional stricter limits.

### 4. CORS Configuration ✅
**Location:** `backend/backend/server.js:72-98`

- Not using wildcard `*` in production
- Specific origins whitelisted
- Credentials properly enabled
- localhost only allowed in development

### 5. Security Headers (Helmet) ✅
**Location:** `backend/backend/server.js:59-69`

Helmet.js configured with:
- Content Security Policy
- Default security headers

### 6. Password Hashing ✅
**Location:** `backend/backend/models/User.js:290`

- bcrypt with cost factor 12 (good)
- Password not returned by default (`select: false`)

### 7. JWT Security ✅
**Location:** `backend/backend/middleware/auth.js`

- JWT_SECRET required (fails if not set)
- 24h token expiry (configurable)
- Token blacklist on logout
- Refresh token mechanism exists

### 8. File Upload Security ✅
**Location:** `backend/backend/routes/detective.js:22-30`

```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    // MIME type validation
  }
});
```

---

## Environment Variables Audit

### Required (No Defaults - Secure) ✅
| Variable | Status |
|----------|--------|
| `JWT_SECRET` | Required - fails if not set |
| `STRIPE_SECRET_KEY` | Optional - gracefully disabled |
| `STRIPE_WEBHOOK_SECRET` | Optional - gracefully disabled |

### Has Fallback Defaults ⚠️
| Variable | Default | Risk |
|----------|---------|------|
| `MONGODB_URI` | `mongodb://localhost:27017/proprscout` | Medium |
| `DB_PASSWORD` | `password` | Medium |
| `REDIS_HOST` | `localhost` | Low |
| `PORT` | `3001` | None |

---

## Recommendations Summary

### Immediate Actions (Before Production)

1. **Add authentication to notification, credits, dashboard routes**
2. **Add ownership verification to property delete**
3. **Upgrade multer to version 2.x**

### Short-Term Improvements

4. Strengthen password validation requirements
5. Remove default database credentials
6. Add authentication to property scraping routes
7. Require MONGODB_URI in production

### Long-Term Improvements

8. Implement request signing for sensitive operations
9. Add audit logging for admin actions
10. Implement IP-based anomaly detection

---

## Compliance Notes

- **GDPR:** User data endpoints need authentication fixes
- **OWASP Top 10:** Broken Access Control identified (A01:2021)
- **PCI DSS:** Not applicable if not storing card data directly

---

**Report Generated:** 2025-11-29
**Next Audit Recommended:** Before production deployment
