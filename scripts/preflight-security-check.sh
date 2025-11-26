#!/bin/bash

# ProprScout Pre-Flight Security Check
# Run from project root: ./scripts/preflight-security-check.sh

echo ""
echo "ProprScout Pre-Flight Security Check"
echo "========================================"
echo ""

ERRORS=0
WARNINGS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

check_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((ERRORS++))
}

check_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARNINGS++))
}

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT" || exit 1

echo "Project: $PROJECT_ROOT"
echo ""

echo "1. Project Structure"
echo "----------------------------------------"

# Check .env file is NOT committed
if git ls-files --error-unmatch .env 2>/dev/null; then
    check_fail ".env file is tracked by git!"
else
    check_pass ".env is not tracked by git"
fi

# Check .gitignore
if [ -f ".gitignore" ]; then
    if grep -q "\.env" .gitignore; then
        check_pass ".gitignore includes .env"
    else
        check_fail ".gitignore missing .env entry"
    fi
else
    check_fail ".gitignore file not found"
fi

# Check .env.example exists
if [ -f "backend/backend/.env.example" ]; then
    check_pass ".env.example template exists"
else
    check_fail ".env.example not found"
fi

echo ""
echo "2. Hardcoded Secrets"
echo "----------------------------------------"

# Search for hardcoded API keys (Anthropic, Firecrawl patterns)
SECRETS_FOUND=$(grep -rn --include="*.js" --include="*.ts" --include="*.py" \
    -E "(sk-ant-[a-zA-Z0-9]{20,}|fc-[a-zA-Z0-9]{20,})" \
    . 2>/dev/null | grep -v node_modules | grep -v ".env" | grep -v "\.example" | head -5)

if [ -n "$SECRETS_FOUND" ]; then
    check_fail "Hardcoded API keys found:"
    echo "$SECRETS_FOUND"
else
    check_pass "No hardcoded API keys found"
fi

# Check for MongoDB connection strings with passwords
MONGO_STRINGS=$(grep -rn --include="*.js" --include="*.py" "mongodb+srv://[^\"']*:[^\"']*@" . 2>/dev/null | grep -v node_modules | grep -v ".env")
if [ -n "$MONGO_STRINGS" ]; then
    check_fail "MongoDB credentials hardcoded"
else
    check_pass "No hardcoded MongoDB credentials"
fi

echo ""
echo "3. Security Packages"
echo "----------------------------------------"

# Check for security packages in backend
if [ -f "backend/backend/package.json" ]; then
    if grep -q "express-rate-limit" backend/backend/package.json; then
        check_pass "Rate limiting installed"
    else
        check_warn "express-rate-limit not found"
    fi

    if grep -q "helmet" backend/backend/package.json; then
        check_pass "Helmet installed"
    else
        check_warn "Helmet not found"
    fi

    if grep -q "express-validator" backend/backend/package.json; then
        check_pass "Input validation installed"
    else
        check_warn "express-validator not found"
    fi
fi

echo ""
echo "4. Auth Security"
echo "----------------------------------------"

# Check auth middleware
if [ -f "backend/backend/middleware/auth.js" ]; then
    check_pass "Auth middleware exists"

    if grep -q "throw new Error.*JWT_SECRET" backend/backend/middleware/auth.js; then
        check_pass "JWT_SECRET fail-fast enabled"
    else
        check_warn "JWT_SECRET fail-fast not found"
    fi
else
    check_fail "Auth middleware not found"
fi

# Check error handler
if [ -f "backend/backend/middleware/errorHandler.js" ]; then
    check_pass "Error handler exists"
else
    check_warn "Error handler not found"
fi

echo ""
echo "5. Flask Backend"
echo "----------------------------------------"

if [ -f "backend/geolocation/app.py" ]; then
    check_pass "Flask app exists"

    if grep -q "MAX_CONTENT_LENGTH" backend/geolocation/app.py; then
        check_pass "File size limit configured"
    else
        check_warn "MAX_CONTENT_LENGTH not set"
    fi

    if grep -q "ALLOWED_EXTENSIONS" backend/geolocation/app.py; then
        check_pass "File extension validation"
    else
        check_warn "ALLOWED_EXTENSIONS not set"
    fi
else
    check_warn "Flask app not found"
fi

echo ""
echo "6. npm Audit"
echo "----------------------------------------"

if [ -f "backend/backend/package-lock.json" ]; then
    cd backend/backend
    AUDIT_OUTPUT=$(npm audit --json 2>/dev/null)
    CRITICAL=$(echo "$AUDIT_OUTPUT" | grep -o '"critical":[0-9]*' | grep -o '[0-9]*' | head -1)
    HIGH=$(echo "$AUDIT_OUTPUT" | grep -o '"high":[0-9]*' | grep -o '[0-9]*' | head -1)

    if [ "${CRITICAL:-0}" -gt 0 ]; then
        check_fail "npm: $CRITICAL critical vulnerabilities"
    elif [ "${HIGH:-0}" -gt 0 ]; then
        check_warn "npm: $HIGH high vulnerabilities"
    else
        check_pass "npm: No critical/high vulnerabilities"
    fi
    cd "$PROJECT_ROOT"
else
    check_warn "package-lock.json not found"
fi

echo ""
echo "7. CORS Configuration"
echo "----------------------------------------"

# Check for wildcard CORS
WILDCARD=$(grep -rn --include="*.js" "origin:\s*['\"]\\*['\"]" backend/ 2>/dev/null | grep -v node_modules)
if [ -n "$WILDCARD" ]; then
    check_fail "Wildcard CORS (*) found!"
else
    check_pass "No wildcard CORS in Node"
fi

echo ""
echo "========================================"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}FAILED: $ERRORS critical issues${NC}"
    echo "Fix before deploying to proprscout.com"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}PASSED with $WARNINGS warnings${NC}"
    echo "Review warnings before production"
    exit 0
else
    echo -e "${GREEN}PASSED: All checks passed${NC}"
    echo "Ready for proprscout.com deployment"
    exit 0
fi
