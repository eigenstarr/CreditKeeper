import type { LoanScenario, LoanReasonablenessRating, LoanReasonableness } from '../../shared/types.js';

/**
 * Loan Reasonableness Calculator
 *
 * Educational heuristic model for determining loan reasonableness
 * NOT real underwriting - for educational purposes only
 */

export class LoanCalculator {
  /**
   * Calculate monthly payment using standard amortization formula
   */
  static calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
    if (annualRate === 0) {
      return principal / termMonths;
    }

    const monthlyRate = annualRate / 100 / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
                    (Math.pow(1 + monthlyRate, termMonths) - 1);

    return Math.round(payment * 100) / 100;
  }

  /**
   * Calculate loan reasonableness rating based on heuristic rules
   */
  static calculateReasonableness(
    loan: LoanScenario,
    currentMonthlyDebt: number,
    monthlyIncome: number
  ): LoanReasonablenessRating {
    const monthlyPayment = this.calculateMonthlyPayment(loan.loanAmount, loan.apr, loan.termMonths);
    const newMonthlyDebt = currentMonthlyDebt + monthlyPayment;
    const newDTI = newMonthlyDebt / monthlyIncome;
    const annualIncome = monthlyIncome * 12;
    const loanToIncomeRatio = loan.loanAmount / annualIncome;

    // Assess individual factors
    const dtiImpact = this.assessDTI(newDTI);
    const aprAssessment = this.assessAPR(loan.apr);
    const ltiImpact = this.assessLoanToIncome(loanToIncomeRatio);

    // Determine overall rating
    const rating = this.determineOverallRating(dtiImpact, aprAssessment, ltiImpact);

    // Generate reasons and suggestions
    const reasons = this.generateReasons(rating, newDTI, loan.apr, loanToIncomeRatio, dtiImpact, aprAssessment);
    const suggestions = this.generateSuggestions(rating, loan, newDTI, monthlyPayment, monthlyIncome);

    return {
      rating,
      monthlyPayment,
      newDTI: Math.round(newDTI * 1000) / 10, // Convert to percentage with 1 decimal
      reasons,
      suggestions,
      dtiImpact,
      aprAssessment,
      loanToIncomeRatio: Math.round(loanToIncomeRatio * 1000) / 10
    };
  }

  /**
   * Assess DTI impact
   */
  private static assessDTI(dti: number): 'healthy' | 'moderate' | 'high' {
    if (dti <= 0.30) return 'healthy';
    if (dti <= 0.45) return 'moderate';
    return 'high';
  }

  /**
   * Assess APR level
   */
  private static assessAPR(apr: number): 'healthy' | 'expensive' | 'high-risk' {
    if (apr <= 12) return 'healthy';
    if (apr <= 25) return 'expensive';
    return 'high-risk';
  }

  /**
   * Assess loan-to-income ratio
   */
  private static assessLoanToIncome(lti: number): 'normal' | 'aggressive' | 'high-risk' {
    if (lti <= 0.50) return 'normal';
    if (lti <= 1.00) return 'aggressive';
    return 'high-risk';
  }

  /**
   * Determine overall reasonableness rating
   */
  private static determineOverallRating(
    dtiImpact: 'healthy' | 'moderate' | 'high',
    aprAssessment: 'healthy' | 'expensive' | 'high-risk',
    ltiImpact: 'normal' | 'aggressive' | 'high-risk'
  ): LoanReasonableness {
    // Unreasonable if any critical factors
    if (dtiImpact === 'high' || aprAssessment === 'high-risk' || ltiImpact === 'high-risk') {
      return 'unreasonable';
    }

    // Stretch if multiple moderate factors or one severe factor
    if (
      (dtiImpact === 'moderate' && aprAssessment === 'expensive') ||
      (dtiImpact === 'moderate' && ltiImpact === 'aggressive') ||
      (aprAssessment === 'expensive' && ltiImpact === 'aggressive')
    ) {
      return 'stretch';
    }

    // Stretch if any single moderate/aggressive factor
    if (dtiImpact === 'moderate' || aprAssessment === 'expensive' || ltiImpact === 'aggressive') {
      return 'stretch';
    }

    // Otherwise reasonable
    return 'reasonable';
  }

  /**
   * Generate human-readable reasons for the rating
   */
  private static generateReasons(
    rating: LoanReasonableness,
    newDTI: number,
    apr: number,
    lti: number,
    dtiImpact: string,
    aprAssessment: string
  ): string[] {
    const reasons: string[] = [];

    // DTI reasons
    if (dtiImpact === 'healthy') {
      reasons.push(`Debt-to-income ratio of ${(newDTI * 100).toFixed(1)}% is within healthy range (≤30%)`);
    } else if (dtiImpact === 'moderate') {
      reasons.push(`Debt-to-income ratio of ${(newDTI * 100).toFixed(1)}% is elevated but manageable (30-45%)`);
    } else {
      reasons.push(`Debt-to-income ratio of ${(newDTI * 100).toFixed(1)}% is very high (>45%)`);
    }

    // APR reasons
    if (aprAssessment === 'healthy') {
      reasons.push(`APR of ${apr.toFixed(1)}% is competitive and affordable`);
    } else if (aprAssessment === 'expensive') {
      reasons.push(`APR of ${apr.toFixed(1)}% is expensive (12-25%)`);
    } else {
      reasons.push(`APR of ${apr.toFixed(1)}% is extremely high (>25%)`);
    }

    // Loan-to-income reasons
    if (lti <= 0.50) {
      reasons.push(`Loan amount is ${(lti * 100).toFixed(0)}% of annual income - reasonable size`);
    } else if (lti <= 1.00) {
      reasons.push(`Loan amount is ${(lti * 100).toFixed(0)}% of annual income - aggressive borrowing`);
    } else {
      reasons.push(`Loan amount exceeds annual income (${(lti * 100).toFixed(0)}%) - very high risk`);
    }

    return reasons;
  }

  /**
   * Generate actionable suggestions
   */
  private static generateSuggestions(
    rating: LoanReasonableness,
    loan: LoanScenario,
    newDTI: number,
    monthlyPayment: number,
    monthlyIncome: number
  ): string[] {
    const suggestions: string[] = [];

    if (rating === 'reasonable') {
      suggestions.push('This loan fits well within your budget');
      suggestions.push('Continue making on-time payments to maintain good credit');
      return suggestions;
    }

    // DTI-based suggestions
    if (newDTI > 0.30) {
      const targetPayment = monthlyIncome * 0.30 - (monthlyIncome * newDTI - monthlyPayment);
      if (targetPayment > 0) {
        suggestions.push(`Reduce monthly payment to ~$${targetPayment.toFixed(0)} to keep DTI below 30%`);
      }

      const betterAmount = this.calculateBetterLoanAmount(loan.apr, loan.termMonths, monthlyIncome * 0.30 - (monthlyIncome * newDTI - monthlyPayment));
      if (betterAmount > 0 && betterAmount < loan.loanAmount) {
        suggestions.push(`Consider borrowing ~$${betterAmount.toFixed(0)} instead to maintain healthy DTI`);
      }
    }

    // Term-based suggestions
    if (loan.termMonths < 60 && newDTI > 0.30) {
      const longerTermPayment = this.calculateMonthlyPayment(loan.loanAmount, loan.apr, loan.termMonths + 12);
      suggestions.push(`Extend term to ${loan.termMonths + 12} months (payment: $${longerTermPayment.toFixed(2)}/mo)`);
    }

    // APR-based suggestions
    if (loan.apr > 12) {
      suggestions.push('Shop for better interest rates before committing');
      suggestions.push('Consider improving credit score before borrowing');
    }

    // Amount-based suggestions
    if (loan.loanAmount > monthlyIncome * 6) {
      suggestions.push('Consider making a larger down payment');
      suggestions.push('Evaluate if the full amount is necessary');
    }

    if (rating === 'unreasonable') {
      suggestions.push('⚠️ This loan may cause financial hardship - reconsider or delay');
    }

    return suggestions;
  }

  /**
   * Calculate a better loan amount for a target monthly payment
   */
  private static calculateBetterLoanAmount(apr: number, termMonths: number, targetPayment: number): number {
    if (apr === 0) {
      return targetPayment * termMonths;
    }

    const monthlyRate = apr / 100 / 12;
    const principal = targetPayment * (Math.pow(1 + monthlyRate, termMonths) - 1) /
                     (monthlyRate * Math.pow(1 + monthlyRate, termMonths));

    return Math.round(principal);
  }
}
