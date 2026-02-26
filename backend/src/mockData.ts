import type { Customer, Account, Transaction, CreditData } from '../../shared/types.js';

export const mockCustomer: Customer = {
  id: 'mock-customer-1',
  firstName: 'Alex',
  lastName: 'Chen',
  address: {
    streetNumber: '123',
    streetName: 'Main St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102'
  }
};

export const mockAccount: Account = {
  id: 'mock-account-1',
  type: 'Credit Card',
  balance: 1200,
  creditLimit: 5000,
  nickname: 'Capital One Quicksilver'
};

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    description: 'Grocery Store Purchase',
    amount: 87.43,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    merchant: 'Whole Foods',
    category: 'Groceries'
  },
  {
    id: 'txn-2',
    description: 'Gas Station',
    amount: 45.20,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    merchant: 'Shell',
    category: 'Transportation'
  },
  {
    id: 'txn-3',
    description: 'Restaurant',
    amount: 62.50,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    merchant: 'Italian Bistro',
    category: 'Dining'
  },
  {
    id: 'txn-4',
    description: 'Online Shopping',
    amount: 156.78,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    merchant: 'Amazon',
    category: 'Shopping'
  },
  {
    id: 'txn-5',
    description: 'Coffee Shop',
    amount: 5.75,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    merchant: 'Local Cafe',
    category: 'Dining'
  }
];

export function getMockCreditData(account: Account): CreditData {
  const utilization = account.creditLimit ? (account.balance / account.creditLimit) * 100 : 0;

  let healthLevel: 'high' | 'medium' | 'low';
  let baseScore: number;

  if (utilization < 30) {
    healthLevel = 'high';
    baseScore = 720;
  } else if (utilization < 50) {
    healthLevel = 'medium';
    baseScore = 680;
  } else {
    healthLevel = 'low';
    baseScore = 620;
  }

  return {
    score: baseScore,
    healthLevel,
    factors: {
      utilization: {
        name: 'Credit Utilization',
        value: utilization,
        status: utilization < 30 ? 'good' : utilization < 50 ? 'warning' : 'bad',
        explanation: utilization < 30
          ? 'Your credit utilization is healthy. Keep it below 30%.'
          : utilization < 50
          ? 'Your utilization is moderate. Try to keep it below 30%.'
          : 'High utilization can hurt your score. Pay down your balance.'
      },
      paymentHistory: {
        name: 'Payment History',
        value: 100,
        status: 'good',
        explanation: 'All payments made on time. Keep up the great work!'
      },
      creditLimit: {
        name: 'Credit Limit',
        value: account.creditLimit || 0,
        status: 'good',
        explanation: `Your credit limit is $${account.creditLimit?.toLocaleString()}.`
      },
      accountAge: {
        name: 'Account Age',
        value: 24,
        status: 'good',
        explanation: 'Your account has been open for 2 years.'
      }
    },
    lastUpdated: new Date().toISOString()
  };
}
