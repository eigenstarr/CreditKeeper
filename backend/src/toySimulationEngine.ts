import type { SyntheticProfile, ProjectedScenario, ToyScoreProjection, BillingCycle, Transaction } from '../../shared/types.js';
import { ToyScoreEngine } from './toyScoreEngine.js';

export class ToySimulationEngine {
  private profile: SyntheticProfile;

  constructor(profile: SyntheticProfile) {
    this.profile = profile;
  }

  simulate(scenario: ProjectedScenario): ToyScoreProjection {
    const currentEngine = new ToyScoreEngine(this.profile);
    const currentScore = currentEngine.computeScore();

    const projectedProfile = this.applyScenario(scenario);
    const projectedEngine = new ToyScoreEngine(projectedProfile);
    const projectedScore = projectedEngine.computeScore();

    const scoreDelta = projectedScore.finalScore - currentScore.finalScore;

    const primaryFactorChange = this.identifyPrimaryFactorChange(currentScore, projectedScore);

    const { explanation, correctiveAction, recoveryTimeline } = this.generateExplanation(
      scenario,
      currentScore,
      projectedScore,
      primaryFactorChange
    );

    return {
      currentScore: currentScore.finalScore,
      projectedScore: projectedScore.finalScore,
      scoreDelta,
      factorAffected: primaryFactorChange.factorName,
      explanation,
      correctiveAction,
      recoveryTimeline,
      factorBreakdown: {
        current: currentScore,
        projected: projectedScore
      },
      primaryFactorChange
    };
  }

  private applyScenario(scenario: ProjectedScenario): SyntheticProfile {
    const cloned: SyntheticProfile = JSON.parse(JSON.stringify(this.profile));

    switch (scenario.type) {
      case 'purchase':
        return this.applyPurchase(cloned, scenario.amount || 0);
      case 'missed_payment':
        return this.applyMissedPayment(cloned);
      case 'pay_down':
        return this.applyPayDown(cloned, scenario.paymentAmount || 0);
      case 'replay_transaction':
        return this.applyReplayTransaction(cloned, scenario.amount || 0);
      default:
        return cloned;
    }
  }

  private applyPurchase(profile: SyntheticProfile, amount: number): SyntheticProfile {
    profile.creditCardAccount.balance += amount;

    const now = new Date();
    const lastCycle = profile.billingCycles[profile.billingCycles.length - 1];
    if (lastCycle && new Date(lastCycle.statementEnd) > now) {
      lastCycle.statementBalance += amount;
      lastCycle.minimumDue = Math.floor(lastCycle.statementBalance * 0.03);
    }

    profile.transactions.unshift({
      id: `txn-projected-${Date.now()}`,
      description: 'Projected Purchase',
      amount,
      date: now.toISOString(),
      merchant: 'Projected Merchant',
      category: 'Shopping'
    });

    return profile;
  }

  private applyMissedPayment(profile: SyntheticProfile): SyntheticProfile {
    const lastCycle = profile.billingCycles[profile.billingCycles.length - 1];
    if (lastCycle) {
      lastCycle.isPaid = false;
      lastCycle.paidOnTime = false;
      lastCycle.paidAmount = 0;
    }

    return profile;
  }

  private applyPayDown(profile: SyntheticProfile, amount: number): SyntheticProfile {
    profile.creditCardAccount.balance = Math.max(0, profile.creditCardAccount.balance - amount);

    const lastCycle = profile.billingCycles[profile.billingCycles.length - 1];
    if (lastCycle) {
      lastCycle.paidAmount += amount;
      if (lastCycle.paidAmount >= lastCycle.minimumDue) {
        lastCycle.isPaid = true;
        lastCycle.paidOnTime = true;
      }
    }

    profile.payments.push({
      id: `payment-projected-${Date.now()}`,
      amount,
      date: new Date().toISOString(),
      source: 'checking',
      billingCycleId: lastCycle?.id || ''
    });

    return profile;
  }

