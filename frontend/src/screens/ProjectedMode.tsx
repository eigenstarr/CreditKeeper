import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { simulateScenario, simulateToyScore } from '../api';
import RedPanda from '../components/RedPanda';
import Environment from '../components/Environment';
import RecoveryTimeline from '../components/RecoveryTimeline';
import ToyScoreDisclaimer from '../components/ToyScoreDisclaimer';
import { calculatePandaState } from '../utils/pandaLogic';
import type { ProjectedScenario, CreditData } from '../../../shared/types';

const ProjectedMode: React.FC = () => {
  const { account, creditData, profile, setCurrentScreen, projectedResult, setProjectedResult, isToyScore, syntheticProfileId } = useApp();
  const [scenarioType, setScenarioType] = useState<string>('purchase');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentPandaState = calculatePandaState(creditData);

  const getProjectedCreditData = (): CreditData | null => {
    if (!creditData || !projectedResult) return null;

    const newUtilization =
      ((account?.balance || 0) + (projectedResult.projectedScore - projectedResult.currentScore)) /
      (account?.creditLimit || 1) * 100;

    return {
      ...creditData,
      score: projectedResult.projectedScore,
      healthLevel:
        projectedResult.projectedScore >= 700
          ? 'high'
          : projectedResult.projectedScore >= 640
          ? 'medium'
          : 'low',
      factors: {
        ...creditData.factors,
        utilization: {
          ...creditData.factors.utilization,
          value: Math.max(0, Math.min(100, newUtilization))
        }
      }
    };
  };

  const projectedPandaState = calculatePandaState(getProjectedCreditData());

  const handleSimulate = async () => {
    // Check for toy score mode
    if (isToyScore && !syntheticProfileId) {
      setError('Toy score profile not found');
      return;
    }

    // Check for regular mode
    if (!isToyScore && !account) {
      setError('No account found');
      return;
    }

    const amountNum = parseFloat(amount);
    if (scenarioType !== 'missed_payment' && (!amount || isNaN(amountNum) || amountNum <= 0)) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const scenario: ProjectedScenario = {
        type: scenarioType as any,
        amount: scenarioType === 'purchase' || scenarioType === 'replay_transaction' ? amountNum : undefined,
        paymentAmount: scenarioType === 'pay_down' ? amountNum : undefined
      };

      let result;
      if (isToyScore && syntheticProfileId) {
        // Use toy score simulation
        result = await simulateToyScore(syntheticProfileId, scenario);
      } else if (account) {
        // Use regular simulation
        result = await simulateScenario(account.id, scenario);
      } else {
        throw new Error('No valid account or profile');
      }

      setProjectedResult(result);
    } catch (err) {
      console.error('Simulation error:', err);
      setError('Failed to run simulation');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProjectedResult(null);
    setAmount('');
    setError('');
  };

  return (
    <div className="space-y-6">
      {isToyScore && <ToyScoreDisclaimer compact />}

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Projected Mode</h1>
            <p className="text-gray-600">Run what-if scenarios to see impact on your credit</p>
          </div>
          <motion.button
            className="btn-secondary"
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentScreen('pet')}
          >
            Back to Real Mode
          </motion.button>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-semibold">
            ⚠️ This is a simulation - projections are estimates and not guaranteed results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Scenario Type
            </label>
            <select
              className="input-field"
              value={scenarioType}
              onChange={(e) => {
                setScenarioType(e.target.value);
                setError('');
              }}
            >
              <option value="purchase">Hypothetical Purchase</option>
              <option value="pay_down">Pay Down Balance</option>
              <option value="missed_payment">Missed Payment</option>
            </select>
          </div>

          {scenarioType !== 'missed_payment' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {scenarioType === 'pay_down' ? 'Payment Amount' : 'Purchase Amount'} ($)
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <motion.button
            className="btn-primary flex-1"
            whileTap={{ scale: 0.95 }}
            onClick={handleSimulate}
            disabled={loading}
          >
            {loading ? 'Simulating...' : 'Run Simulation'}
          </motion.button>
          {projectedResult && (
            <motion.button
              className="btn-secondary"
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
            >
              Reset
            </motion.button>
          )}
        </div>
      </div>

      {projectedResult && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              className="card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Current: {profile?.pandaName}
              </h2>
              <Environment state={currentPandaState}>
                <RedPanda state={currentPandaState} />
              </Environment>
              <div className="mt-4 text-center">
                <div className="text-3xl font-bold text-gray-800">
                  {projectedResult.currentScore}
                </div>
                <div className="text-gray-600">Current Score</div>
              </div>
            </motion.div>

            <motion.div
              className="card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Projected: {profile?.pandaName}
              </h2>
              <Environment state={projectedPandaState}>
                <RedPanda state={projectedPandaState} />
              </Environment>
              <div className="mt-4 text-center">
                <div
                  className={`text-3xl font-bold ${
                    projectedResult.scoreDelta >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {projectedResult.projectedScore}
                </div>
                <div className="text-gray-600">
                  Projected Score (
                  <span
                    className={
                      projectedResult.scoreDelta >= 0 ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {projectedResult.scoreDelta >= 0 ? '+' : ''}
                    {projectedResult.scoreDelta}
                  </span>
                  )
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Impact Analysis</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-1">Factor Affected</div>
                <div className="text-lg text-gray-800">{projectedResult.factorAffected}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-600 mb-1">Explanation</div>
                <div className="text-gray-700">{projectedResult.explanation}</div>
              </div>
            </div>
          </motion.div>

          {projectedResult.recoveryTimeline && (
            <RecoveryTimeline result={projectedResult} />
          )}
        </>
      )}
    </div>
  );
};

export default ProjectedMode;
