import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LoanReasonableness } from '../../../shared/types';

interface LoanRatingBadgeProps {
  rating: LoanReasonableness;
  reasons: string[];
  showDetails?: boolean;
}

const LoanRatingBadge: React.FC<LoanRatingBadgeProps> = ({ rating, reasons, showDetails = true }) => {
  const [expanded, setExpanded] = useState(false);

  const getRatingConfig = (rating: LoanReasonableness) => {
    switch (rating) {
      case 'reasonable':
        return {
          emoji: '🟢',
          label: 'Reasonable',
          color: 'bg-green-100 border-green-400 text-green-800',
          badgeColor: 'bg-green-500',
          description: 'This loan fits well within healthy financial parameters'
        };
      case 'stretch':
        return {
          emoji: '🟡',
          label: 'Stretch',
          color: 'bg-yellow-100 border-yellow-400 text-yellow-800',
          badgeColor: 'bg-yellow-500',
          description: 'This loan is manageable but aggressive - proceed with caution'
        };
      case 'unreasonable':
        return {
          emoji: '🔴',
          label: 'Unreasonable',
          color: 'bg-red-100 border-red-400 text-red-800',
          badgeColor: 'bg-red-500',
          description: 'This loan may cause financial hardship - reconsider'
        };
    }
  };

  const config = getRatingConfig(rating);

  return (
    <div className={`rounded-lg border-2 p-4 ${config.color}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${config.badgeColor} animate-pulse`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{config.emoji}</span>
              <h4 className="font-bold text-lg">{config.label} Loan</h4>
            </div>
            <p className="text-sm mt-1">{config.description}</p>
          </div>
        </div>

        {showDetails && reasons.length > 0 && (
          <motion.button
            className="text-sm font-semibold underline cursor-pointer"
            onClick={() => setExpanded(!expanded)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {expanded ? 'Hide Details' : 'Why this rating?'}
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {expanded && reasons.length > 0 && (
          <motion.div
            className="mt-4 pt-4 border-t border-current"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h5 className="font-semibold mb-2">Rating Factors:</h5>
            <ul className="space-y-1">
              {reasons.map((reason, index) => (
                <motion.li
                  key={index}
                  className="text-sm flex items-start gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="mt-1">•</span>
                  <span>{reason}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoanRatingBadge;
