# Toy Credit Score System Documentation

## Overview

The toy credit score system is an educational scoring model designed to help users understand credit concepts without claiming any equivalence to real FICO or VantageScore systems.

## Score Range

**300-850** (familiar scale but explicitly toy/educational)

## Core Factors & Weights

### 1. Payment History (40%)
- **Input**: Last 12 billing cycles
- **Scoring Logic**:
  - Start at 100
  - Missed payment: -25 points each
  - Late payment (paid after due date): -10 points each
  - Bonus: 6 consecutive on-time payments: +5 points
  - New accounts (no history): default 80
- **Status Thresholds**:
  - Good: No missed/late payments
  - Warning: 1+ late payments
  - Bad: 1+ missed payments

### 2. Credit Utilization (30%)
- **Input**: Current balance + average of last 3 statements (60/40 weighting)
- **Scoring Logic**:
  - ≤10%: 100 points
  - 10-30%: 90 points
  - 30-50%: 70 points
  - 50-75%: 40 points
  - 75%+: 10 points
- **Status Thresholds**:
  - Good: <30%
  - Warning: 30-50%
  - Bad: >50%

### 3. Debt-to-Income Proxy (20%)
- **Input**: Monthly minimum due / Monthly paycheck deposits
- **Scoring Logic**:
  - ≤10%: 100 points
  - 10-20%: 85 points
  - 20-35%: 65 points
  - 35-50%: 40 points
  - 50%+: 15 points
  - No income data: 60 points (baseline)
- **Status Thresholds**:
  - Good: <20%
  - Warning: 20-35%
  - Bad: >35%

### 4. Account Age / History Length (10%)
- **Input**: Months since account open date
- **Scoring Logic**:
  - <3 months: 30 points
  - 3-6 months: 45 points
  - 6-12 months: 60 points
  - 12-24 months: 75 points
  - 24-60 months: 90 points
  - 60+ months: 100 points
- **Status Thresholds**:
  - Good: >12 months
  - Warning: 6-12 months
  - Bad: <6 months

## Final Score Calculation

```
W = 0.40 × PaymentHistory + 0.30 × Utilization + 0.20 × DTI + 0.10 × HistoryLength
ToyScore = 300 + (W/100) × 550
```

Clamped to [300, 850]

## Synthetic Data Generation

### Healthy Profile
- **Credit Limit**: $5,000
- **Current Balance**: $750 (15% utilization)
- **Account Age**: 24 months
- **Billing History**: 12 cycles, all paid on time
- **Monthly Income**: ~$4,000 (bi-weekly $2,000 deposits)
- **Expected Score Range**: 720-760

### Risky Profile
- **Credit Limit**: $3,000
- **Current Balance**: $1,950 (65% utilization)
- **Account Age**: 8 months
- **Billing History**: 8 cycles with 1 missed payment, 1 late payment
- **Monthly Income**: ~$2,400
- **Expected Score Range**: 560-620

## Scenario Simulations

### Purchase Scenario
- Increases current balance
- Recalculates utilization
- Detects "large purchase" if >20% of credit limit
- Projects score impact based on new utilization tier

### Missed Payment Scenario
- Marks latest billing cycle as unpaid
- Applies severe penalty (-110 points base)
- Generates 180-day recovery timeline

### Pay Down Scenario
- Reduces balance by payment amount
- Recalculates utilization
- Bonus for crossing 30% utilization threshold downward

### Transaction Replay
- Simulates a past transaction in current credit context
- Shows "what if" impact on today's score

## Recovery Timelines

For negative events, the system generates recovery projections:

**Missed Payment Recovery**
- 30 days: +15 points (with on-time payment)
- 90 days: +40 points
- 180 days: +70 points

**High Utilization Recovery**
- Immediate: Pay down to <30% for instant improvement
- 30 days: Gradual improvement with responsible use
- 90 days: Return to baseline if maintained

## API Endpoints

### POST /api/synthetic/generate
Generate a synthetic profile
```json
{
  "type": "healthy" | "risky"
}
```

### GET /api/synthetic/:profileId
Retrieve synthetic profile with full history

### GET /api/toyscore/:profileId
Get computed toy score with factor breakdown

### GET /api/toyscore/:profileId/credit
Get toy score formatted as CreditData for UI compatibility

### POST /api/toyscore/simulate
Run scenario simulation
```json
{
  "profileId": "string",
  "scenario": {
    "type": "purchase" | "missed_payment" | "pay_down" | "replay_transaction",
    "amount": 100,
    "paymentAmount": 100
  }
}
```

## UI Components

### ToyScoreDisclaimer
Yellow warning banner displayed on all toy score views:
- Explains educational purpose
- Lists 4 factors and weights
- Disclaims FICO/VantageScore equivalence

### Display Rules
- Always show disclaimer when `isToyScore === true`
- Label score as "Educational Score (Toy Model)"
- Show factor weights (40/30/20/10) in UI
- Display factor sub-scores (0-100) alongside overall score
- In Projected Mode, show side-by-side factor comparison

## Data Storage

- **Backend**: In-memory Map (syntheticProfiles)
- **Frontend**: localStorage
  - `creditkeeper_toy_mode`: boolean
  - `creditkeeper_synthetic_id`: profile ID

## Key Differences from Real Scoring

1. **Simplified Factors**: Only 4 vs 5+ in real models
2. **Linear Thresholds**: Real models use complex ML
3. **No Credit Mix**: Doesn't account for multiple account types
4. **No Hard Inquiries**: Doesn't track credit applications
5. **Instant Calculation**: Real scores update monthly
6. **Synthetic History**: Generated data, not real bureau reports
7. **No Regional/Lender Variations**: Fixed algorithm

## Educational Value

The toy score system teaches:
- Payment history is most important (40%)
- Utilization should stay below 30%
- Debt-to-income matters for affordability
- Credit history takes time to build
- Score changes have time-based recovery
- Different actions have different impacts

## Guardrails

- ⚠️ **Always labeled** as educational/toy model
- ⚠️ **Never claims** real-world equivalence
- ⚠️ **Separate from** any real Nessie/bureau data
- ⚠️ **Clear disclaimers** on every screen
- ⚠️ **Transparent logic** - all rules documented

## Future Enhancements (Not Implemented)

- Multiple account types (installment loans, mortgages)
- Hard inquiry tracking
- Credit mix scoring
- More sophisticated recovery curves
- Regional variations
- Lender-specific scoring models
