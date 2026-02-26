import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { getCustomers, getAccounts, getCreditData, getTransactions, createProfile, checkHealth } from '../api';
import RedPanda from '../components/RedPanda';
import type { PandaState } from '../../../shared/types';

const Onboarding: React.FC = () => {
  const { setCustomer, setAccount, setCreditData, setTransactions, setProfile, setCurrentScreen, setIsMockData } = useApp();
  const [step, setStep] = useState(1);
  const [pandaName, setPandaName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const defaultPandaState: PandaState = {
    mood: 'happy',
    energy: 75,
    environment: 'bright'
  };

  const handleStart = async () => {
    setLoading(true);
    setError('');

    try {
      const health = await checkHealth();
      setIsMockData(health.mockDataMode);

      const customers = await getCustomers();
      if (!customers || customers.length === 0) {
        throw new Error('No customers found');
      }

      const customer = customers[0];
      setCustomer(customer);

      const accounts = await getAccounts(customer.id);
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts.find(a => a.type === 'Credit Card') || accounts[0];
      setAccount(account);

      const [creditData, transactions] = await Promise.all([
        getCreditData(account.id),
        getTransactions(account.id)
      ]);

      setCreditData(creditData);
      setTransactions(transactions);

      setStep(2);
    } catch (err) {
      console.error('Onboarding error:', err);
      setError('Failed to connect. Please check your configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = async () => {
    if (!pandaName.trim()) {
      setError('Please enter a name for your panda');
      return;
    }

    setLoading(true);
    try {
      const customers = await getCustomers();
      const customer = customers[0];
      const accounts = await getAccounts(customer.id);
      const account = accounts[0];

      const profile = {
        pandaName: pandaName.trim(),
        customerId: customer.id,
        accountId: account.id,
        financialXP: 0,
        streak: 0,
        completedMissions: []
      };

      await createProfile(profile);
      setProfile(profile);
      setStep(3);
    } catch (err) {
      console.error('Profile creation error:', err);
      setError('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    setCurrentScreen('home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="card max-w-2xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {step === 1 && (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to CreditKeeper</h1>
            <p className="text-lg text-gray-600 mb-8">
              Meet your new credit companion - a red panda that reflects your credit health!
            </p>

            <div className="flex justify-center mb-8">
              <RedPanda state={defaultPandaState} />
            </div>

            <div className="space-y-4 text-left mb-8 bg-blue-50 p-6 rounded-lg">
              <h2 className="font-bold text-lg text-gray-800">Two Modes:</h2>
              <div>
                <p className="font-semibold text-gray-800">Real Mode</p>
                <p className="text-gray-600">Your panda mirrors your actual credit health from Capital One</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Projected Mode</p>
                <p className="text-gray-600">See what-if scenarios and how decisions affect your credit score</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                {error}
              </div>
            )}

            <button
              className="btn-primary w-full text-lg"
              onClick={handleStart}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Get Started'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Name Your Panda</h1>
            <p className="text-gray-600 mb-8">
              Give your credit companion a name to make your journey personal!
            </p>

            <div className="flex justify-center mb-8">
              <RedPanda state={defaultPandaState} />
            </div>

            <input
              type="text"
              className="input-field mb-6"
              placeholder="Enter panda name..."
              value={pandaName}
              onChange={(e) => setPandaName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
              autoFocus
            />

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                {error}
              </div>
            )}

            <button
              className="btn-primary w-full text-lg"
              onClick={handleNameSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">All Set!</h1>
            <p className="text-gray-600 mb-8">
              {pandaName} is ready to help you understand and improve your credit health.
            </p>

            <div className="flex justify-center mb-8">
              <RedPanda state={defaultPandaState} />
            </div>

            <div className="space-y-3 text-left mb-8 bg-green-50 p-6 rounded-lg">
              <p className="font-semibold text-gray-800">Remember:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>In Real Mode, {pandaName} shows your actual credit health</li>
                <li>In Projected Mode, see side-by-side comparisons of what-if scenarios</li>
                <li>Complete missions to earn Financial XP (doesn't affect {pandaName}'s health)</li>
                <li>{pandaName} reacts strongly to missed payments and large purchases</li>
              </ul>
            </div>

            <button
              className="btn-primary w-full text-lg"
              onClick={handleFinish}
            >
              Meet {pandaName}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Onboarding;
