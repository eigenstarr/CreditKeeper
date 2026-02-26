import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { generateSyntheticProfile, getToyScoreCreditData } from '../api';

interface TestDataSelectorProps {
  onClose: () => void;
}

const TestDataSelector: React.FC<TestDataSelectorProps> = ({ onClose }) => {
  const { setIsToyScore, setSyntheticProfileId, setAccount, setCreditData, setTransactions, setProfile } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const profiles = [
    {
      type: 'excellent' as const,
      name: 'Smart Bernard',
      icon: '🤓',
      score: '800-850',
      description: 'Exceptional credit history with 5 years of perfect payments and minimal utilization (2%)',
      highlights: [
        'All 12+ payments paid in full, 10 days early',
        '$300 balance on $15,000 limit',
        'Monthly income: $12,000',
        '60 months (5 years) account age'
      ],
      color: 'from-blue-400 to-blue-600'
    },
    {
      type: 'healthy' as const,
      name: 'Healthy Alex',
      icon: '😊',
      score: '720-750',
      description: 'Good payment history with 1 late payment, moderate utilization (27%), 18 months credit history',
      highlights: [
        '11 on-time payments, 1 late payment',
        '$1,350 balance on $5,000 limit',
        'Monthly income: $4,000',
        '18 months account age'
      ],
      color: 'from-green-400 to-green-600'
    },
    {
      type: 'risky' as const,
      name: 'Risky Jordan',
      icon: '😰',
      score: '560-620',
      description: 'High utilization (65%), 1 missed payment, 1 late payment, newer account',
      highlights: [
        '1 missed payment, 1 late payment',
        '$1,950 balance on $3,000 limit',
        'Monthly income: $2,400',
        '8 months account age'
      ],
      color: 'from-red-400 to-red-600'
    },
    {
      type: 'poor' as const,
      name: 'Dangerous David',
      icon: '😱',
      score: '300-500',
      description: 'Critical credit situation: maxed out card (99%), 2 missed payments, 1 late payment',
      highlights: [
        '2 missed payments, 1 very late payment',
        '$1,485 balance on $1,500 limit',
        'Monthly income: $600',
        'Only 5 months account age'
      ],
      color: 'from-purple-600 to-purple-800'
    }
  ];

  const handleSelectProfile = async (type: 'excellent' | 'healthy' | 'risky' | 'poor') => {
    setLoading(true);
    setError('');

    try {
      // Generate synthetic profile
      const syntheticProfile = await generateSyntheticProfile(type);

      // Get credit data
      const creditData = await getToyScoreCreditData(syntheticProfile.id);

      // Set up toy score mode
      setIsToyScore(true);
      setSyntheticProfileId(syntheticProfile.id);

      // Set account data from synthetic profile
      setAccount(syntheticProfile.creditCardAccount);
      setCreditData(creditData);
      setTransactions(syntheticProfile.transactions);

      // Create or update profile
      setProfile({
        pandaName: syntheticProfile.name,
        customerId: syntheticProfile.id,
        accountId: syntheticProfile.creditCardAccount.id,
        financialXP: 0,
        streak: 0,
        completedMissions: []
      });

      onClose();
    } catch (err) {
      console.error('Error loading test profile:', err);
      setError('Failed to load test profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Choose Test Profile</h2>
              <p className="text-gray-600 mt-1">
                Select a preset profile to explore different credit scenarios
              </p>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600 text-2xl"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-semibold text-sm">
              ⚠️ Educational Score (Toy Model) - These profiles use synthetic data for learning purposes only
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profiles.map((profile) => (
              <motion.div
                key={profile.type}
                className="card cursor-pointer hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !loading && handleSelectProfile(profile.type)}
              >
                <div className={`h-2 rounded-t-xl bg-gradient-to-r ${profile.color}`} />

                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">{profile.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800">{profile.name}</h3>
                      <p className={`text-sm font-semibold ${
                        profile.type === 'excellent' ? 'text-blue-600' :
                        profile.type === 'healthy' ? 'text-green-600' :
                        profile.type === 'risky' ? 'text-red-600' :
                        'text-purple-700'
                      }`}>Expected Score: {profile.score}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 text-sm">{profile.description}</p>

                  <div className="space-y-2 mb-6">
                    {profile.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2" />
                        <p className="text-sm text-gray-600">{highlight}</p>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? 'Loading...' : `Try ${profile.name}`}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">What you can do:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>✓ See how the panda reflects different credit health levels</li>
              <li>✓ Run scenarios (purchases, payments, missed payments)</li>
              <li>✓ Compare side-by-side projected vs current scores</li>
              <li>✓ View detailed factor breakdowns with explanations</li>
              <li>✓ Learn credit concepts without affecting real credit</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TestDataSelector;
