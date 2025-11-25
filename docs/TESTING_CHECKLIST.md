# ProprScout Pre-Launch Testing Checklist

**Version:** 1.0.0
**Date:** 2025-11-25
**Tester:** _______________

## Instructions

1. Complete each test and mark with:
   - [x] - Passed
   - [ ] - Not tested
   - [!] - Failed (add notes)

2. Record actual values where indicated
3. Note any issues in the "Issues Found" section

---

## 1. Backend Services

### Node.js Backend (Port 3002)
- [ ] Server starts without errors
- [ ] Health endpoint responds: `curl http://localhost:3002/api/health`
- [ ] Memory usage reasonable (<200MB RSS)
- [ ] No console errors on startup

### Flask/GeoCLIP Backend (Port 3001)
- [ ] Server starts without errors
- [ ] Health endpoint responds: `curl http://localhost:3001/api/health`
- [ ] GeoCLIP service status shows "available"
- [ ] PyTorch/GeoCLIP models load correctly

### Frontend (Port 5001)
- [ ] Vite dev server starts
- [ ] No build errors
- [ ] Hot reload working

---

## 2. Dashboard

### Initial State (New User)
- [ ] Dashboard loads without errors
- [ ] Shows user name (or "Guest")
- [ ] Stats show zeros initially:
  - Total Analyses: 0
  - Success Rate: 0%
  - This Month: 0
  - Total Value: €0

### Navigation
- [ ] All menu items clickable
- [ ] No "Demo Mode" text visible
- [ ] Credits display (if applicable)

---

## 3. URL Analysis Flow

### Input Component
- [ ] URL input field accepts paste
- [ ] Placeholder shows example URL format
- [ ] Supported portals listed below input
- [ ] Analyze button disabled when empty
- [ ] Analyze button enabled with valid URL

### Test URLs (Record Results)

**Test 1: Idealista URL**
- URL Used: ________________________________
- [ ] Analysis starts (loading state)
- [ ] Completes within 30 seconds
- Time taken: _____ seconds
- Results:
  - [ ] Title extracted: ________________________________
  - [ ] Price extracted: €__________
  - [ ] Area extracted: _____m²
  - [ ] Location shown: ________________________________
  - [ ] Photos count: _____
  - [ ] Overall Score: _____/100

**Test 2: Imovirtual URL**
- URL Used: ________________________________
- [ ] Analysis completes
- Time taken: _____ seconds
- Overall Score: _____/100

**Test 3: Invalid URL**
- URL Used: `https://www.google.com`
- [ ] Error message shown
- [ ] Error is user-friendly (not technical)
- Error text: ________________________________

---

## 4. Analysis Results Display

### Score Cards
- [ ] Overall Score displayed with color coding
- [ ] Listing Quality score shown: _____/100
- [ ] Space Efficiency score shown: _____/100
- [ ] Data Completeness score shown: _____/100
- [ ] All scores are NOT 50/100 (real calculations)
- [ ] Score breakdowns expandable/visible

### Property Details
- [ ] Property title displayed
- [ ] Price formatted correctly (€ with commas)
- [ ] Price per m² calculated and shown
- [ ] Location/address displayed
- [ ] Property image shown (if available)

### AI Recommendations
- [ ] Smart Recommendations section visible
- [ ] At least 3 opportunities listed
- [ ] Agent tips provided
- [ ] Pricing assessment shown
- [ ] Market context provided
- [ ] OR: "AI unavailable" message if API issue

### Actions
- [ ] Back button works
- [ ] New analysis button available

---

## 5. Photo Location Search (if enabled)

- [ ] Feature accessible from dashboard
- [ ] Upload accepts image files
- [ ] Analysis starts on upload
- [ ] Results show within 15 seconds
- [ ] Map displays with coordinates
- [ ] Confidence score shown
- [ ] Low confidence shows appropriate message

---

## 6. Error Handling

### Network Errors
- [ ] Backend not running: Shows friendly message
- [ ] Timeout: Shows retry option
- [ ] Rate limited: Shows wait message

### Input Errors
- [ ] Empty URL: Button disabled
- [ ] Invalid URL format: Validation message
- [ ] Search page URL: "Not a listing" message

---

## 7. Mobile Responsive

Test on mobile device or browser dev tools (375px width):

- [ ] Dashboard readable
- [ ] URL input usable (can paste)
- [ ] Results display properly
- [ ] No horizontal scroll
- [ ] Touch targets adequate size (44px+)

---

## 8. Performance

### Load Times
- Dashboard load: _____ seconds (target: <2s)
- Analysis completion: _____ seconds (target: <30s)
- Results render: _____ seconds (target: <1s)

### Console
- [ ] No JavaScript errors
- [ ] No uncaught promise rejections
- [ ] No CORS errors
- [ ] No 404 errors for assets

---

## 9. Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Issues Found

| # | Description | Severity | Steps to Reproduce |
|---|-------------|----------|-------------------|
| 1 | | Low/Med/High | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

---

## Sign-off

### Automated Tests
- [ ] Integration tests passing
- [ ] Portal scraping tests reviewed
- [ ] No critical failures

### Manual Tests
- [ ] All critical paths tested
- [ ] Error handling verified
- [ ] Mobile responsive confirmed

### Ready for Launch?
- [ ] YES - All critical tests pass
- [ ] NO - Issues must be resolved first

**Tested By:** ________________________
**Date:** ________________________
**Signature:** ________________________

---

## Quick Reference Commands

```bash
# Start all services
cd backend && ./start_flask.sh &
cd backend/backend && PORT=3002 node server.js &
npm run dev &

# Run integration tests
cd backend/backend && node tests/integration/full-analysis.test.js

# Run portal tests
cd backend/backend && node scripts/test-scraping.js

# Check service health
curl http://localhost:3002/api/health
curl http://localhost:3001/api/health
```
