import type { PandaState, CreditData } from '../../../shared/types';

export const calculatePandaState = (creditData: CreditData | null): PandaState => {
  if (!creditData) {
    return {
      mood: 'neutral',
      energy: 50,
      environment: 'dim'
    };
  }

  const { healthLevel, factors } = creditData;
  const utilization = factors.utilization.value;
  const paymentStatus = factors.paymentHistory.status;

  let mood: PandaState['mood'] = 'neutral';
  let energy = 50;
  let environment: PandaState['environment'] = 'dim';

  if (healthLevel === 'high' && utilization < 30 && paymentStatus === 'good') {
    mood = 'happy';
    energy = 90;
    environment = 'bright';
  } else if (healthLevel === 'high') {
    mood = 'happy';
    energy = 75;
    environment = 'bright';
  } else if (healthLevel === 'medium') {
    mood = 'neutral';
    energy = 50;
    environment = 'dim';
  } else {
    mood = utilization > 70 || paymentStatus === 'bad' ? 'weak' : 'sad';
    energy = 25;
    environment = 'cloudy';
  }

  return { mood, energy, environment };
};

export const getEnvironmentColors = (environment: PandaState['environment']) => {
  switch (environment) {
    case 'bright':
      return {
        sky: '#87CEEB',
        ground: '#90EE90',
        trees: '#228B22'
      };
    case 'dim':
      return {
        sky: '#B0C4DE',
        ground: '#9ACD32',
        trees: '#6B8E23'
      };
    case 'cloudy':
      return {
        sky: '#708090',
        ground: '#8FBC8F',
        trees: '#556B2F'
      };
  }
};

export const getMoodDescription = (mood: PandaState['mood']): string => {
  switch (mood) {
    case 'happy':
      return 'Your panda is happy and energetic!';
    case 'neutral':
      return 'Your panda is doing okay.';
    case 'sad':
      return 'Your panda is feeling down.';
    case 'weak':
      return 'Your panda is struggling and needs care.';
  }
};
