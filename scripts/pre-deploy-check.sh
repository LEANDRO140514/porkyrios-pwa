#!/bin/bash

# 🔍 Pre-Deploy Verification Script
# Verifica que todo esté listo para production

echo "🚀 Porkyrios - Pre-Deploy Checklist"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to check status
check_status() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ $2${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ $2${NC}"
    ((FAILED++))
  fi
}

check_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  ((WARNINGS++))
}

# 1. Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
  check_status 0 "Node.js version is compatible (v$NODE_VERSION)"
else
  check_status 1 "Node.js version too old. Need v18+ (found v$NODE_VERSION)"
fi
echo ""

# 2. Check if dependencies are installed
echo "📚 Checking dependencies..."
if [ -d "node_modules" ]; then
  check_status 0 "node_modules directory exists"
else
  check_status 1 "node_modules not found. Run: npm install"
fi
echo ""

# 3. Check if .env file exists
echo "🔐 Checking environment variables..."
if [ -f ".env" ]; then
  check_status 0 ".env file exists"
  
  # Check critical variables
  if grep -q "DATABASE_URL=" .env; then
    check_status 0 "DATABASE_URL is set"
  else
    check_status 1 "DATABASE_URL is missing"
  fi
  
  if grep -q "DATABASE_AUTH_TOKEN=" .env; then
    check_status 0 "DATABASE_AUTH_TOKEN is set"
  else
    check_status 1 "DATABASE_AUTH_TOKEN is missing"
  fi
  
  if grep -q "ADMIN_PASSWORD=" .env; then
    check_status 0 "ADMIN_PASSWORD is set"
  else
    check_warning "ADMIN_PASSWORD is missing (optional but recommended)"
  fi
  
  if grep -q "NEXT_PUBLIC_SENTRY_DSN=" .env; then
    check_status 0 "Sentry DSN is set"
  else
    check_warning "NEXT_PUBLIC_SENTRY_DSN is missing (error tracking disabled)"
  fi
  
  if grep -q "RESEND_API_KEY=" .env; then
    check_status 0 "Resend API key is set"
  else
    check_warning "RESEND_API_KEY is missing (email notifications disabled)"
  fi
else
  check_status 1 ".env file not found. Copy from .env.example"
fi
echo ""

# 4. Check critical files
echo "📄 Checking critical files..."
FILES=("vercel.json" "middleware.ts" "public/manifest.json" "next.config.ts")
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    check_status 0 "$file exists"
  else
    check_status 1 "$file is missing"
  fi
done
echo ""

# 5. Check .gitignore
echo "🔒 Checking .gitignore..."
if [ -f ".gitignore" ]; then
  if grep -q ".env" .gitignore; then
    check_status 0 ".env is in .gitignore"
  else
    check_status 1 ".env is NOT in .gitignore (SECURITY RISK!)"
  fi
  
  if grep -q "node_modules" .gitignore; then
    check_status 0 "node_modules is in .gitignore"
  else
    check_status 1 "node_modules is NOT in .gitignore"
  fi
else
  check_status 1 ".gitignore file not found"
fi
echo ""

# Summary
echo "===================================="
echo "📊 SUMMARY"
echo "===================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All critical checks passed!${NC}"
  echo -e "${GREEN}✅ Ready for deployment${NC}"
  exit 0
else
  echo -e "${RED}❌ Some critical checks failed${NC}"
  echo -e "${RED}⚠️  Fix issues before deploying${NC}"
  exit 1
fi
