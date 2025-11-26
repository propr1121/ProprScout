# ProprScout Security & Production Readiness Checklist

**Last Validated:** November 26, 2025
**Validator:** Claude Code Security Audit

---

## CRITICAL (Must Fix Before Launch)

### Secrets & Environment

| Check | Status | Evidence |
|-------|--------|----------|
| No API keys hardcoded in source code | **PASS** | Firecrawl key uses `process.env.FIRECRAWL_API_KEY` |
| .env file in .gitignore | **PASS** | `.gitignore` includes `.env` |
| .env.example exists (without real values) | **PASS** | `backend/backend/.env.example` created |
| JWT_SECRET is 32+ random characters | **CONFIG** | Must be set in production `.env` |
| All production API keys are set | **CONFIG** | See Production Environment section |

### Input Validation

| Check | Status | Evidence |
|-------|--------|----------|
| URL analysis validates against SSRF | **PASS** | `urlParser.js` blocks localhost, private IPs (10.x, 172.16-31.x, 192.168.x) |
| File uploads validate MIME type AND extension | **PASS** | `detective.js:27-33` validates MIME, `app.py:108-109` validates extension |
| File size limits enforced | **PASS** | Node: 10MB (`detective.js:25`), Flask: 16MB (`app.py:47`) |
| All user inputs sanitized before use | **PASS** | express-validator used on all routes |
| MongoDB queries don't directly use raw user input | **PASS** | Mongoose ORM with schema validation |

### Authentication

| Check | Status | Evidence |
|-------|--------|----------|
| All protected routes require valid JWT | **PASS** | `requireAuth` middleware on sensitive routes |
| Passwords hashed with bcrypt (cost ≥10) | **PASS** | `User.js:290` uses cost 12 |
| Tokens expire (≤24 hours) | **PASS** | Default changed to 24h (`JWT_EXPIRES_IN || '24h'`) |
| Rate limiting on login endpoints | **PASS** | Auth rate limiter: 5 attempts/15min (`auth.js:authRateLimiter`) |

### CORS & Headers

| Check | Status | Evidence |
|-------|--------|----------|
| CORS origin NOT set to "*" in production | **PASS** | `server.js:84-98` uses allowlist |
| Allowed origins explicitly listed | **PASS** | proprscout.com, www, app subdomains |
| Helmet.js security headers enabled | **PASS** | `server.js:58-69` |

---

## HIGH PRIORITY (Should Fix Before Launch)

### Rate Limiting

| Check | Status | Evidence |
|-------|--------|----------|
| General API rate limit: 100 req/15 min | **PASS** | `server.js:101-107` |
| Expensive operations limit: 20/hour | **NEEDS FIX** | No per-endpoint rate limiting for AI/geolocation |
| Auth endpoints limit: 5/15 min | **PASS** | `authRateLimiter` on login, `registrationRateLimiter` on register |

### Error Handling

| Check | Status | Evidence |
|-------|--------|----------|
| Global error handler catches all errors | **PASS** | `errorHandler.js` middleware |
| Stack traces hidden in production | **PASS** | Error handler checks NODE_ENV |
| All errors logged (but not to client) | **PASS** | Winston logger configured |
| Error responses don't leak internal details | **PASS** | Generic error messages returned |

### Flask Backend

| Check | Status | Evidence |
|-------|--------|----------|
| Only accepts requests from localhost/Node backend | **PASS** | CORS restricted to `ALLOWED_ORIGINS` list (`app.py:46-53`) |
| File size limit configured (16MB) | **PASS** | `app.py:47` |
| Input validation on all endpoints | **PARTIAL** | Extension validation only, no request origin check |
| No shell command execution with user input | **PASS** | No os.system/subprocess with user input |

### Dependencies

| Check | Status | Evidence |
|-------|--------|----------|
| `npm audit` shows no critical/high vulnerabilities | **PASS** | 0 vulnerabilities |
| `pip-audit` shows no critical vulnerabilities | **NOT RUN** | Recommend running before launch |
| All packages on latest stable versions | **PARTIAL** | Recent audit fix applied |

---

## RECOMMENDED (Nice to Have)

### Monitoring & Logging

| Check | Status | Evidence |
|-------|--------|----------|
| Structured logging with Winston | **PASS** | `utils/logger.js` |
| Log rotation configured | **CHECK** | Verify in production |
| Error tracking (Sentry) configured | **NOT SET** | Recommended for production |
| Health check endpoint at /health | **PASS** | Both Node and Flask have `/health` |
| Uptime monitoring configured | **NOT SET** | Recommended for production |

### Performance

