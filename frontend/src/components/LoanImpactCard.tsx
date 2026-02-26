import React from 'react';
import { motion } from 'framer-motion';
import type { LoanReasonablenessRating, LoanScenario } from '../../../shared/types';
import LoanRatingBadge from './LoanRatingBadge';

interface LoanImpactCardProps {
  loanRating: LoanReasonablenessRating;
  loan: LoanScenario;
}

const LoanImpactCard: React.FC<LoanImpactCardProps> = ({ loanRating, loan }) => {
  const getLoanTypeLabel = (loanType: string): string => {
    const labels: Record<string, string> = {
      auto: 'Auto Loan',
      student: 'Student Loan',
      personal: 'Personal Loan',
      line_of_credit: 'Line of Credit'
    };
    return labels[loanType] || loanType;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getDTIColor = (impact: string) => {
    switch (impact) {
      case 'healthy':
        return 'text-green-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAPRColor = (assessment: string) => {
    switch (assessment) {
      case 'healthy':
        return 'text-green-600';
      case 'expensive':
        return 'text-yellow-600';
      case 'high-risk':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Loan Rating Badge */}
      <LoanRatingBadge rating={loanRating.rating} reasons={loanRating.reasons} />

      {/* Loan Summary */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Loan Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Loan Type</div>
            <div className="font-semibold text-gray-800">{getLoanTypeLabel(loan.loanType)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Loan Amount</div>
            <div className="font-semibold text-gray-800">{formatCurrency(loan.loanAmount)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">APR</div>
            <div className={`font-semibold ${getAPRColor(loanRating.aprAssessment)}`}>
              {loan.apr.toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Term</div>
            <div className="font-semibold text-gray-800">{loan.termMonths} months</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Monthly Payment</div>
            <div className="font-semibold text-lg text-blue-600">
              {formatCurrency(loanRating.monthlyPayment)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">New DTI</div>
            <div className={`font-semibold text-lg ${getDTIColor(loanRating.dtiImpact)}`}>
              {loanRating.newDTI.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Impact Metrics</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm font-medium text-gray-700">DTI Impact</span>
            <span className={`font-bold ${getDTIColor(loanRating.dtiImpact)}`}>
              {loanRating.dtiImpact.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm font-medium text-gray-700">APR Assessment</span>
            <span className={`font-bold ${getAPRColor(loanRating.aprAssessment)}`}>
              {loanRating.aprAssessment.toUpperCase().replace('-', ' ')}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm font-medium text-gray-700">Loan-to-Income Ratio</span>
            <span className="font-bold text-gray-700">
              {loanRating.loanToIncomeRatio.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {loanRating.suggestions.length > 0 && (
        <motion.div
          className="card bg-blue-50 border-2 border-blue-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-blue-800 mb-3">💡 Suggestions</h3>
          <ul className="space-y-2">
            {loanRating.suggestions.map((suggestion, index) => (
              <motion.li
                key={index}
                className="text-sm text-blue-900 flex items-start gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <span className="mt-1">•</span>
                <span>{suggestion}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Educational Disclaimer */}
      <div className="p-3 bg-gray-100 border border-gray-300 rounded text-center">
        <p className="text-xs text-gray-600 italic">
          ⚠️ This is an educational estimate. Not lending advice. Does not represent actual Capital One underwriting decisions.
        </p>
      </div>
    </motion.div>
  );
};

export default LoanImpactCard;
