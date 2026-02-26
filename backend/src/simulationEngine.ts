import type { CreditData, ProjectedScenario, ProjectedResult, Account } from '../../shared/types.js';

export class SimulationEngine {
  private baseScore: number;
  private currentUtilization: number;
  private creditLimit: number;
  private currentBalance: number;

  constructor(creditData: CreditData, account: Account) {
    this.baseScore = creditData.score;
    this.currentUtilization = creditData.factors.utilization.value;
    this.creditLimit = account.creditLimit || 5000;
    this.currentBalance = account.balance;
  }

  simulate(scenario: ProjectedScenario): ProjectedResult {
    switch (scenario.type) {
      case 'purchase':
        return this.simulatePurchase(scenario.amount || 0);
      case 'missed_payment':
        return this.simulateMissedPayment();
      case 'pay_down':
        return this.simulatePayDown(scenario.paymentAmount || 0);
      case 'replay_transaction':
        return this.simulateReplayTransaction(scenario.amount || 0);
      default:
        throw new Error('Unknown scenario type');
    }
  }

  private simulatePurchase(amount: number): ProjectedResult {
    const newBalance = this.currentBalance + amount;
    const newUtilization = (newBalance / this.creditLimit) * 100;
    const utilizationChange = newUtilization - this.currentUtilization;

    let scoreDelta = 0;
    let explanation = '';
    let correctiveAction = '';
    let recoveryTimeline = undefined;

    const isLargePurchase = amount > this.creditLimit * 0.2;

    if (isLargePurchase && newUtilization > 30) {
      scoreDelta = -25;
      explanation = `Large purchase of $${amount.toFixed(2)} increases utilization from ${this.currentUtilization.toFixed(1)}% to ${newUtilization.toFixed(1)}%. This is above the recommended 30% threshold.`;
      correctiveAction = `Pay down $${(newBalance - this.creditLimit * 0.3).toFixed(2)} to bring utilization back below 30%.`;
      recoveryTimeline = {
        days30: Math.min(850, this.baseScore + scoreDelta + 5),
        days90: Math.min(850, this.baseScore + scoreDelta + 15),
        days180: Math.min(850, this.baseScore)
      };
    } else if (newUtilization > 50) {
      scoreDelta = -35;
      explanation = `This purchase pushes utilization to ${newUtilization.toFixed(1)}%, which is very high. High utilization significantly impacts credit scores.`;
      correctiveAction = `Pay down at least $${(newBalance - this.creditLimit * 0.3).toFixed(2)} to improve your score.`;
      recoveryTimeline = {
        days30: Math.min(850, this.baseScore + scoreDelta + 8),
        days90: Math.min(850, this.baseScore + scoreDelta + 20),
        days180: Math.min(850, this.baseScore + scoreDelta + 28)
      };
    } else if (newUtilization > 30) {
      scoreDelta = Math.floor(-utilizationChange * 0.8);
      explanation = `Utilization increases from ${this.currentUtilization.toFixed(1)}% to ${newUtilization.toFixed(1)}%. Keep it below 30% for optimal credit health.`;
      correctiveAction = 'Consider paying down your balance before making large purchases.';
    } else if (utilizationChange < 10) {
      scoreDelta = Math.floor(-utilizationChange * 0.3);
      explanation = `Small increase in utilization from ${this.currentUtilization.toFixed(1)}% to ${newUtilization.toFixed(1)}%. Still within healthy range.`;
      correctiveAction = 'Continue making on-time payments and keep utilization low.';
    } else {
      scoreDelta = Math.floor(-utilizationChange * 0.5);
      explanation = `Utilization increases from ${this.currentUtilization.toFixed(1)}% to ${newUtilization.toFixed(1)}%. Still manageable.`;
      correctiveAction = 'Pay down balance to maintain low utilization.';
    }

    return {
      currentScore: this.baseScore,
      projectedScore: this.baseScore + scoreDelta,
      scoreDelta,
      factorAffected: 'Credit Utilization',
      explanation,
      correctiveAction,
      recoveryTimeline
    };
  }

  private simulateMissedPayment(): ProjectedResult {
    const scoreDelta = -110;

    return {
      currentScore: this.baseScore,
      projectedScore: this.baseScore + scoreDelta,
      scoreDelta,
      factorAffected: 'Payment History',
      explanation: 'Missing a payment severely impacts your credit score. Payment history is the most important factor.',
      correctiveAction: 'Make payment immediately to minimize damage. Set up autopay to prevent future missed payments.',
      recoveryTimeline: {
        days30: Math.min(850, this.baseScore + scoreDelta + 15),
        days90: Math.min(850, this.baseScore + scoreDelta + 40),
        days180: Math.min(850, this.baseScore + scoreDelta + 70)
      }
    };
  }

  private simulatePayDown(paymentAmount: number): ProjectedResult {
    const newBalance = Math.max(0, this.currentBalance - paymentAmount);
    const newUtilization = (newBalance / this.creditLimit) * 100;
    const utilizationChange = this.currentUtilization - newUtilization;

    let scoreDelta = 0;
    let explanation = '';

    const isSignificantPayDown = paymentAmount > this.currentBalance * 0.15;

    if (isSignificantPayDown && this.currentUtilization > 30 && newUtilization < 30) {
      scoreDelta = Math.floor(utilizationChange * 1.2);
      explanation = `Paying down $${paymentAmount.toFixed(2)} brings utilization from ${this.currentUtilization.toFixed(1)}% to ${newUtilization.toFixed(1)}%, below the 30% threshold. Excellent move!`;
    } else if (isSignificantPayDown) {
      scoreDelta = Math.floor(utilizationChange * 1.0);
      explanation = `Significant payment of $${paymentAmount.toFixed(2)} reduces utilization from ${this.currentUtilization.toFixed(1)}% to ${newUtilization.toFixed(1)}%. This will help your score.`;
    } else {
      scoreDelta = Math.floor(utilizationChange * 0.6);
      explanation = `Paying down $${paymentAmount.toFixed(2)} reduces utilization from ${this.currentUtilization.toFixed(1)}% to ${newUtilization.toFixed(1)}%.`;
    }

    return {
      currentScore: this.baseScore,
      projectedScore: this.baseScore + scoreDelta,
      scoreDelta,
      factorAffected: 'Credit Utilization',
      explanation,
      correctiveAction: 'Keep making payments on time and maintain low utilization.'
    };
  }

  private simulateReplayTransaction(amount: number): ProjectedResult {
    return this.simulatePurchase(amount);
  }
}
