#!/bin/bash
# Auth flow reproduction test
# Usage: bash test-auth-flow.sh

set -e

BASE_URL="${BASE_URL:-http://localhost:3003}"
ADMIN_EMAIL="${ADMIN_EMAIL:?Set ADMIN_EMAIL before running this script}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:?Set ADMIN_PASSWORD before running this script}"
COOKIE_JAR="/tmp/gearzone_cookies.txt"

echo "=== GearZone Auth Flow Test ==="
echo ""

# Step 1: Test /api/auth/me without login (should 401)
echo "[TEST 1] GET /api/auth/me (no cookie)"
curl -s -w "\nHTTP %{http_code}\n" "$BASE_URL/api/auth/me" | tail -1
echo ""

# Step 2: Login as admin
echo "[TEST 2] POST /api/auth/login (admin)"
curl -s -c "$COOKIE_JAR" -w "\nHTTP %{http_code}\n" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
  "$BASE_URL/api/auth/login" | tail -1
echo ""

# Step 3: Check cookie was saved
echo "[TEST 3] Check saved cookies:"
cat "$COOKIE_JAR" | grep -E "gearzone|session" || echo "No gearzone_session cookie found!"
echo ""

# Step 4: Test /api/auth/me with cookie (should 200)
echo "[TEST 4] GET /api/auth/me (with cookie)"
curl -s -b "$COOKIE_JAR" -w "\nHTTP %{http_code}\n" \
  "$BASE_URL/api/auth/me" | tail -1
echo ""

# Step 5: Test admin dashboard API with cookie
echo "[TEST 5] GET /api/admin/dashboard (with cookie)"
curl -s -b "$COOKIE_JAR" -w "\nHTTP %{http_code}\n" \
  "$BASE_URL/api/admin/dashboard" | tail -1
echo ""

# Step 6: Access admin/login page
echo "[TEST 6] GET /admin/login (should redirect if logged in)"
curl -s -b "$COOKIE_JAR" -w "\nHTTP %{http_code}, Redirect: %{redirect_url}\n" \
  "$BASE_URL/admin/login" | tail -1
echo ""

# Step 7: Access admin/dashboard page
echo "[TEST 7] GET /admin/dashboard (HTML page)"
curl -s -b "$COOKIE_JAR" -w "\nHTTP %{http_code}\n" \
  "$BASE_URL/admin/dashboard" | tail -1
echo ""

echo "=== Test Complete ==="
