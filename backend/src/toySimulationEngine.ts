import type { SyntheticProfile, ProjectedScenario, ToyScoreProjection, BillingCycle, Transaction, LoanScenario } from '../../shared/types.js';
import { ToyScoreEngine } from './toyScoreEngine.js';
import { LoanCalculator } from './loanCalculator.js';

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

    // Calculate loan rating if this is a loan scenario
    let loanRating;
    if (scenario.type === 'new_loan' && scenario.loan) {
      loanRating = this.calculateLoanRating(scenario.loan);
    }

    return {
      currentScore: currentScore.finalScore,
      projectedScore: projectedScore.finalScore,
      scoreDelta,
      factorAffected: primaryFactorChange.factorName,
      explanation,
      correctiveAction,
      recoveryTimeline,
      loanRating,
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
      case 'new_loan':
        return this.applyNewLoan(cloned, scenario.loan!);
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

  private applyNewLoan(profile: SyntheticProfile, loan: LoanScenario): SyntheticProfile {
    // Calculate monthly payment for the new loan
    const monthlyPayment = LoanCalculator.calculateMonthlyPayment(loan.loanAmount, loan.apr, loan.termMonths);

    // Update DTI by increasing monthly debt obligations
    // This is simulated by updating the most recent billing cycle's minimum due
    const lastCycle = profile.billingCycles[profile.billingCycles.length - 1];
    if (lastCycle) {
      // Add loan payment to monthly obligations
      lastCycle.minimumDue += monthlyPayment;
    }

    // For line of credit (revolving), add to credit card balance
    if (loan.loanType === 'line_of_credit') {
      profile.creditCardAccount.balance += loan.loanAmount;
      // Increase credit limit to accommodate (simulating opening a new line)
      if (profile.creditCardAccount.creditLimit) {
        profile.creditCardAccount.creditLimit += loan.loanAmount * 1.2;
      } else {
        profile.creditCardAccount.creditLimit = loan.loanAmount * 1.2;
      }
    }

    // Note: We don't add installment loans to the credit card balance
    // In a real system, this would be a separate loan account
    // For the toy model, we primarily track the DTI impact

    return profile;
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
      const limit = this.profile.creditCardAccount.creditLimit || 1;
      const currentUtil = (this.profile.creditCardAccount.balance / limit) * 100;
      const newUtil = ((this.profile.creditCardAccount.balance + amount) / limit) * 100;

      explanation = `Purchase of $${amount.toFixed(2)} increases utilization from ${currentUtil.toFixed(1)}% to ${newUtil.toFixed(1)}%.`;

      if (newUtil > 30) {
        correctiveAction = `Pay down balance to bring utilization below 30% (approximately $${((this.profile.creditCardAccount.balance + amount) - limit * 0.3).toFixed(2)}).`;
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
      const limit = this.profile.creditCardAccount.creditLimit || 1;
      const currentUtil = (this.profile.creditCardAccount.balance / limit) * 100;
      const newUtil = Math.max(0, (this.profile.creditCardAccount.balance - amount) / limit) * 100;

      explanation = `Paying down $${amount.toFixed(2)} reduces utilization from ${currentUtil.toFixed(1)}% to ${newUtil.toFixed(1)}%.`;
      correctiveAction = 'Continue making on-time payments and maintain low utilization for continued score improvement.';
    } else if (scenario.type === 'replay_transaction') {
      explanation = `Replaying this transaction shows how it would affect your current credit situation.`;
    } else if (scenario.type === 'new_loan' && scenario.loan) {
      const loan = scenario.loan;
      const loanTypeLabel = this.getLoanTypeLabel(loan.loanType);

      explanation = `Taking out a ${loanTypeLabel} loan of $${loan.loanAmount.toFixed(2)} at ${loan.apr}% APR for ${loan.termMonths} months affects your debt-to-income ratio and credit mix.`;

      if (scoreDelta < -15) {
        correctiveAction = 'Consider reducing loan amount, extending the term, or improving your credit score before borrowing.';
        recoveryTimeline = {
          days30: Math.min(850, projectedScore.finalScore + Math.abs(Math.floor(scoreDelta * 0.15))),
          days90: Math.min(850, projectedScore.finalScore + Math.abs(Math.floor(scoreDelta * 0.40))),
          days180: Math.min(850, projectedScore.finalScore + Math.abs(Math.floor(scoreDelta * 0.70)))
        };
      } else if (scoreDelta >= 0) {
        correctiveAction = 'Make all loan payments on time to maintain and improve your credit score.';
      } else {
        correctiveAction = 'Small impact expected. Continue responsible credit behavior.';
      }
    }

    return { explanation, correctiveAction, recoveryTimeline };
  }

  private getLoanTypeLabel(loanType: string): string {
    const labels: Record<string, string> = {
      auto: 'auto',
      student: 'student',
      personal: 'personal',
      line_of_credit: 'line of credit'
    };
    return labels[loanType] || loanType;
  }

  private calculateLoanRating(loan: LoanScenario) {
    // Get current monthly debt from billing cycles
    const lastCycle = this.profile.billingCycles[this.profile.billingCycles.length - 1];
    const currentMonthlyDebt = lastCycle ? lastCycle.minimumDue : 0;

    // Determine monthly income
    let monthlyIncome = loan.monthlyIncome;
    if (!monthlyIncome && this.profile.checkingAccount) {
      // Calculate from deposits if available
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentDeposits = this.profile.checkingAccount.deposits.filter(
        (d) => d.type === 'paycheck' && new Date(d.date) >= thirtyDaysAgo
      );
      monthlyIncome = recentDeposits.reduce((sum, d) => sum + d.amount, 0);
    }

    // Default to a reasonable estimate if no income data
    if (!monthlyIncome || monthlyIncome === 0) {
      monthlyIncome = 5000; // Default assumption
    }

    return LoanCalculator.calculateReasonableness(loan, currentMonthlyDebt, monthlyIncome);
  }
}
