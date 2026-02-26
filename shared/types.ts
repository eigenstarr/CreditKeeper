export interface CreditFactor {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'bad';
  explanation: string;
}

export interface CreditData {
  score: number;
  healthLevel: 'high' | 'medium' | 'low';
  factors: {
    utilization: CreditFactor;
    paymentHistory: CreditFactor;
    creditLimit: CreditFactor;
    accountAge?: CreditFactor;
  };
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  merchant?: string;
  category?: string;
}

export interface Account {
  id: string;
  type: string;
  balance: number;
  creditLimit?: number;
  nickname?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  address: {
    streetNumber: string;
    streetName: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface ProjectedScenario {
  type: 'purchase' | 'missed_payment' | 'pay_down' | 'replay_transaction';
  amount?: number;
  merchant?: string;
  category?: string;
  transactionId?: string;
  paymentAmount?: number;
}

export interface ProjectedResult {
  currentScore: number;
  projectedScore: number;
  scoreDelta: number;
  factorAffected: string;
  explanation: string;
  recoveryTimeline?: {
    days30: number;
    days90: number;
    days180: number;
  };
  correctiveAction?: string;
}

export interface UserProfile {
  pandaName: string;
  customerId: string;
  accountId: string;
  financialXP: number;
  streak: number;
  completedMissions: string[];
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  scenario?: string;
  correctAnswer?: string;
}

export type AppMode = 'real' | 'projected';

export interface PandaState {
  mood: 'happy' | 'neutral' | 'sad' | 'weak';
  energy: number;
  environment: 'bright' | 'dim' | 'cloudy';
}

export interface BillingCycle {
  id: string;
  statementStart: string;
  statementEnd: string;
  dueDate: string;
  statementBalance: number;
  minimumDue: number;
  paidAmount: number;
  paidOnTime: boolean;
  isPaid: boolean;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  source: 'checking' | 'external';
  billingCycleId: string;
}

export interface CheckingAccount {
  id: string;
  balance: number;
  deposits: Array<{
    id: string;
    amount: number;
    date: string;
    description: string;
    type: 'paycheck' | 'other';
  }>;
}

export interface SyntheticProfile {
  id: string;
  name: string;
  type: 'healthy' | 'risky';
  creditCardAccount: Account & {
    apr: number;
    openDate: string;
    status: 'active';
  };
  checkingAccount?: CheckingAccount;
  transactions: Transaction[];
  billingCycles: BillingCycle[];
  payments: Payment[];
  createdAt: string;
}

export interface FactorScore {
  name: string;
  score: number;
  value?: number; // Actual value (e.g., utilization %, DTI %, months)
  weight: number;
  status: 'good' | 'warning' | 'bad';
  explanation: string;
  details?: string;
}

export interface ToyScoreResult {
  finalScore: number;
  healthLevel: 'high' | 'medium' | 'low';
  factors: {
    paymentHistory: FactorScore;
    utilization: FactorScore;
    debtToIncome: FactorScore;
    historyLength: FactorScore;
  };
  topDrivers: {
    positive: string[];
    negative: string[];
  };
  isToyScore: true;
  lastUpdated: string;
}

export interface ToyScoreProjection extends ProjectedResult {
  factorBreakdown: {
    current: ToyScoreResult;
    projected: ToyScoreResult;
  };
  primaryFactorChange: {
    factorName: string;
    scoreDelta: number;
    explanation: string;
  };
}
