import React from 'react';
import { motion } from 'framer-motion';
import type { ProjectedResult } from '../../../shared/types';

interface RecoveryTimelineProps {
  result: ProjectedResult;
}

const RecoveryTimeline: React.FC<RecoveryTimelineProps> = ({ result }) => {
  if (!result.recoveryTimeline) return null;

  const { days30, days90, days180 } = result.recoveryTimeline;
  const currentScore = result.projectedScore;

  const milestones = [
    { label: 'Now', score: currentScore, days: 0 },
    { label: '30 Days', score: days30, days: 30 },
    { label: '90 Days', score: days90, days: 90 },
    { label: '180 Days', score: days180, days: 180 }
  ];

  return (
    <div className="card mt-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Recovery Timeline</h3>
      <p className="text-sm text-gray-600 mb-6">
        Expected score recovery with responsible credit behavior
      </p>

      <div className="relative">
        <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded" />

        <div className="relative flex justify-between">
          {milestones.map((milestone, index) => {
            const scoreChange = index === 0 ? 0 : milestone.score - currentScore;
            const isPositive = scoreChange > 0;

            return (
              <motion.div
                key={milestone.label}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <motion.div
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white mb-2 ${
                    index === 0 ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {milestone.score}
                </motion.div>

                <div className="text-center">
                  <div className="font-semibold text-gray-800">{milestone.label}</div>
                  {index > 0 && (
                    <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : ''}{scoreChange}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {result.correctiveAction && (
        <motion.div
          className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h4 className="font-semibold text-green-800 mb-2">Corrective Action</h4>
          <p className="text-gray-700">{result.correctiveAction}</p>
        </motion.div>
      )}
    </div>
  );
};

export default RecoveryTimeline;
