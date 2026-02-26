import type { SyntheticProfile, ToyScoreResult, FactorScore } from '../../shared/types.js';

export class ToyScoreEngine {
  private profile: SyntheticProfile;

  constructor(profile: SyntheticProfile) {
    this.profile = profile;
  }

  computeScore(): ToyScoreResult {
    const paymentHistory = this.computePaymentHistory();
    const utilization = this.computeUtilization();
    const debtToIncome = this.computeDebtToIncome();
    const historyLength = this.computeHistoryLength();

    const weightedTotal =
      paymentHistory.score * paymentHistory.weight +
      utilization.score * utilization.weight +
      debtToIncome.score * debtToIncome.weight +
      historyLength.score * historyLength.weight;

    const finalScore = Math.round(300 + (weightedTotal / 100) * 550);
    const clampedScore = Math.max(300, Math.min(850, finalScore));

    const healthLevel: 'high' | 'medium' | 'low' =
      clampedScore >= 700 ? 'high' : clampedScore >= 640 ? 'medium' : 'low';

    const topDrivers = this.identifyTopDrivers({
      paymentHistory,
      utilization,
      debtToIncome,
      historyLength
    });

    return {
      finalScore: clampedScore,
      healthLevel,
      factors: {
        paymentHistory,
        utilization,
        debtToIncome,
        historyLength
      },
      topDrivers,
      isToyScore: true,
      lastUpdated: new Date().toISOString()
    };
  }

  private computePaymentHistory(): FactorScore {
    const cycles = this.profile.billingCycles;

    if (cycles.length === 0) {
      return {
        name: 'Payment History',
        score: 80,
        weight: 0.40,
        status: 'good',
        explanation: 'No payment history yet. Starting with baseline score.',
        details: 'New account with no billing history'
      };
    }

    const last12Cycles = cycles.slice(-12);
    let score = 100;

    const missedPayments = last12Cycles.filter((c) => !c.isPaid && new Date(c.dueDate) < new Date()).length;
    const latePayments = last12Cycles.filter((c) => c.isPaid && !c.paidOnTime).length;

    score -= missedPayments * 25;
    score -= latePayments * 10;

    const recentOnTime = last12Cycles.slice(-6).every((c) => c.paidOnTime || new Date(c.dueDate) > new Date());
    if (recentOnTime && last12Cycles.length >= 6) {
      score += 5;
    }

    score = Math.max(0, Math.min(100, score));

    let status: 'good' | 'warning' | 'bad';
    let explanation: string;

    if (missedPayments > 0) {
      status = 'bad';
      explanation = `${missedPayments} missed payment${missedPayments > 1 ? 's' : ''} in last 12 months. This severely impacts your score.`;
    } else if (latePayments > 0) {
      status = 'warning';
      explanation = `${latePayments} late payment${latePayments > 1 ? 's' : ''} in last 12 months. Try to pay on time to improve.`;
    } else {
      status = 'good';
      explanation = `All ${last12Cycles.length} payment${last12Cycles.length > 1 ? 's' : ''} made on time. Excellent!`;
    }

    return {
      name: 'Payment History',
      score,
      weight: 0.40,
      status,
      explanation,
      details: `Tracking ${last12Cycles.length} billing cycles. Missed: ${missedPayments}, Late: ${latePayments}`
    };
  }

  private computeUtilization(): FactorScore {
    const { balance, creditLimit } = this.profile.creditCardAccount;
    const limit = creditLimit || 1;
    const currentUtil = (balance / limit) * 100;

    const last3Cycles = this.profile.billingCycles.slice(-3);
    const avg3Util =
      last3Cycles.length > 0
        ? last3Cycles.reduce((sum, c) => sum + (c.statementBalance / limit) * 100, 0) / last3Cycles.length
        : currentUtil;

    const combinedUtil = currentUtil * 0.6 + avg3Util * 0.4;

    let score: number;
    let status: 'good' | 'warning' | 'bad';
    let explanation: string;

    if (combinedUtil <= 10) {
      score = 100;
      status = 'good';
      explanation = `Excellent! Current utilization at ${currentUtil.toFixed(1)}%. Well below the 30% threshold.`;
    } else if (combinedUtil <= 30) {
      score = 90;
      status = 'good';
      explanation = `Good! Current utilization at ${currentUtil.toFixed(1)}%. Stay below 30% for optimal score.`;
    } else if (combinedUtil <= 50) {
      score = 70;
      status = 'warning';
      explanation = `Current utilization at ${currentUtil.toFixed(1)}% is moderate. Reduce below 30% to improve score.`;
    } else if (combinedUtil <= 75) {
      score = 40;
      status = 'bad';
      explanation = `High utilization at ${currentUtil.toFixed(1)}%! Pay down balance to improve score significantly.`;
    } else {
      score = 10;
      status = 'bad';
      explanation = `Critical: ${currentUtil.toFixed(1)}% utilization is extremely high! This is severely impacting your score.`;
    }

    return {
      name: 'Credit Utilization',
      score,
      value: currentUtil, // Actual current utilization percentage
      weight: 0.30,
      status,
      explanation,
      details: `Current: ${currentUtil.toFixed(1)}%, Avg (3 months): ${avg3Util.toFixed(1)}%`
    };
  }

