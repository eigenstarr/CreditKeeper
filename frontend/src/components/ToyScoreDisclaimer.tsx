import React from 'react';
import { motion } from 'framer-motion';

interface ToyScoreDisclaimerProps {
  compact?: boolean;
}

const ToyScoreDisclaimer: React.FC<ToyScoreDisclaimerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 px-4 py-2 rounded">
        <p className="text-sm text-yellow-800 font-semibold">
          ⚠️ Educational Score (Toy Model) - Not a real credit score
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">⚠️</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-yellow-900 mb-2">
            Educational Score (Toy Model)
          </h3>
          <p className="text-yellow-800 mb-3">
            This is a simplified educational credit score model designed for learning purposes only.
            It is <strong>not</strong> a real FICO or VantageScore.
          </p>
          <div className="bg-yellow-100 rounded p-3 text-sm text-yellow-900">
            <p className="mb-2">
              <strong>How it works:</strong> This toy model calculates a score (300-850) based on four factors with different weights:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Payment History (40%)</strong> - on-time vs missed payments</li>
              <li><strong>Credit Utilization (30%)</strong> - balance-to-limit ratio</li>
              <li><strong>Debt-to-Income Proxy (20%)</strong> - monthly debt vs income estimate</li>
              <li><strong>Account Age (10%)</strong> - length of credit history</li>
            </ul>
            <p className="mt-3 text-xs text-yellow-700">
              Real credit scores use more complex algorithms and additional data sources.
              Use this tool to understand credit concepts, not to predict your actual score.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ToyScoreDisclaimer;
