import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import PetView from './PetView';
import ModeToggle from '../components/ModeToggle';
import TestDataSelector from '../components/TestDataSelector';
import { getAccount, getCreditData, getTransactions, checkHealth } from '../api';

const Home: React.FC = () => {
  const { mode, setMode, profile, account, setAccount, setCreditData, setTransactions, setIsMockData } = useApp();
  const [loading, setLoading] = useState(false);
  const [showTestSelector, setShowTestSelector] = useState(false);

  useEffect(() => {
    if (profile && !account) {
      loadAccountData();
    }
  }, [profile, account]);

  const loadAccountData = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const health = await checkHealth();
      setIsMockData(health.mockDataMode);

      const accountData = await getAccount(profile.accountId);
      setAccount(accountData);

      const [creditData, transactions] = await Promise.all([
        getCreditData(profile.accountId),
        getTransactions(profile.accountId)
      ]);

      setCreditData(creditData);
      setTransactions(transactions);
    } catch (err) {
      console.error('Failed to load account data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 mb-2">Loading...</div>
          <div className="text-gray-600">Fetching your credit data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-800">CreditKeeper</h1>
            <p className="text-gray-600">
              Welcome back! {profile?.pandaName} is waiting for you.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTestSelector(true)}
            >
              Choose Test Profile
            </motion.button>
            <ModeToggle mode={mode} onToggle={setMode} />
          </div>
        </motion.div>

        <PetView />

        {showTestSelector && (
          <TestDataSelector onClose={() => setShowTestSelector(false)} />
        )}
      </div>
    </div>
  );
};

export default Home;
