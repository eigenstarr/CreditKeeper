import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { nessieClient } from './nessieClient.js';
import { creditService } from './creditService.js';
import { SimulationEngine } from './simulationEngine.js';
import { SyntheticDataGenerator } from './syntheticDataGenerator.js';
import { ToyScoreEngine } from './toyScoreEngine.js';
import { ToySimulationEngine } from './toySimulationEngine.js';
import type { ProjectedScenario, UserProfile, Mission, SyntheticProfile } from '../../shared/types.js';

const app = express();

app.use(cors());
app.use(express.json());

const missions: Mission[] = [
  {
    id: 'mission-1',
    title: 'Understanding Credit Utilization',
    description: 'What happens when your credit utilization goes above 30%?',
    xpReward: 100,
    completed: false,
    scenario: 'Your credit card has a $5,000 limit and you have a $1,200 balance. What is your utilization?',
    correctAnswer: '24%'
  },
  {
    id: 'mission-2',
    title: 'Payment History Basics',
    description: 'Which factor has the biggest impact on your credit score?',
    xpReward: 100,
    completed: false,
    scenario: 'Payment history is the most important factor, accounting for about 35% of your credit score.',
    correctAnswer: 'Payment History'
  },
  {
    id: 'mission-3',
    title: 'Credit Limit Increase',
    description: 'How does a credit limit increase affect your utilization?',
    xpReward: 150,
    completed: false,
    scenario: 'If your limit increases from $5,000 to $10,000 and your balance stays at $1,500, what happens to your utilization?',
    correctAnswer: 'It decreases from 30% to 15%'
  },
  {
    id: 'mission-4',
    title: 'The Cost of Missing Payments',
    description: 'Learn why on-time payments are critical',
    xpReward: 200,
    completed: false,
    scenario: 'A single missed payment can drop your score by 60-110 points and stay on your report for 7 years.',
    correctAnswer: 'Acknowledged'
  },
  {
    id: 'mission-5',
    title: 'Smart Spending Strategy',
    description: 'Learn when to make purchases',
    xpReward: 150,
    completed: false,
    scenario: 'Making large purchases right after your statement closes gives you more time to pay before it affects utilization.',
    correctAnswer: 'After statement closes'
  },
  {
    id: 'mission-6',
    title: 'Recovery Timeline',
    description: 'Understand credit recovery',
    xpReward: 150,
    completed: false,
    scenario: 'After negative events, your score can improve over 3-6 months with responsible behavior.',
    correctAnswer: 'Acknowledged'
  },
  {
    id: 'mission-7',
    title: 'Multiple Cards Strategy',
    description: 'Learn about spreading utilization',
    xpReward: 200,
    completed: false,
    scenario: 'Having multiple cards with low utilization on each is better than maxing out one card.',
    correctAnswer: 'Spread across multiple cards'
  }
];

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mockDataMode: nessieClient.isUsingMockData()
  });
});