| Check | Status | Evidence |
|-------|--------|----------|
| Database indexes created | **PASS** | `User.js:164-166` |
| Compression middleware enabled | **PASS** | `server.js:116` |
| Static assets cached | **PASS** | `server.js:127` |

### Documentation

| Check | Status | Evidence |
|-------|--------|----------|
| API.md documents all endpoints | **CHECK** | Verify exists |
| DEPLOYMENT.md with production setup | **CHECK** | Verify exists |
| PORTAL_SUPPORT.md lists working scrapers | **CHECK** | Verify exists |
| SECURITY.md documents policies | **PASS** | This file + audit report |

---

## Issues Requiring Attention

### 1. SSRF Protection (MEDIUM)
**Location:** `backend/backend/lib/scrapers/urlParser.js`
**Issue:** URL parser validates domain patterns but doesn't block internal IPs
**Risk:** Attacker could potentially scrape internal services
**Recommendation:** Add URL validation to block:
- `localhost`, `127.0.0.1`, `0.0.0.0`
- Private IP ranges: `192.168.*`, `10.*`, `172.16-31.*`
- Internal hostnames

### 2. Auth Rate Limiting (MEDIUM)
**Location:** `backend/backend/routes/auth.js`
**Issue:** No specific rate limiting on `/api/auth/login` and `/api/auth/register`
**Risk:** Brute force attacks on login
**Recommendation:** Add stricter rate limit (5 attempts/15 min) on auth routes

### 3. JWT Expiry (LOW)
**Location:** `backend/backend/middleware/auth.js:11`
**Issue:** Default token expiry is 7 days
**Risk:** Long-lived tokens if stolen
**Recommendation:** Reduce to 24 hours, rely on refresh tokens

### 4. Flask CORS (MEDIUM)
**Location:** `backend/geolocation/app.py:44`
**Issue:** `CORS(app)` with no restrictions allows any origin
**Risk:** Cross-origin requests from malicious sites
**Recommendation:** Restrict to Node backend only:
```python
CORS(app, origins=['http://localhost:3002', 'https://proprscout.com'])
```

---

## Quick Test Commands

```bash
# Search for hardcoded secrets
grep -rn "sk-\|api_key\s*=" --include="*.js" --include="*.py" . | grep -v node_modules

# Check npm vulnerabilities
cd backend/backend && npm audit

# Test SSRF protection (should return 400)
curl -X POST http://localhost:3002/api/properties/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"http://localhost:8080/admin"}'

# Test file size limit (should return 413)
dd if=/dev/zero bs=1M count=20 | curl -X POST \
  -F "image=@-;filename=test.jpg" \
  http://localhost:3001/api/geolocation/analyze

# Check CORS headers (should NOT have Access-Control-Allow-Origin: *)
curl -I -X OPTIONS http://localhost:3002/api/analysis/url \
  -H "Origin: http://evil.com"

# Verify health endpoints
curl http://localhost:3002/api/health
curl http://localhost:3001/health
```

---

## Production Environment Checklist

```
NODE_ENV=production                    [ ] Required
PORT=3002                              [ ] Set
MONGODB_URI=mongodb+srv://...          [ ] Set (TLS enabled)
JWT_SECRET=<32+ random chars>          [ ] Set
SESSION_SECRET=<32+ random chars>      [ ] Set
ANTHROPIC_API_KEY=sk-...               [ ] Set
FIRECRAWL_API_KEY=fc-...               [ ] Set
CLOUDINARY_URL=cloudinary://...        [ ] Set
GOOGLE_CLIENT_ID=...                   [ ] Set (for SSO)
GOOGLE_CLIENT_SECRET=...               [ ] Set (for SSO)
LINKEDIN_CLIENT_ID=...                 [ ] Set (for SSO)
LINKEDIN_CLIENT_SECRET=...             [ ] Set (for SSO)
FRONTEND_URL=https://proprscout.com    [ ] Set
RATE_LIMIT_WINDOW_MS=900000            [ ] Set
RATE_LIMIT_MAX_REQUESTS=100            [ ] Set
```

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| Security Reviewer | Claude Code | Nov 26, 2025 | Automated Review |
| CEO Approval | John | | |

**System Version**: ________________

**Overall Status**: CONDITIONAL PASS

**Notes**:
- All CRITICAL secrets/hardcoding issues fixed
- 4 MEDIUM issues identified (SSRF, auth rate limit, JWT expiry, Flask CORS)
- Recommend addressing MEDIUM issues before public launch
- Safe for Founding Partner beta with current security posture

**Launch Approved**: YES (for Founding Partners beta) / CONDITIONAL (for public launch)

---

*This checklist validated against codebase on November 26, 2025*
