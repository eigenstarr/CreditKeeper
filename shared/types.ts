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

export type LoanType = 'auto' | 'student' | 'personal' | 'line_of_credit';

export type LoanPurpose = 'car' | 'education' | 'debt_consolidation' | 'lifestyle' | 'home_improvement' | 'other';

export type LoanReasonableness = 'reasonable' | 'stretch' | 'unreasonable';

export interface LoanScenario {
  loanAmount: number;
  loanType: LoanType;
  termMonths: number;
  apr: number;
  monthlyIncome?: number;
  purpose?: LoanPurpose;
}

export interface LoanReasonablenessRating {
  rating: LoanReasonableness;
  monthlyPayment: number;
  newDTI: number;
  reasons: string[];
  suggestions: string[];
  dtiImpact: 'healthy' | 'moderate' | 'high';
  aprAssessment: 'healthy' | 'expensive' | 'high-risk';
  loanToIncomeRatio: number;
}

export interface ProjectedScenario {
  type: 'purchase' | 'missed_payment' | 'pay_down' | 'replay_transaction' | 'new_loan';
  amount?: number;
  merchant?: string;
  category?: string;
  transactionId?: string;
  paymentAmount?: number;
  loan?: LoanScenario;
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
  loanRating?: LoanReasonablenessRating;
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
  choices?: string[]; // Multiple choice options
}

export type AppMode = 'real' | 'projected';

export type PandaMood =
  | 'thriving'    // Very healthy, energetic/playful (800+)
  | 'content'     // Calm, stable, mild happiness (720-799)
  | 'motivated'   // Alert/engaged, after positive action
  | 'neutral'     // Baseline, calm (640-719)
  | 'concerned'   // Mild worry, early warning (600-639)
  | 'tired'       // Fatigue from rising utilization (550-599)
  | 'stressed'    // Stronger warning near threshold (500-549)
  | 'sick';       // Severe events like missed payment (<500)

export type EnvironmentGrade =
  | 'lush'        // Bright, warm, lush forest (thriving)
  | 'bright'      // Normal daylight forest (content/motivated)
  | 'dim'         // Light cloud cover, slightly dimmer (neutral/concerned)
  | 'cloudy'      // Cloudy, muted colors (tired)
  | 'stormy';     // Cloudy + dim, sparse forest (stressed/sick)

export interface PandaState {
  mood: PandaMood;
  energy: number;
  environment: EnvironmentGrade;
  animation?: 'idle' | 'attention' | 'transition' | 'breathing' | 'blinking';
  transitionProgress?: number; // 0-1 for smooth state transitions
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