app.get('/api/customers', async (req, res) => {
  try {
    const customers = await nessieClient.getCustomers();
    res.json(customers);
  } catch (error) {
    console.error('Error in /api/customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.get('/api/customers/:customerId', async (req, res) => {
  try {
    const customer = await nessieClient.getCustomer(req.params.customerId);
    res.json(customer);
  } catch (error) {
    console.error('Error in /api/customers/:customerId:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

app.get('/api/customers/:customerId/accounts', async (req, res) => {
  try {
    const accounts = await nessieClient.getAccounts(req.params.customerId);
    res.json(accounts);
  } catch (error) {
    console.error('Error in /api/customers/:customerId/accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

app.get('/api/accounts/:accountId', async (req, res) => {
  try {
    const account = await nessieClient.getAccount(req.params.accountId);
    res.json(account);
  } catch (error) {
    console.error('Error in /api/accounts/:accountId:', error);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
});

app.get('/api/accounts/:accountId/transactions', async (req, res) => {
  try {
    const transactions = await nessieClient.getPurchases(req.params.accountId);
    res.json(transactions);
  } catch (error) {
    console.error('Error in /api/accounts/:accountId/transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.get('/api/accounts/:accountId/credit', async (req, res) => {
  try {
    const account = await nessieClient.getAccount(req.params.accountId);
    const creditData = creditService.getCreditData(account);
    res.json(creditData);
  } catch (error) {
    console.error('Error in /api/accounts/:accountId/credit:', error);
    res.status(500).json({ error: 'Failed to fetch credit data' });
  }
});

app.post('/api/simulate', async (req, res) => {
  try {
    const { accountId, scenario } = req.body as { accountId: string; scenario: ProjectedScenario };

    if (!accountId || !scenario) {
      return res.status(400).json({ error: 'accountId and scenario are required' });
    }

    const account = await nessieClient.getAccount(accountId);
    const creditData = creditService.getCreditData(account);

    const engine = new SimulationEngine(creditData, account);
    const result = engine.simulate(scenario);

    res.json(result);
  } catch (error) {
    console.error('Error in /api/simulate:', error);
    res.status(500).json({ error: 'Failed to simulate scenario' });
  }
});

app.get('/api/missions', (req, res) => {
  res.json(missions);
});

app.post('/api/missions/:missionId/complete', (req, res) => {
  const mission = missions.find(m => m.id === req.params.missionId);
  if (!mission) {
    return res.status(404).json({ error: 'Mission not found' });
  }

  mission.completed = true;
  res.json(mission);
});

const userProfiles = new Map<string, UserProfile>();
const syntheticProfiles = new Map<string, SyntheticProfile>();

app.get('/api/profile/:customerId', (req, res) => {
  const profile = userProfiles.get(req.params.customerId);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  res.json(profile);
});

app.post('/api/profile', (req, res) => {
  const profile = req.body as UserProfile;
  userProfiles.set(profile.customerId, profile);
  res.json(profile);
});

app.put('/api/profile/:customerId', (req, res) => {
  const updates = req.body;
  const existing = userProfiles.get(req.params.customerId);

  if (!existing) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const updated = { ...existing, ...updates };
  userProfiles.set(req.params.customerId, updated);
  res.json(updated);
});

app.post('/api/synthetic/generate', (req, res) => {
  try {
    const { type } = req.body as { type: 'excellent' | 'healthy' | 'risky' | 'poor' };

    let profile: SyntheticProfile;
    if (type === 'excellent') {
      profile = SyntheticDataGenerator.generateExcellentProfile();
    } else if (type === 'healthy') {
      profile = SyntheticDataGenerator.generateHealthyProfile();
    } else if (type === 'risky') {
      profile = SyntheticDataGenerator.generateRiskyProfile();
    } else if (type === 'poor') {
      profile = SyntheticDataGenerator.generatePoorProfile();
    } else {
      return res.status(400).json({ error: 'Invalid type. Must be "excellent", "healthy", "risky", or "poor"' });
    }

    syntheticProfiles.set(profile.id, profile);
    res.json(profile);
  } catch (error) {
    console.error('Error generating synthetic profile:', error);
    res.status(500).json({ error: 'Failed to generate synthetic profile' });
  }
});

app.get('/api/synthetic/:profileId', (req, res) => {
  const profile = syntheticProfiles.get(req.params.profileId);
  if (!profile) {
    return res.status(404).json({ error: 'Synthetic profile not found' });
  }
  res.json(profile);
});

app.get('/api/toyscore/:profileId', (req, res) => {
  try {
    const profile = syntheticProfiles.get(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Synthetic profile not found' });
    }

    const engine = new ToyScoreEngine(profile);
    const toyScore = engine.computeScore();
    res.json(toyScore);
  } catch (error) {
    console.error('Error computing toy score:', error);
    res.status(500).json({ error: 'Failed to compute toy score' });
  }
});

app.get('/api/toyscore/:profileId/credit', (req, res) => {
  try {
    const profile = syntheticProfiles.get(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Synthetic profile not found' });
    }

    const creditData = creditService.getToyScoreCreditData(profile);
    res.json(creditData);
  } catch (error) {
    console.error('Error getting toy score credit data:', error);
    res.status(500).json({ error: 'Failed to get credit data' });
  }
});

app.post('/api/toyscore/simulate', (req, res) => {
  try {
    const { profileId, scenario } = req.body as { profileId: string; scenario: ProjectedScenario };

    if (!profileId || !scenario) {
      return res.status(400).json({ error: 'profileId and scenario are required' });
    }

    const profile = syntheticProfiles.get(profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Synthetic profile not found' });
    }

    const engine = new ToySimulationEngine(profile);
    const result = engine.simulate(scenario);

    res.json(result);
  } catch (error) {
    console.error('Error in toy score simulation:', error);
    res.status(500).json({ error: 'Failed to simulate scenario' });
  }
});

app.listen(config.port, () => {
  console.log(`CreditKeeper backend running on port ${config.port}`);
  console.log(`Mock data mode: ${nessieClient.isUsingMockData() ? 'ENABLED' : 'DISABLED'}`);
  if (nessieClient.isUsingMockData()) {
    console.log('⚠️  Using demo data - add NESSIE_API_KEY to .env for real data');
  }
});
