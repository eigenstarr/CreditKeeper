import type { CreditData, Account, SyntheticProfile, ToyScoreResult } from '../../shared/types.js';
import { getMockCreditData } from './mockData.js';
import { ToyScoreEngine } from './toyScoreEngine.js';

export class CreditService {
  getCreditData(account: Account): CreditData {
    return getMockCreditData(account);
  }

  getToyScoreCreditData(profile: SyntheticProfile): CreditData {
    const engine = new ToyScoreEngine(profile);
    const toyScore = engine.computeScore();

    return this.convertToyScoreToCreditData(toyScore);
  }

  private convertToyScoreToCreditData(toyScore: ToyScoreResult): CreditData {
    return {
      score: toyScore.finalScore,
      healthLevel: toyScore.healthLevel,
      factors: {
        paymentHistory: {
          name: toyScore.factors.paymentHistory.name,
          value: toyScore.factors.paymentHistory.score,
          status: toyScore.factors.paymentHistory.status,
          explanation: toyScore.factors.paymentHistory.explanation
        },
        utilization: {
          name: toyScore.factors.utilization.name,
          value: toyScore.factors.utilization.value || toyScore.factors.utilization.score,
          status: toyScore.factors.utilization.status,
          explanation: toyScore.factors.utilization.explanation
        },
        creditLimit: {
          name: 'Debt-to-Income Proxy',
          value: toyScore.factors.debtToIncome.score,
          status: toyScore.factors.debtToIncome.status,
          explanation: toyScore.factors.debtToIncome.explanation
        },
        accountAge: {
          name: toyScore.factors.historyLength.name,
          value: toyScore.factors.historyLength.score,
          status: toyScore.factors.historyLength.status,
          explanation: toyScore.factors.historyLength.explanation
        }
      },
      lastUpdated: toyScore.lastUpdated
    };
  }

  calculateHealthLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 700) return 'high';
    if (score >= 640) return 'medium';
    return 'low';
  }
}

export const creditService = new CreditService();
