import type { PandaState, CreditData, PandaMood, EnvironmentGrade } from '../../../shared/types';

/**
 * State Resolver Engine
 * Maps credit score, factors, and events to panda emotional states
 */

interface StateResolverInput {
  creditData: CreditData | null;
  recentEvent?: 'payment' | 'missedPayment' | 'latePayment' | 'paydown' | 'limitIncrease' | 'largeSpending';
}

/**
 * Calculate panda emotional state based on credit data and events
 *
 * State progression:
 * - Positive: Thriving (800+) → Content (720-799) → Motivated
 * - Neutral: Neutral (640-719) → Concerned (600-639)
 * - Negative: Tired (550-599) → Stressed (500-549) → Sick (<500)
 *
 * Event overrides:
 * - Missed payment → immediate Sick state
 * - Late payment → Stressed state
 * - Positive events → upgrade by 1-2 states
 */
export const calculatePandaState = (input: StateResolverInput | CreditData | null): PandaState => {
  // Handle legacy single-parameter calls
  let creditData: CreditData | null;
  let recentEvent: StateResolverInput['recentEvent'];

  if (input && 'creditData' in input) {
    creditData = input.creditData;
    recentEvent = input.recentEvent;
  } else {
    creditData = input;
  }

  // Default state for no data
  if (!creditData) {
    return {
      mood: 'neutral',
      energy: 50,
      environment: 'dim',
      animation: 'idle'
    };
  }

  const { score, factors } = creditData;
  const utilization = factors.utilization?.value || 0;
  const paymentStatus = factors.paymentHistory?.status || 'good';

  // Event-based overrides (highest priority)
  if (recentEvent === 'missedPayment') {
    return createState('sick', 10, 'stormy');
  }

  if (recentEvent === 'latePayment') {
    return createState('stressed', 30, 'cloudy');
  }

  // Check for severe conditions (missed payments in history)
  const hasMissedPayments = paymentStatus === 'bad' && score < 550;
  if (hasMissedPayments) {
    return createState('sick', 15, 'stormy');
  }

  // Base state determination by score + factors
  let mood: PandaMood = resolveMoodByScore(score, utilization, paymentStatus);

  // Apply positive event upgrades
  if (recentEvent === 'paydown' || recentEvent === 'limitIncrease') {
    mood = upgradeMood(mood, 1);
  }

  if (recentEvent === 'payment' && mood !== 'thriving') {
    mood = 'motivated';
  }

  // Apply negative event downgrades
  if (recentEvent === 'largeSpending') {
    mood = downgradeMood(mood, 1);
  }

  const energy = calculateEnergy(mood, utilization);
  const environment = resolveEnvironment(mood);

  return createState(mood, energy, environment);
};

/**
 * Resolve mood based on credit score and factors
 */
function resolveMoodByScore(
  score: number,
  utilization: number,
  paymentStatus: 'good' | 'warning' | 'bad'
): PandaMood {
  // Thriving: 800+ with excellent factors
  if (score >= 800 && utilization < 10 && paymentStatus === 'good') {
    return 'thriving';
  }

  // Content: 720-799 with good factors
  if (score >= 720 && utilization < 30 && paymentStatus === 'good') {
    return 'content';
  }

  // Neutral: 640-719 baseline
  if (score >= 640) {
    return utilization > 50 ? 'concerned' : 'neutral';
  }

  // Concerned: 600-639 early warning
  if (score >= 600) {
    return 'concerned';
  }

  // Tired: 550-599 fatigue from rising utilization
  if (score >= 550) {
    return utilization > 70 ? 'stressed' : 'tired';
  }

  // Stressed: 500-549 stronger warning
  if (score >= 500) {
    return 'stressed';
  }

  // Sick: <500 severe situation
  return 'sick';
}

/**
 * Upgrade mood by N levels (for positive events)
 */
function upgradeMood(currentMood: PandaMood, levels: number): PandaMood {
  const progression: PandaMood[] = [
    'sick', 'stressed', 'tired', 'concerned', 'neutral', 'content', 'thriving'
  ];

  const currentIndex = progression.indexOf(currentMood);
  const newIndex = Math.min(currentIndex + levels, progression.length - 1);

  return progression[newIndex];
}

/**
 * Downgrade mood by N levels (for negative events)
 */
function downgradeMood(currentMood: PandaMood, levels: number): PandaMood {
  const progression: PandaMood[] = [
    'sick', 'stressed', 'tired', 'concerned', 'neutral', 'content', 'thriving'
  ];

  const currentIndex = progression.indexOf(currentMood);
  const newIndex = Math.max(currentIndex - levels, 0);

  return progression[newIndex];
}

/**
 * Calculate energy level based on mood and utilization
 */
