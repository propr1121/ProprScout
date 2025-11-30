#!/bin/bash
# ProprScout Production Smoke Test
# Usage: ./smoke-test.sh [API_URL] [FRONTEND_URL]

API_URL="${1:-https://api.proprscout.com}"
FRONTEND_URL="${2:-https://app.proprscout.com}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

echo ""
echo "🔥 ProprScout Production Smoke Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "API:      $API_URL"
echo "Frontend: $FRONTEND_URL"
echo ""

# Test function
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"

    printf "%-35s" "$name..."

    STATUS=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$url" 2>/dev/null)

    if [ "$STATUS" == "$expected_status" ]; then
        echo -e "${GREEN}✅ OK${NC} ($STATUS)"
        ((PASSED++))
        return 0
    elif [ "$STATUS" == "000" ]; then
        echo -e "${RED}❌ TIMEOUT${NC}"
        ((FAILED++))
        return 1
    else
        echo -e "${RED}❌ FAILED${NC} (got $STATUS, expected $expected_status)"
        ((FAILED++))
        return 1
    fi
}

# Test response time
test_response_time() {
    local name="$1"
    local url="$2"
    local max_time="${3:-2.0}"

    printf "%-35s" "$name..."

    TIME=$(curl -o /dev/null -s -w '%{time_total}' --max-time 10 "$url" 2>/dev/null)

    if [ -z "$TIME" ] || [ "$TIME" == "0.000000" ]; then
        echo -e "${RED}❌ FAILED${NC}"
        ((FAILED++))
        return 1
    fi

    RESULT=$(echo "$TIME < $max_time" | bc -l 2>/dev/null || echo "1")

    if [ "$RESULT" == "1" ]; then
        echo -e "${GREEN}✅ ${TIME}s${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${YELLOW}⚠️  ${TIME}s (slow)${NC}"
        ((WARNINGS++))
        return 0
    fi
}

# Test CORS
test_cors() {
    local name="$1"
    local api_url="$2"
    local origin="$3"

    printf "%-35s" "$name..."

    CORS=$(curl -sI -X OPTIONS "$api_url/api/health" \
        -H "Origin: $origin" \
        -H "Access-Control-Request-Method: GET" \
        2>/dev/null | grep -i "access-control-allow-origin" | head -1)

    if [ -n "$CORS" ]; then
        echo -e "${GREEN}✅ OK${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${YELLOW}⚠️  Check CORS configuration${NC}"
        ((WARNINGS++))
        return 0
    fi
}

echo "📡 API Health Checks"
echo "────────────────────"
test_endpoint "Health endpoint" "$API_URL/api/health"
test_endpoint "Liveness probe" "$API_URL/api/health/live"
# Readiness may return 503 if PostgreSQL is not configured (optional)
printf "%-35s" "Readiness probe..."
STATUS=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$API_URL/api/health/ready" 2>/dev/null)
if [ "$STATUS" == "200" ]; then
    echo -e "${GREEN}✅ OK${NC} (all services ready)"
    ((PASSED++))
elif [ "$STATUS" == "503" ]; then
    echo -e "${YELLOW}⚠️  Degraded${NC} (some optional services unavailable)"
    ((WARNINGS++))
else
    echo -e "${RED}❌ FAILED${NC} ($STATUS)"
    ((FAILED++))
fi
test_response_time "Response time" "$API_URL/api/health" "2.0"

echo ""
echo "🔐 Authentication Endpoints"
echo "───────────────────────────"

# Test POST endpoints with empty body
printf "%-35s" "Login endpoint exists..."
STATUS=$(curl -s -o /dev/null -w '%{http_code}' -X POST --max-time 10 \
    -H "Content-Type: application/json" -d '{}' "$API_URL/api/auth/login" 2>/dev/null)
if [ "$STATUS" == "400" ] || [ "$STATUS" == "422" ]; then
    echo -e "${GREEN}✅ OK${NC} ($STATUS)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Unexpected${NC} ($STATUS)"
    ((WARNINGS++))
fi

printf "%-35s" "Register endpoint exists..."
STATUS=$(curl -s -o /dev/null -w '%{http_code}' -X POST --max-time 10 \
    -H "Content-Type: application/json" -d '{}' "$API_URL/api/auth/register" 2>/dev/null)
if [ "$STATUS" == "400" ] || [ "$STATUS" == "422" ]; then
    echo -e "${GREEN}✅ OK${NC} ($STATUS)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Unexpected${NC} ($STATUS)"
    ((WARNINGS++))
fi

test_endpoint "Protected route (no auth)" "$API_URL/api/auth/me" "401"

echo ""
echo "💰 Public Endpoints"
echo "───────────────────"
test_endpoint "Pricing plans" "$API_URL/api/pricing/plans"
test_endpoint "Pricing features" "$API_URL/api/pricing/features"
# Test POST endpoint
printf "%-35s" "Invite code validation..."
STATUS=$(curl -s -o /dev/null -w '%{http_code}' -X POST --max-time 10 \
    -H "Content-Type: application/json" -d '{"code":"test"}' "$API_URL/api/invite/validate" 2>/dev/null)
if [ "$STATUS" == "200" ] || [ "$STATUS" == "400" ] || [ "$STATUS" == "404" ]; then
    echo -e "${GREEN}✅ OK${NC} ($STATUS)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Unexpected${NC} ($STATUS)"
    ((WARNINGS++))
fi

echo ""
echo "🌐 Frontend"
echo "───────────"
test_endpoint "Frontend loads" "$FRONTEND_URL"
test_response_time "Frontend response time" "$FRONTEND_URL" "3.0"

echo ""
echo "🔒 Security"
echo "───────────"
test_cors "CORS configuration" "$API_URL" "$FRONTEND_URL"

# Check security headers
printf "%-35s" "Security headers..."
HEADERS=$(curl -sI "$FRONTEND_URL" 2>/dev/null)
if echo "$HEADERS" | grep -qi "x-frame-options"; then
    echo -e "${GREEN}✅ OK${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Check security headers${NC}"
    ((WARNINGS++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Results"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "   ${GREEN}✅ Passed:   $PASSED${NC}"
echo -e "   ${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo -e "   ${RED}❌ Failed:   $FAILED${NC}"
echo ""

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}🚫 Smoke tests FAILED - Do not deploy!${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Smoke tests passed with warnings${NC}"
    exit 0
else
    echo -e "${GREEN}✅ All smoke tests passed!${NC}"
    exit 0
fi