  private applyReplayTransaction(profile: SyntheticProfile, amount: number): SyntheticProfile {
    return this.applyPurchase(profile, amount);
  }

  private identifyPrimaryFactorChange(
    current: any,
    projected: any
  ): { factorName: string; scoreDelta: number; explanation: string } {
    const factors = ['paymentHistory', 'utilization', 'debtToIncome', 'historyLength'];

    let maxChange = 0;
    let primaryFactor = 'Credit Utilization';
    let primaryExplanation = '';

    factors.forEach((factorKey) => {
      const currentFactor = current.factors[factorKey];
      const projectedFactor = projected.factors[factorKey];

      const weightedChange = Math.abs(
        (projectedFactor.score - currentFactor.score) * currentFactor.weight
      );

      if (weightedChange > maxChange) {
        maxChange = weightedChange;
        primaryFactor = currentFactor.name;
        primaryExplanation = projectedFactor.explanation;
      }
    });

    return {
      factorName: primaryFactor,
      scoreDelta: Math.round(maxChange),
      explanation: primaryExplanation
    };
  }

  private generateExplanation(
    scenario: ProjectedScenario,
    currentScore: any,
    projectedScore: any,
    primaryChange: any
  ): { explanation: string; correctiveAction?: string; recoveryTimeline?: any } {
    const scoreDelta = projectedScore.finalScore - currentScore.finalScore;

    let explanation = '';
    let correctiveAction: string | undefined;
    let recoveryTimeline: any | undefined;

    if (scenario.type === 'purchase') {
      const amount = scenario.amount || 0;
      const currentUtil = (this.profile.creditCardAccount.balance / this.profile.creditCardAccount.creditLimit) * 100;
      const newUtil = ((this.profile.creditCardAccount.balance + amount) / this.profile.creditCardAccount.creditLimit) * 100;

      explanation = `Purchase of $${amount.toFixed(2)} increases utilization from ${currentUtil.toFixed(1)}% to ${newUtil.toFixed(1)}%.`;

      if (newUtil > 30) {
        correctiveAction = `Pay down balance to bring utilization below 30% (approximately $${((this.profile.creditCardAccount.balance + amount) - this.profile.creditCardAccount.creditLimit * 0.3).toFixed(2)}).`;
      }

      if (scoreDelta < -20) {
        recoveryTimeline = {
          days30: Math.min(850, projectedScore.finalScore + Math.abs(Math.floor(scoreDelta * 0.2))),
          days90: Math.min(850, projectedScore.finalScore + Math.abs(Math.floor(scoreDelta * 0.5))),
          days180: Math.min(850, currentScore.finalScore)
        };
      }
    } else if (scenario.type === 'missed_payment') {
      explanation = 'Missing a payment severely impacts your score. Payment history accounts for 40% of your toy score.';
      correctiveAction = 'Make payment immediately and set up autopay to prevent future missed payments.';
      recoveryTimeline = {
        days30: Math.min(850, projectedScore.finalScore + 15),
        days90: Math.min(850, projectedScore.finalScore + 40),
        days180: Math.min(850, projectedScore.finalScore + 70)
      };
    } else if (scenario.type === 'pay_down') {
      const amount = scenario.paymentAmount || 0;
      const currentUtil = (this.profile.creditCardAccount.balance / this.profile.creditCardAccount.creditLimit) * 100;
      const newUtil = Math.max(0, (this.profile.creditCardAccount.balance - amount) / this.profile.creditCardAccount.creditLimit) * 100;

      explanation = `Paying down $${amount.toFixed(2)} reduces utilization from ${currentUtil.toFixed(1)}% to ${newUtil.toFixed(1)}%.`;
      correctiveAction = 'Continue making on-time payments and maintain low utilization for continued score improvement.';
    } else if (scenario.type === 'replay_transaction') {
      explanation = `Replaying this transaction shows how it would affect your current credit situation.`;
    }

    return { explanation, correctiveAction, recoveryTimeline };
  }
}