  private computeDebtToIncome(): FactorScore {
    if (!this.profile.checkingAccount || this.profile.checkingAccount.deposits.length === 0) {
      return {
        name: 'Debt-to-Income Proxy',
        score: 60,
        weight: 0.20,
        status: 'warning',
        explanation: 'Income data unavailable. Using baseline score.',
        details: 'No checking account or deposit history'
      };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDeposits = this.profile.checkingAccount.deposits.filter(
      (d) => d.type === 'paycheck' && new Date(d.date) >= thirtyDaysAgo
    );

    const monthlyIncome = recentDeposits.reduce((sum, d) => sum + d.amount, 0);

    if (monthlyIncome === 0) {
      return {
        name: 'Debt-to-Income Proxy',
        score: 60,
        weight: 0.20,
        status: 'warning',
        explanation: 'No recent income detected. Using baseline score.',
        details: 'No paycheck deposits in last 30 days'
      };
    }

    const lastCycle = this.profile.billingCycles[this.profile.billingCycles.length - 1];
    const monthlyDebt = lastCycle ? lastCycle.minimumDue : 0;

    const dtiRatio = monthlyDebt / monthlyIncome;

    let score: number;
    let status: 'good' | 'warning' | 'bad';
    let explanation: string;

    if (dtiRatio <= 0.10) {
      score = 100;
      status = 'good';
      explanation = `Excellent debt-to-income ratio at ${(dtiRatio * 100).toFixed(1)}%. Very manageable debt.`;
    } else if (dtiRatio <= 0.20) {
      score = 85;
      status = 'good';
      explanation = `Good debt-to-income ratio at ${(dtiRatio * 100).toFixed(1)}%. Debt is well-managed.`;
    } else if (dtiRatio <= 0.35) {
      score = 65;
      status = 'warning';
      explanation = `Moderate debt-to-income ratio at ${(dtiRatio * 100).toFixed(1)}%. Consider reducing debt.`;
    } else if (dtiRatio <= 0.50) {
      score = 40;
      status = 'bad';
      explanation = `High debt-to-income ratio at ${(dtiRatio * 100).toFixed(1)}%. Debt is becoming burdensome.`;
    } else {
      score = 15;
      status = 'bad';
      explanation = `Very high debt-to-income ratio at ${(dtiRatio * 100).toFixed(1)}%. Urgent debt reduction needed.`;
    }

    return {
      name: 'Debt-to-Income Proxy',
      score,
      weight: 0.20,
      status,
      explanation,
      details: `Monthly Income: $${monthlyIncome.toFixed(0)}, Monthly Debt: $${monthlyDebt.toFixed(0)}`
    };
  }

  private computeHistoryLength(): FactorScore {
    const openDate = new Date(this.profile.creditCardAccount.openDate);
    const now = new Date();
    const ageInMonths = Math.floor((now.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

    let score: number;
    let status: 'good' | 'warning' | 'bad';
    let explanation: string;

    if (ageInMonths < 3) {
      score = 30;
      status = 'bad';
      explanation = `Very new account (${ageInMonths} months). Score will improve with time.`;
    } else if (ageInMonths < 6) {
      score = 45;
      status = 'warning';
      explanation = `New account (${ageInMonths} months). Keep building positive history.`;
    } else if (ageInMonths < 12) {
      score = 60;
      status = 'warning';
      explanation = `Account is ${ageInMonths} months old. Approaching 1 year milestone.`;
    } else if (ageInMonths < 24) {
      score = 75;
      status = 'good';
      explanation = `Account is ${Math.floor(ageInMonths / 12)} year${Math.floor(ageInMonths / 12) > 1 ? 's' : ''} old. Good history length.`;
    } else if (ageInMonths < 60) {
      score = 90;
      status = 'good';
      explanation = `Account is ${Math.floor(ageInMonths / 12)} years old. Strong credit history.`;
    } else {
      score = 100;
      status = 'good';
      explanation = `Account is ${Math.floor(ageInMonths / 12)} years old. Excellent established history.`;
    }

    return {
      name: 'Account Age',
      score,
      weight: 0.10,
      status,
      explanation,
      details: `Account opened ${Math.floor(ageInMonths / 12)} years, ${ageInMonths % 12} months ago`
    };
  }

  private identifyTopDrivers(factors: ToyScoreResult['factors']): ToyScoreResult['topDrivers'] {
    const factorArray = Object.values(factors);

    const positive = factorArray
      .filter((f) => f.status === 'good' && f.score >= 80)
      .sort((a, b) => b.score * b.weight - a.score * a.weight)
      .slice(0, 2)
      .map((f) => f.name);

    const negative = factorArray
      .filter((f) => f.status !== 'good')
      .sort((a, b) => a.score * a.weight - b.score * b.weight)
      .slice(0, 2)
      .map((f) => f.name);

    return { positive, negative };
  }
}