function calculateEnergy(mood: PandaMood, utilization: number): number {
  const baseEnergy: Record<PandaMood, number> = {
    thriving: 95,
    content: 80,
    motivated: 85,
    neutral: 60,
    concerned: 45,
    tired: 30,
    stressed: 20,
    sick: 10
  };

  let energy = baseEnergy[mood];

  // Adjust based on utilization
  if (utilization > 80) energy -= 10;
  else if (utilization > 50) energy -= 5;

  return Math.max(5, Math.min(100, energy));
}

/**
 * Resolve environment grade based on mood
 */
function resolveEnvironment(mood: PandaMood): EnvironmentGrade {
  switch (mood) {
    case 'thriving':
      return 'lush';
    case 'content':
    case 'motivated':
      return 'bright';
    case 'neutral':
    case 'concerned':
      return 'dim';
    case 'tired':
      return 'cloudy';
    case 'stressed':
    case 'sick':
      return 'stormy';
  }
}

/**
 * Create panda state with animation
 */
function createState(
  mood: PandaMood,
  energy: number,
  environment: EnvironmentGrade
): PandaState {
  return {
    mood,
    energy,
    environment,
    animation: 'idle',
    transitionProgress: 0
  };
}

/**
 * Get environment colors with smooth gradients
 */
export const getEnvironmentColors = (environment: EnvironmentGrade) => {
  switch (environment) {
    case 'lush':
      return {
        sky: 'linear-gradient(180deg, #87CEEB 0%, #B0E2FF 100%)',
        ground: '#90EE90',
        trees: '#228B22',
        accent: '#FFD700', // Golden sunlight
        saturation: 1.2
      };
    case 'bright':
      return {
        sky: 'linear-gradient(180deg, #87CEEB 0%, #ADD8E6 100%)',
        ground: '#9ACD32',
        trees: '#2E8B57',
        accent: '#FFA500',
        saturation: 1.0
      };
    case 'dim':
      return {
        sky: 'linear-gradient(180deg, #B0C4DE 0%, #D3D3D3 100%)',
        ground: '#8FBC8F',
        trees: '#6B8E23',
        accent: '#FFA07A',
        saturation: 0.8
      };
    case 'cloudy':
      return {
        sky: 'linear-gradient(180deg, #778899 0%, #A9A9A9 100%)',
        ground: '#8FBC8F',
        trees: '#556B2F',
        accent: '#CD853F',
        saturation: 0.6
      };
    case 'stormy':
      return {
        sky: 'linear-gradient(180deg, #696969 0%, #808080 100%)',
        ground: '#6B8E23',
        trees: '#2F4F2F',
        accent: '#A9A9A9',
        saturation: 0.4
      };
  }
};

/**
 * Get mood description for accessibility
 */
export const getMoodDescription = (mood: PandaMood): string => {
  switch (mood) {
    case 'thriving':
      return 'Your panda is thriving! Excellent credit health with outstanding practices.';
    case 'content':
      return 'Your panda is content and stable. Good credit management!';
    case 'motivated':
      return 'Your panda is motivated! Great job on that positive action.';
    case 'neutral':
      return 'Your panda is doing okay. Maintaining baseline credit health.';
    case 'concerned':
      return 'Your panda is mildly concerned. Watch your credit factors closely.';
    case 'tired':
      return 'Your panda is feeling tired. High utilization or spending is taking a toll.';
    case 'stressed':
      return 'Your panda is stressed! Credit factors are approaching concerning thresholds.';
    case 'sick':
      return 'Your panda is sick and needs immediate care. Severe credit issues detected.';
  }
};

/**
 * Get mood emoji for quick visual reference
 */
export const getMoodEmoji = (mood: PandaMood): string => {
  switch (mood) {
    case 'thriving':
      return '🌟';
    case 'content':
      return '😊';
    case 'motivated':
      return '💪';
    case 'neutral':
      return '😐';
    case 'concerned':
      return '😟';
    case 'tired':
      return '😓';
    case 'stressed':
      return '😰';
    case 'sick':
      return '😷';
  }
};

/**
 * Get mood color for UI elements
 */
export const getMoodColor = (mood: PandaMood): string => {
  switch (mood) {
    case 'thriving':
      return '#FFD700'; // Gold
    case 'content':
      return '#4CAF50'; // Green
    case 'motivated':
      return '#2196F3'; // Blue
    case 'neutral':
      return '#9E9E9E'; // Gray
    case 'concerned':
      return '#FF9800'; // Orange
    case 'tired':
      return '#FF9800'; // Orange
    case 'stressed':
      return '#FF5722'; // Deep Orange
    case 'sick':
      return '#F44336'; // Red
  }
};
