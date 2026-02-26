import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';

const ScoreView: React.FC = () => {
  const { creditData, profile, setCurrentScreen } = useApp();

  if (!creditData) {
    return (
      <div className="card">
        <p className="text-gray-600">Loading credit data...</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 700) return 'text-green-600';
    if (score >= 640) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'bad':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Credit Score</h1>
          <motion.button
            className="btn-secondary"
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentScreen('pet')}
          >
            Back to {profile?.pandaName}
          </motion.button>
        </div>

        <div className="text-center mb-8">
          <motion.div
            className={`text-7xl font-bold ${getScoreColor(creditData.score)}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {creditData.score}
          </motion.div>
          <p className="text-gray-600 mt-2 text-lg capitalize">
            {creditData.healthLevel} Credit Health
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Last updated: {new Date(creditData.lastUpdated).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">700+</div>
            <div className="text-sm text-gray-600">Good</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">640-699</div>
            <div className="text-sm text-gray-600">Fair</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">&lt;640</div>
            <div className="text-sm text-gray-600">Needs Work</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Credit Factors</h2>

        <div className="space-y-6">
          {Object.values(creditData.factors).map((factor, index) => (
            <motion.div
              key={factor.name}
              className="border-l-4 pl-4"
              style={{
                borderColor:
                  factor.status === 'good'
                    ? '#22c55e'
                    : factor.status === 'warning'
                    ? '#eab308'
                    : '#ef4444'
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{factor.name}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                    factor.status
                  )}`}
                >
                  {factor.status.toUpperCase()}
                </span>
              </div>

              {factor.name === 'Credit Utilization' && (
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Utilization</span>
                    <span className="font-semibold">{factor.value.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className={`h-full ${
                        factor.value < 30
                          ? 'bg-green-500'
                          : factor.value < 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(factor.value, 100)}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                </div>
              )}

              {factor.name === 'Credit Limit' && (
                <div className="mb-2">
                  <span className="text-lg font-semibold text-gray-700">
                    ${factor.value.toLocaleString()}
                  </span>
                </div>
              )}

              <p className="text-gray-700">{factor.explanation}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="card bg-blue-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Pro Tips</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Keep credit utilization below 30% for optimal scores</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Always make payments on time - payment history is the biggest factor</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Avoid large purchases that push utilization above 30%</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default ScoreView;
