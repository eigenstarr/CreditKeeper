import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import RedPanda from '../components/RedPanda';
import Environment from '../components/Environment';
import ToyScoreDisclaimer from '../components/ToyScoreDisclaimer';
import { calculatePandaState, getMoodDescription } from '../utils/pandaLogic';

const PetView: React.FC = () => {
  const { profile, creditData, setCurrentScreen, isMockData, isToyScore } = useApp();

  const pandaState = calculatePandaState(creditData);
  const moodDescription = getMoodDescription(pandaState.mood);

  const getTopFactors = () => {
    if (!creditData) return [];

    const factors = Object.values(creditData.factors);
    return factors
      .filter(f => f.status !== 'good')
      .sort((a, b) => {
        const statusOrder = { bad: 0, warning: 1, good: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      })
      .slice(0, 2);
  };

  const topFactors = getTopFactors();

  return (
    <div className="space-y-6">
      {isToyScore && <ToyScoreDisclaimer compact />}

      {isMockData && !isToyScore && (
        <div className="card bg-yellow-50 border-2 border-yellow-400">
          <p className="text-yellow-800 font-semibold">
            Demo Data Mode - Add NESSIE_API_KEY to backend .env for real data
          </p>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{profile?.pandaName || 'Your Panda'}</h1>
            <p className="text-gray-600">{moodDescription}</p>
          </div>
          <motion.button
            className="btn-secondary"
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentScreen('score')}
          >
            View Score Details
          </motion.button>
        </div>

        <Environment state={pandaState}>
          <RedPanda state={pandaState} />
        </Environment>

        <div className="mt-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-lg font-semibold text-gray-800">Energy Level:</div>
            <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
              <motion.div
                className={`h-full ${
                  pandaState.energy > 60
                    ? 'bg-green-500'
                    : pandaState.energy > 40
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${pandaState.energy}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <div className="text-lg font-bold text-gray-800">{pandaState.energy}%</div>
          </div>
        </div>
      </div>

      {topFactors.length > 0 && (
        <motion.div
          className="card bg-red-50 border-2 border-red-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-red-800 mb-4">
            Why {profile?.pandaName} needs attention:
          </h2>
          <div className="space-y-3">
            {topFactors.map((factor, index) => (
              <div key={index} className="flex items-start gap-3">
                <div
                  className={`w-3 h-3 rounded-full mt-1 ${
                    factor.status === 'bad' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                />
                <div>
                  <p className="font-semibold text-gray-800">{factor.name}</p>
                  <p className="text-gray-700">{factor.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {topFactors.length === 0 && creditData && (
        <motion.div
          className="card bg-green-50 border-2 border-green-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-bold text-green-800 mb-2">
            {profile?.pandaName} is healthy!
          </h2>
          <p className="text-gray-700">
            All credit factors are in good shape. Keep up the great work with on-time payments and low utilization.
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.button
          className="btn-primary"
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentScreen('projected')}
        >
          Run Scenarios
        </motion.button>
        <motion.button
          className="btn-secondary"
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentScreen('transactions')}
        >
          View Transactions
        </motion.button>
        <motion.button
          className="btn-secondary"
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentScreen('learn')}
        >
          Learn & Earn XP
        </motion.button>
      </div>
    </div>
  );
};

export default PetView;
