# CreditKeeper

A web application that uses a cute animated red panda as a "credit pet" that mirrors your credit score and credit health. Built for the Capital One Hackathon using the Nessie API.

## Product Overview

CreditKeeper helps young professionals (22-30) build credit literacy through an engaging, visual experience. Your red panda companion reflects your real credit health and helps you understand how financial decisions impact your credit score.

### Two Core Modes

**Real Mode (Actual)**
- Pet and environment strictly reflect real credit data from Capital One API
- Shows current credit score, utilization, payment history, and other factors
- Pet mood and environment change based on actual credit health
- Strong reactions to missed payments and large purchases

**Projected Mode (Simulation)**
- Run "what-if" scenarios to see projected score changes
- Side-by-side comparison: current pet vs projected pet
- Simulate: hypothetical purchases, missed payments, balance pay-downs
- Shows recovery timelines with corrective actions

### Financial XP System

- Complete educational missions to earn XP and badges
- 7 missions covering credit fundamentals
- XP does NOT affect pet health - only for learning progress
- Separate from Real Mode to maintain integrity

## Features

✅ Animated red panda with mood states (happy, neutral, sad, weak)
✅ Dynamic environment (bright forest, dim, cloudy) based on credit health
✅ Real-time credit factor tracking (utilization, payment history, etc.)
✅ Scenario simulation with score delta projections
✅ Transaction history with replay functionality
✅ Recovery timeline visualization (30/90/180 days)
✅ Educational missions system
✅ Panda naming during onboarding
✅ Mock data fallback for demo/testing

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite (build tool)
- Framer Motion (animations)
- TailwindCSS (styling)
- Axios (API client)

**Backend**
- Node.js + Express + TypeScript
- Capital One Nessie API integration
- Credit simulation engine
- Mock data for testing

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone and install dependencies**

```bash
cd CreditKeeper
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

2. **Configure Backend**

Create `backend/.env` file:

```env
PORT=3001
NESSIE_API_KEY=your_api_key_here
NESSIE_BASE_URL=http://api.nessieisreal.com
NODE_ENV=development
```

**Note:** If you don't have a Nessie API key, the app will run in **Mock Data Mode** automatically. You'll see a warning banner in the UI.

3. **Run the Application**

From the root directory:

```bash
npm run dev
```

This starts:
- Backend API on http://localhost:3001
- Frontend on http://localhost:3000

Open http://localhost:3000 in your browser.

### Alternative: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Usage Guide

### First Time Setup

1. Click "Get Started" on the welcome screen
2. App connects to Capital One API (or uses mock data)
3. Name your red panda companion
4. Complete the onboarding tutorial

### Real Mode

- View your panda and environment reflecting real credit health
- Check energy level and mood
- See top factors affecting credit (if any issues)
- Navigate to Score View for detailed factor breakdown

### Projected Mode

1. Click "Run Scenarios" from Pet View
2. Select scenario type:
   - **Hypothetical Purchase**: See impact of a new purchase
   - **Pay Down Balance**: Project score improvement from payment
   - **Missed Payment**: See consequences of missing a payment
3. Enter amount (if required)
4. Click "Run Simulation"
5. View side-by-side comparison with score delta
6. See recovery timeline for negative scenarios

### Transaction Replay

1. Navigate to "View Transactions"
2. Click on any past transaction
3. Click "Replay in Projected Mode"
4. See what that transaction would do to your current credit situation

### Learning Missions

1. Navigate to "Learn & Earn XP"
2. Click on any mission to read the scenario
3. Click "Complete Mission" to earn XP
4. Track your progress: XP, completed missions, and streak

## Demo Flow (for Hackathon)

1. **Onboarding** - Name panda (e.g., "Spark")
2. **Real Mode** - Show Spark reflecting actual data
3. **Toggle to Projected Mode**
4. **Simulate Large Purchase** - e.g., $1,500
   - See sad panda
   - View "Utilization ↑" factor
   - Show recovery timeline
5. **Simulate Pay Down** - e.g., $800
   - See happier panda
   - View "Utilization ↓" factor
6. **Learn Tab** - Show missions (XP doesn't affect Spark)
7. **Transaction Replay** - Pick a past transaction and replay it

## Architecture

```
/backend
  /src
    index.ts          # Express server + API routes
    nessieClient.ts   # Capital One API integration
    simulationEngine.ts # Credit score projection logic
    creditService.ts  # Credit data mapping
    mockData.ts       # Fallback demo data
    config.ts         # Environment config

