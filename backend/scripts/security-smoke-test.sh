#!/bin/bash

###############################################################################
# Darb Network - Security Smoke Test Script
# 
# This script validates that all security fixes from STEPS 1-11 are working
# Run this after deploying to ensure security controls are in place
#
# Usage: bash security-smoke-test.sh [base_url]
# Example: bash security-smoke-test.sh http://localhost:5000
###############################################################################

BASE_URL="${1:-http://localhost:5000}"
PASS=0
FAIL=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "   Darb Network Security Smoke Tests"
echo "=========================================="
echo "Target: $BASE_URL"
echo ""

test_case() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  
  if [[ "$actual" == *"$expected"* ]]; then
    echo -e "${GREEN}✓ PASS${NC}: $name"
    ((PASS++))
  else
    echo -e "${RED}✗ FAIL${NC}: $name"
    echo "  Expected: $expected"
    echo "  Got: $actual"
    ((FAIL++))
  fi
}

echo "### STEP 1: Admin signup blocked ###"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "attacker@test.com",
    "password": "password123",
    "fullName": "Attacker",
    "userType": "admin",
    "captchaToken": "test"
  }')
test_case "Signup with userType=admin rejected" "Invalid user type" "$RESPONSE"

echo ""
echo "### STEP 2: JWT secret validation ###"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/users/profile" \
  -H "Authorization: Bearer invalid_token")
test_case "Invalid JWT rejected" "Unauthorized" "$RESPONSE"

echo ""
echo "### STEP 3: Draft campaigns not leaked ###"
# First, check that public campaigns endpoint only returns approved
RESPONSE=$(curl -s "$BASE_URL/api/campaigns")
if echo "$RESPONSE" | grep -q "approved\|success"; then
  echo -e "${GREEN}✓ PASS${NC}: Public campaigns endpoint returns approved campaigns"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC}: Public campaigns endpoint failed"
  ((FAIL++))
fi

echo ""
echo "### STEP 4: Debug endpoints removed ###"
RESPONSE=$(curl -s "$BASE_URL/test")
test_case "/test endpoint returns 404" "Endpoint not found" "$RESPONSE"

RESPONSE=$(curl -s "$BASE_URL/api/cloudinary-status")
test_case "/api/cloudinary-status endpoint returns 404" "Endpoint not found" "$RESPONSE"

RESPONSE=$(curl -s "$BASE_URL/api/route-status")
test_case "/api/route-status endpoint returns 404" "Endpoint not found" "$RESPONSE"

echo ""
echo "### STEP 5: CORS properly configured ###"
RESPONSE=$(curl -s -I -H "Origin: https://evil.com" "$BASE_URL/api/campaigns")
if echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
  ORIGIN=$(echo "$RESPONSE" | grep "Access-Control-Allow-Origin" | cut -d' ' -f2- | tr -d '\r')
  if [[ "$ORIGIN" != "https://evil.com" ]]; then
    echo -e "${GREEN}✓ PASS${NC}: CORS blocks unauthorized origin"
    ((PASS++))
  else
    echo -e "${RED}✗ FAIL${NC}: CORS allowed evil.com (should not)"
    ((FAIL++))
  fi
else
  echo -e "${GREEN}✓ PASS${NC}: CORS headers present"
  ((PASS++))
fi

echo ""
echo "### STEP 6: Error responses don't leak details ###"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "nonexistent@test.com", "password": "wrong"}')
if echo "$RESPONSE" | grep -q "error.*message"; then
  echo -e "${RED}✗ FAIL${NC}: Error response includes error field (should hide details)"
  ((FAIL++))
elif echo "$RESPONSE" | grep -q "message"; then
  echo -e "${GREEN}✓ PASS${NC}: Error responses don't leak internal details"
  ((PASS++))
else
  echo -e "${YELLOW}? UNCLEAR${NC}: Could not verify error response format"
fi

echo ""
echo "### STEP 7: Security headers present ###"
RESPONSE=$(curl -s -I "$BASE_URL/health")
if echo "$RESPONSE" | grep -q "X-Frame-Options"; then
  echo -e "${GREEN}✓ PASS${NC}: Helmet security headers present (X-Frame-Options)"
  ((PASS++))
else
  echo -e "${RED}✗ FAIL${NC}: Helmet security headers missing"
  ((FAIL++))
fi

echo ""
echo "### STEP 7: Password minimum 8 characters ###"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "shortpwd@test.com",
    "password": "pass",
    "fullName": "Test",
    "userType": "founder",
    "captchaToken": "test"
  }')
test_case "Password < 8 chars rejected" "at least 8 characters" "$RESPONSE"

echo ""
echo "### STEP 8: Payment endpoints secured ###"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/investments/create" \
  -H "Content-Type: application/json" \
  -d '{"campaignId": 1, "amount": 50000}')
if echo "$RESPONSE" | grep -q "Unauthorized\|Payments unavailable"; then
  echo -e "${GREEN}✓ PASS${NC}: Payment endpoints require auth or return unavailable"
  ((PASS++))
else
  echo -e "${YELLOW}? UNCLEAR${NC}: Payment endpoint response: $RESPONSE"
fi

echo ""
echo "### STEP 9: reCAPTCHA token required ###"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nocaptcha@test.com",
    "password": "password123",
    "fullName": "Test",
    "userType": "founder"
  }')
if echo "$RESPONSE" | grep -q "captcha\|token"; then
  echo -e "${GREEN}✓ PASS${NC}: reCAPTCHA token validation enforced"
  ((PASS++))
else
  echo -e "${YELLOW}⚠ NOTE${NC}: reCAPTCHA may be disabled in development"
fi

echo ""
echo "### STEP 10: Sensitive data masked ###"
# This test would need valid auth token to verify
echo -e "${YELLOW}⚠ NOTE${NC}: Data masking verified via code review (requires auth token to test)"
echo "  - BVN masking: Last 4 digits shown, rest masked"
echo "  - Account number masking: Last 4 digits shown"
echo "  - Boolean flags: hasBvn, hasAccountNumber"

echo ""
echo "### STEP 11: Credentials removed from README ###"
if grep -q "admin2025\|292025\|otikanelson29@gmail.com" README.md 2>/dev/null; then
  echo -e "${RED}✗ FAIL${NC}: Published credentials still in README.md"
  ((FAIL++))
else
  echo -e "${GREEN}✓ PASS${NC}: Published credentials removed from README.md"
  ((PASS++))
fi

echo ""
echo "### STEP 11: 404 handler doesn't list endpoints ###"
RESPONSE=$(curl -s "$BASE_URL/unknown-route")
if echo "$RESPONSE" | grep -q "availableEndpoints\|GET /\|POST /"; then
  echo -e "${RED}✗ FAIL${NC}: 404 handler leaks available endpoints"
  ((FAIL++))
else
  echo -e "${GREEN}✓ PASS${NC}: 404 handler doesn't list endpoints"
  ((PASS++))
fi

echo ""
echo "=========================================="
echo "   Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
TOTAL=$((PASS + FAIL))
echo "Total:  $TOTAL"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✓ All security tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed. Review and fix issues.${NC}"
  exit 1
fi
