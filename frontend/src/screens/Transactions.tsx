import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { simulateScenario } from '../api';
import type { Transaction, ProjectedScenario } from '../../../shared/types';

const Transactions: React.FC = () => {
  const { transactions, account, setCurrentScreen, setProjectedResult } = useApp();
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReplay = async (transaction: Transaction) => {
    if (!account) return;

    setLoading(true);
    try {
      const scenario: ProjectedScenario = {
        type: 'replay_transaction',
        transactionId: transaction.id,
        amount: transaction.amount
      };

      const result = await simulateScenario(account.id, scenario);
      setProjectedResult(result);
      setCurrentScreen('projected');
    } catch (err) {
      console.error('Replay error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Transaction History</h1>
            <p className="text-gray-600">View and replay past transactions</p>
          </div>
          <motion.button
            className="btn-secondary"
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentScreen('pet')}
          >
            Back
          </motion.button>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn, index) => (
              <motion.div
                key={txn.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-forest-green transition-colors cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTxn(selectedTxn?.id === txn.id ? null : txn)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          txn.category === 'Groceries'
                            ? 'bg-green-500'
                            : txn.category === 'Dining'
                            ? 'bg-orange-500'
                            : txn.category === 'Transportation'
                            ? 'bg-blue-500'
                            : 'bg-purple-500'
                        }`}
                      >
                        {txn.category ? txn.category[0] : 'T'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{txn.description}</div>
                        <div className="text-sm text-gray-600">
                          {txn.merchant && `${txn.merchant} • `}
                          {new Date(txn.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-800">
                      ${txn.amount.toFixed(2)}
                    </div>
                    {txn.category && (
                      <div className="text-sm text-gray-600">{txn.category}</div>
                    )}
                  </div>
                </div>

                {selectedTxn?.id === txn.id && (
                  <motion.div
                    className="mt-4 pt-4 border-t border-gray-200"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <p className="text-gray-700 mb-4">
                      See what would happen if you made this purchase now with your current credit
                      situation.
                    </p>
                    <motion.button
                      className="btn-primary w-full"
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReplay(txn);
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Replay in Projected Mode'}
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="card bg-blue-50">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">About Transaction Replay</h3>
        <p className="text-gray-700">
          Replay lets you see how a past transaction would affect your credit score if made today.
          This helps you understand how your current credit situation compares to the past.
        </p>
      </div>
    </div>
  );
};

export default Transactions;