/frontend
  /src
    /components
      RedPanda.tsx         # Animated SVG panda
      Environment.tsx      # Dynamic background
      ModeToggle.tsx       # Real/Projected switcher
      RecoveryTimeline.tsx # Timeline visualization
    /screens
      Onboarding.tsx   # Name panda + setup
      Home.tsx         # Main wrapper
      PetView.tsx      # Real Mode pet display
      ScoreView.tsx    # Detailed score breakdown
      ProjectedMode.tsx # Simulation workspace
      Transactions.tsx # Transaction list + replay
      Learn.tsx        # Missions + XP
    /contexts
      AppContext.tsx   # Global state
    /utils
      pandaLogic.ts    # Health calculation logic
    api.ts             # Backend API client
    App.tsx            # Root component

/shared
  types.ts            # Shared TypeScript types
```

## API Endpoints

**GET /api/health** - Health check + mock data status
**GET /api/customers** - Get customers
**GET /api/customers/:id** - Get customer by ID
**GET /api/customers/:id/accounts** - Get customer accounts
**GET /api/accounts/:id** - Get account details
**GET /api/accounts/:id/transactions** - Get transactions
**GET /api/accounts/:id/credit** - Get credit data
**POST /api/simulate** - Run scenario simulation
**GET /api/missions** - Get education missions
**POST /api/missions/:id/complete** - Complete mission
**GET /api/profile/:id** - Get user profile
**POST /api/profile** - Create profile
**PUT /api/profile/:id** - Update profile

## Credit Simulation Logic

The simulation engine uses a hybrid approach:

**Utilization Impact**
- < 30% utilization: Good (minimal score impact)
- 30-50% utilization: Warning (moderate negative impact)
- > 50% utilization: Bad (significant negative impact)
- Large purchases (>20% of limit): Strong negative reaction

**Payment History**
- Missed payment: -110 points with long recovery (180+ days)
- On-time payments: Positive reinforcement

**Balance Pay-Down**
- Significant pay-down (>15% of balance): Positive score impact
- Bringing utilization below 30%: Extra benefit

**Recovery Timeline**
- 30 days: Small improvement
- 90 days: Moderate recovery
- 180 days: Near-full recovery (with responsible behavior)

## Configuration

### Mock Data Mode

If no `NESSIE_API_KEY` is provided, the app automatically uses mock data:
- Demo customer "Alex Chen"
- Credit card with $5,000 limit, $1,200 balance
- 5 sample transactions
- Credit score: 720
- Utilization: 24%

### Environment Variables

**Backend (.env)**
```
PORT=3001
NESSIE_API_KEY=<your_key>
NESSIE_BASE_URL=http://api.nessieisreal.com
NODE_ENV=development
USE_MOCK_DATA=false  # Optional: force mock data
```

## Future Roadmap

- Multiple pets (zoo of credit pets)
- Different pet types (not just red panda)
- Cosmetic customization
- More factor coverage (inquiries, account age, credit mix)
- ML-based projection improvements
- Social features (compare anonymized progress)
- Push notifications for credit alerts
- Integration with additional financial APIs

## Troubleshooting

**Issue: "Failed to connect" during onboarding**
- Check backend is running on port 3001
- Verify `NESSIE_API_KEY` in backend/.env (or let it use mock data)
- Check browser console for errors

**Issue: Panda not animating**
- Ensure Framer Motion is installed: `cd frontend && npm install framer-motion`
- Clear browser cache

**Issue: API calls failing**
- Check backend logs for errors
- Verify Nessie API key is valid
- App will fall back to mock data automatically

**Issue: "Demo Data Mode" banner won't go away**
- Add valid `NESSIE_API_KEY` to backend/.env
- Restart backend server

## Contributing

This is a hackathon MVP. For production use:
- Add proper authentication/authorization
- Implement secure credential storage
- Add comprehensive error handling
- Write unit and integration tests
- Add rate limiting and caching
- Improve accessibility (ARIA labels, keyboard navigation)
- Add multi-user support with database

## License

MIT License - Built for Capital One Hackathon 2026

---

**Built with ❤️ for credit literacy and financial education**
