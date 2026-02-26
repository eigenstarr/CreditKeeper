#!/bin/bash

# CreditKeeper Toy Score System Test Script
# Tests all toy score API endpoints

BASE_URL="http://localhost:3001"

echo "========================================"
echo "CreditKeeper Toy Score System Test"
echo "========================================"
echo ""

# Test 1: Generate Healthy Profile
echo "1. Generating HEALTHY synthetic profile..."
HEALTHY_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/synthetic/generate \
  -H "Content-Type: application/json" \
  -d '{"type":"healthy"}')

HEALTHY_ID=$(echo $HEALTHY_RESPONSE | jq -r '.id')
echo "✓ Healthy Profile ID: $HEALTHY_ID"
echo ""

# Test 2: Generate Risky Profile
echo "2. Generating RISKY synthetic profile..."
RISKY_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/synthetic/generate \
  -H "Content-Type: application/json" \
  -d '{"type":"risky"}')

RISKY_ID=$(echo $RISKY_RESPONSE | jq -r '.id')
echo "✓ Risky Profile ID: $RISKY_ID"
echo ""

# Test 3: Get Toy Score for Healthy Profile
echo "3. Computing toy score for HEALTHY profile..."
HEALTHY_SCORE=$(curl -s ${BASE_URL}/api/toyscore/${HEALTHY_ID})
HEALTHY_FINAL=$(echo $HEALTHY_SCORE | jq -r '.finalScore')
echo "✓ Healthy Score: $HEALTHY_FINAL"
echo "  - Payment History: $(echo $HEALTHY_SCORE | jq -r '.factors.paymentHistory.score') (weight: 40%)"
echo "  - Utilization: $(echo $HEALTHY_SCORE | jq -r '.factors.utilization.score') (weight: 30%)"
echo "  - DTI Proxy: $(echo $HEALTHY_SCORE | jq -r '.factors.debtToIncome.score') (weight: 20%)"
echo "  - History Length: $(echo $HEALTHY_SCORE | jq -r '.factors.historyLength.score') (weight: 10%)"
echo ""

# Test 4: Get Toy Score for Risky Profile
echo "4. Computing toy score for RISKY profile..."
RISKY_SCORE=$(curl -s ${BASE_URL}/api/toyscore/${RISKY_ID})
RISKY_FINAL=$(echo $RISKY_SCORE | jq -r '.finalScore')
echo "✓ Risky Score: $RISKY_FINAL"
echo "  - Payment History: $(echo $RISKY_SCORE | jq -r '.factors.paymentHistory.score') (weight: 40%)"
echo "  - Utilization: $(echo $RISKY_SCORE | jq -r '.factors.utilization.score') (weight: 30%)"
echo "  - DTI Proxy: $(echo $RISKY_SCORE | jq -r '.factors.debtToIncome.score') (weight: 20%)"
echo "  - History Length: $(echo $RISKY_SCORE | jq -r '.factors.historyLength.score') (weight: 10%)"
echo ""

# Test 5: Simulate Purchase on Healthy Profile
echo "5. Simulating $500 PURCHASE on healthy profile..."
PURCHASE_RESULT=$(curl -s -X POST ${BASE_URL}/api/toyscore/simulate \
  -H "Content-Type: application/json" \
  -d "{\"profileId\":\"${HEALTHY_ID}\",\"scenario\":{\"type\":\"purchase\",\"amount\":500}}")

echo "✓ Purchase Simulation Result:"
echo "  - Current Score: $(echo $PURCHASE_RESULT | jq -r '.currentScore')"
echo "  - Projected Score: $(echo $PURCHASE_RESULT | jq -r '.projectedScore')"
echo "  - Delta: $(echo $PURCHASE_RESULT | jq -r '.scoreDelta')"
echo "  - Factor Affected: $(echo $PURCHASE_RESULT | jq -r '.factorAffected')"
echo "  - Explanation: $(echo $PURCHASE_RESULT | jq -r '.explanation')"
echo ""

# Test 6: Simulate Missed Payment on Healthy Profile
echo "6. Simulating MISSED PAYMENT on healthy profile..."
MISSED_RESULT=$(curl -s -X POST ${BASE_URL}/api/toyscore/simulate \
  -H "Content-Type: application/json" \
  -d "{\"profileId\":\"${HEALTHY_ID}\",\"scenario\":{\"type\":\"missed_payment\"}}")

echo "✓ Missed Payment Simulation Result:"
echo "  - Current Score: $(echo $MISSED_RESULT | jq -r '.currentScore')"
echo "  - Projected Score: $(echo $MISSED_RESULT | jq -r '.projectedScore')"
echo "  - Delta: $(echo $MISSED_RESULT | jq -r '.scoreDelta')"
echo "  - Factor Affected: $(echo $MISSED_RESULT | jq -r '.factorAffected')"
echo "  - Recovery Timeline:"
echo "    - 30 days: $(echo $MISSED_RESULT | jq -r '.recoveryTimeline.days30')"
echo "    - 90 days: $(echo $MISSED_RESULT | jq -r '.recoveryTimeline.days90')"
echo "    - 180 days: $(echo $MISSED_RESULT | jq -r '.recoveryTimeline.days180')"
echo ""

# Test 7: Simulate Pay Down on Risky Profile
echo "7. Simulating $800 PAY DOWN on risky profile..."
PAYDOWN_RESULT=$(curl -s -X POST ${BASE_URL}/api/toyscore/simulate \
  -H "Content-Type: application/json" \
  -d "{\"profileId\":\"${RISKY_ID}\",\"scenario\":{\"type\":\"pay_down\",\"paymentAmount\":800}}")

echo "✓ Pay Down Simulation Result:"
echo "  - Current Score: $(echo $PAYDOWN_RESULT | jq -r '.currentScore')"
echo "  - Projected Score: $(echo $PAYDOWN_RESULT | jq -r '.projectedScore')"
echo "  - Delta: $(echo $PAYDOWN_RESULT | jq -r '.scoreDelta')"
echo "  - Factor Affected: $(echo $PAYDOWN_RESULT | jq -r '.factorAffected')"
echo "  - Explanation: $(echo $PAYDOWN_RESULT | jq -r '.explanation')"
echo ""

# Test 8: Get Credit Data Format
echo "8. Getting credit data format for UI compatibility..."
CREDIT_DATA=$(curl -s ${BASE_URL}/api/toyscore/${HEALTHY_ID}/credit)
echo "✓ Credit Data (for CreditKeeper UI):"
echo "  - Score: $(echo $CREDIT_DATA | jq -r '.score')"
echo "  - Health Level: $(echo $CREDIT_DATA | jq -r '.healthLevel')"
echo "  - Factors: $(echo $CREDIT_DATA | jq -r '.factors | keys | join(", ")')"
echo ""

echo "========================================"
echo "All Tests Complete!"
echo "========================================"
echo ""
echo "Summary:"
echo "  Healthy Profile Score: $HEALTHY_FINAL (Expected: 720-760)"
echo "  Risky Profile Score: $RISKY_FINAL (Expected: 560-620)"
echo ""
echo "Frontend URL: http://localhost:3000"
echo "Backend URL: http://localhost:3001"
