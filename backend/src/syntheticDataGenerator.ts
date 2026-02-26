import type { SyntheticProfile, BillingCycle, Payment, Transaction, CheckingAccount, Account } from '../../shared/types.js';

export class SyntheticDataGenerator {
  private static generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  private static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static generateHealthyProfile(): SyntheticProfile {
    const profileId = this.generateId('profile');
    const accountId = this.generateId('account');
    const checkingId = this.generateId('checking');

    const creditLimit = 5000;
    const openDate = this.addMonths(new Date(), -18); // Reduced from 24 to 18 months
    const currentBalance = 1350; // Increased from 750 to 1350 (27% utilization)

    const creditCardAccount: SyntheticProfile['creditCardAccount'] = {
      id: accountId,
      type: 'Credit Card',
      balance: currentBalance,
      creditLimit,
      nickname: 'Capital One Quicksilver',
      apr: 18.99,
      openDate: openDate.toISOString(),
      status: 'active'
    };

    const { checkingAccount, deposits } = this.generateCheckingAccount(checkingId, 4500, 18);

    const { billingCycles, payments } = this.generateHealthyBillingHistory(
      accountId,
      creditLimit,
      currentBalance
    );

    const transactions = this.generateTransactionsForBillingCycles(billingCycles);

    return {
      id: profileId,
      name: 'Healthy Alex',
      type: 'healthy',
      creditCardAccount,
      checkingAccount,
      transactions,
      billingCycles,
      payments,
      createdAt: new Date().toISOString()
    };
  }

  static generateRiskyProfile(): SyntheticProfile {
    const profileId = this.generateId('profile');
    const accountId = this.generateId('account');
    const checkingId = this.generateId('checking');

    const creditLimit = 3000;
    const openDate = this.addMonths(new Date(), -8);
    const currentBalance = 1950;

    const creditCardAccount: SyntheticProfile['creditCardAccount'] = {
      id: accountId,
      type: 'Credit Card',
      balance: currentBalance,
      creditLimit,
      nickname: 'Capital One Platinum',
      apr: 24.99,
      openDate: openDate.toISOString(),
      status: 'active'
    };

    const { checkingAccount } = this.generateCheckingAccount(checkingId, 1200, 8);

    const { billingCycles, payments } = this.generateRiskyBillingHistory(
      accountId,
      creditLimit,
      currentBalance
    );

    const transactions = this.generateTransactionsForBillingCycles(billingCycles);

    return {
      id: profileId,
      name: 'Risky Jordan',
      type: 'risky',
      creditCardAccount,
      checkingAccount,
      transactions,
      billingCycles,
      payments,
      createdAt: new Date().toISOString()
    };
  }

  static generateExcellentProfile(): SyntheticProfile {
    const profileId = this.generateId('profile');
    const accountId = this.generateId('account');
    const checkingId = this.generateId('checking');

    const creditLimit = 15000;
    const openDate = this.addMonths(new Date(), -60); // 5 years of history
    const currentBalance = 300; // Only 2% utilization

    const creditCardAccount: SyntheticProfile['creditCardAccount'] = {
      id: accountId,
      type: 'Credit Card',
      balance: currentBalance,
      creditLimit,
      nickname: 'Capital One Venture X',
      apr: 14.99,
      openDate: openDate.toISOString(),
      status: 'active'
    };

    const { checkingAccount } = this.generateCheckingAccount(checkingId, 12000, 60);

    const { billingCycles, payments } = this.generateExcellentBillingHistory(
      accountId,
      creditLimit,
      currentBalance
    );

    const transactions = this.generateTransactionsForBillingCycles(billingCycles);

    return {
      id: profileId,
      name: 'Smart Bernard',
      type: 'healthy',
      creditCardAccount,
      checkingAccount,
      transactions,
      billingCycles,
      payments,
      createdAt: new Date().toISOString()
    };
  }

  static generatePoorProfile(): SyntheticProfile {
    const profileId = this.generateId('profile');
    const accountId = this.generateId('account');
    const checkingId = this.generateId('checking');

    const creditLimit = 1500;
    const openDate = this.addMonths(new Date(), -5); // Only 5 months history
    const currentBalance = 1485; // 99% utilization

    const creditCardAccount: SyntheticProfile['creditCardAccount'] = {
      id: accountId,
      type: 'Credit Card',
      balance: currentBalance,
      creditLimit,
      nickname: 'Capital One Secured',
      apr: 29.99,
      openDate: openDate.toISOString(),
      status: 'active'
    };

    const { checkingAccount } = this.generateCheckingAccount(checkingId, 150, 5);

    const { billingCycles, payments } = this.generatePoorBillingHistory(
      accountId,
      creditLimit,
      currentBalance
    );

    const transactions = this.generateTransactionsForBillingCycles(billingCycles);

    return {
      id: profileId,
      name: 'Dangerous David',
      type: 'risky',
      creditCardAccount,
      checkingAccount,
      transactions,
      billingCycles,
      payments,
      createdAt: new Date().toISOString()
    };
  }

  private static generateCheckingAccount(
    id: string,
    initialBalance: number,
    monthsHistory: number
  ): { checkingAccount: CheckingAccount; deposits: CheckingAccount['deposits'] } {
    const deposits: CheckingAccount['deposits'] = [];
    let currentDate = this.addMonths(new Date(), -monthsHistory);

    while (currentDate <= new Date()) {
      deposits.push({
        id: this.generateId('deposit'),
        amount: 2000,
        date: currentDate.toISOString(),
        description: 'Paycheck Direct Deposit',
        type: 'paycheck'
      });

      currentDate = this.addDays(currentDate, 14);
    }

    return {
      checkingAccount: {
        id,
        balance: initialBalance,
        deposits
      },
      deposits
    };
  }

  private static generateHealthyBillingHistory(
    accountId: string,
    creditLimit: number,
    currentBalance: number
  ): { billingCycles: BillingCycle[]; payments: Payment[] } {
    const billingCycles: BillingCycle[] = [];
    const payments: Payment[] = [];

    const numCycles = 12;
    // Start from 12 months ago to show recent history
    let cycleStart = this.addMonths(new Date(), -numCycles);

    for (let i = 0; i < numCycles; i++) {
      const cycleEnd = this.addMonths(cycleStart, 1);
      const dueDate = this.addDays(cycleEnd, 21);

      const balance = i === numCycles - 1 ? currentBalance : Math.floor(Math.random() * 1000) + 500;
      const minimumDue = Math.floor(balance * 0.03);

      const cycleId = this.generateId('cycle');

      // Add 1 late payment at cycle 6 to lower score to 720-750 range
      const isLatePayment = i === 6;

      const paymentAmount = balance;
      const paymentDate = isLatePayment ? this.addDays(dueDate, 5) : this.addDays(dueDate, -5);

      billingCycles.push({
        id: cycleId,
        statementStart: cycleStart.toISOString(),
        statementEnd: cycleEnd.toISOString(),
        dueDate: dueDate.toISOString(),
        statementBalance: balance,
        minimumDue,
        paidAmount: paymentAmount,
        paidOnTime: !isLatePayment,
        isPaid: i < numCycles - 1
      });

      if (i < numCycles - 1) {
        payments.push({
          id: this.generateId('payment'),
          amount: paymentAmount,
          date: paymentDate.toISOString(),
          source: 'checking',
          billingCycleId: cycleId
        });
      }

      cycleStart = cycleEnd;
    }

    return { billingCycles, payments };
  }

  private static generateRiskyBillingHistory(
    accountId: string,
    creditLimit: number,
    currentBalance: number
  ): { billingCycles: BillingCycle[]; payments: Payment[] } {
    const billingCycles: BillingCycle[] = [];
    const payments: Payment[] = [];

    const numCycles = 8;
    // Start from 8 months ago to show recent history
    let cycleStart = this.addMonths(new Date(), -numCycles);

    for (let i = 0; i < numCycles; i++) {
      const cycleEnd = this.addMonths(cycleStart, 1);
      const dueDate = this.addDays(cycleEnd, 21);

      const balance = i === numCycles - 1 ? currentBalance : Math.floor(Math.random() * 2000) + 1200;
      const minimumDue = Math.floor(balance * 0.03);

      const cycleId = this.generateId('cycle');

      const missedPayment = i === 4;
      const latePayment = i === 2;

      let paidOnTime = true;
      let isPaid = i < numCycles - 1;
      let paymentAmount = minimumDue;
      let paymentDate: Date | null = null;

      if (missedPayment) {
        paidOnTime = false;
        isPaid = false;
      } else if (latePayment) {
        paidOnTime = false;
        isPaid = true;
        paymentDate = this.addDays(dueDate, 8);
      } else if (i < numCycles - 1) {
        paymentDate = this.addDays(dueDate, -3);
      }

      billingCycles.push({
        id: cycleId,
        statementStart: cycleStart.toISOString(),
        statementEnd: cycleEnd.toISOString(),
        dueDate: dueDate.toISOString(),
        statementBalance: balance,
        minimumDue,
        paidAmount: isPaid ? paymentAmount : 0,
        paidOnTime,
        isPaid
      });

      if (paymentDate && isPaid) {
        payments.push({
          id: this.generateId('payment'),
          amount: paymentAmount,
          date: paymentDate.toISOString(),
          source: 'checking',
          billingCycleId: cycleId
        });
      }

      cycleStart = cycleEnd;
    }

    return { billingCycles, payments };
  }

  private static generateExcellentBillingHistory(
    accountId: string,
    creditLimit: number,
    currentBalance: number
  ): { billingCycles: BillingCycle[]; payments: Payment[] } {
    const billingCycles: BillingCycle[] = [];
    const payments: Payment[] = [];

    const numCycles = 12; // Show last 12 months of a 5-year history
    // Start from 12 months ago to show recent history
    let cycleStart = this.addMonths(new Date(), -numCycles);

    for (let i = 0; i < numCycles; i++) {
      const cycleEnd = this.addMonths(cycleStart, 1);
      const dueDate = this.addDays(cycleEnd, 21);

      // Low balances, paid in full every month
      const balance = i === numCycles - 1 ? currentBalance : Math.floor(Math.random() * 500) + 200;
      const minimumDue = Math.floor(balance * 0.03);

      const cycleId = this.generateId('cycle');

      // ALWAYS pays in full, ALWAYS early
      const paymentAmount = balance;
      const paymentDate = this.addDays(dueDate, -10); // 10 days early

      billingCycles.push({
        id: cycleId,
        statementStart: cycleStart.toISOString(),
        statementEnd: cycleEnd.toISOString(),
        dueDate: dueDate.toISOString(),
        statementBalance: balance,
        minimumDue,
        paidAmount: paymentAmount,
        paidOnTime: true,
        isPaid: i < numCycles - 1
      });

      if (i < numCycles - 1) {
        payments.push({
          id: this.generateId('payment'),
          amount: paymentAmount,
          date: paymentDate.toISOString(),
          source: 'checking',
          billingCycleId: cycleId
        });
      }

      cycleStart = cycleEnd;
    }

    return { billingCycles, payments };
  }

  private static generatePoorBillingHistory(
    accountId: string,
    creditLimit: number,
    currentBalance: number
  ): { billingCycles: BillingCycle[]; payments: Payment[] } {
    const billingCycles: BillingCycle[] = [];
    const payments: Payment[] = [];

    const numCycles = 5;
    // Start from 5 months ago to show recent history
    let cycleStart = this.addMonths(new Date(), -numCycles);

    for (let i = 0; i < numCycles; i++) {
      const cycleEnd = this.addMonths(cycleStart, 1);
      const dueDate = this.addDays(cycleEnd, 21);

      // High balances near limit
      const balance = i === numCycles - 1 ? currentBalance : Math.floor(Math.random() * 200) + 1300;
      const minimumDue = Math.floor(balance * 0.03);

      const cycleId = this.generateId('cycle');

      // Multiple missed and late payments
      const missedPayment = i === 1 || i === 3; // 2 missed payments
      const latePayment = i === 2; // 1 late payment

      let paidOnTime = true;
      let isPaid = i < numCycles - 1;
      let paymentAmount = minimumDue * 0.5; // Only pays half of minimum when pays
      let paymentDate: Date | null = null;

      if (missedPayment) {
        paidOnTime = false;
        isPaid = false;
      } else if (latePayment) {
        paidOnTime = false;
        isPaid = true;
        paymentDate = this.addDays(dueDate, 15); // 15 days late
        paymentAmount = minimumDue * 0.7; // Pays partial
      } else if (i < numCycles - 1) {
        // Even "on time" payments are just barely
        paymentDate = this.addDays(dueDate, -1);
        paymentAmount = minimumDue;
      }

      billingCycles.push({
        id: cycleId,
        statementStart: cycleStart.toISOString(),
        statementEnd: cycleEnd.toISOString(),
        dueDate: dueDate.toISOString(),
        statementBalance: balance,
        minimumDue,
        paidAmount: isPaid ? paymentAmount : 0,
        paidOnTime,
        isPaid
      });

      if (paymentDate && isPaid) {
        payments.push({
          id: this.generateId('payment'),
          amount: paymentAmount,
          date: paymentDate.toISOString(),
          source: 'checking',
          billingCycleId: cycleId
        });
      }

      cycleStart = cycleEnd;
    }

    return { billingCycles, payments };
  }

  private static generateTransactionsForBillingCycles(cycles: BillingCycle[]): Transaction[] {
    const transactions: Transaction[] = [];
    const categories = ['Groceries', 'Dining', 'Transportation', 'Shopping', 'Entertainment', 'Utilities'];
    const merchants: { [key: string]: string[] } = {
      Groceries: ['Whole Foods', 'Trader Joes', 'Safeway', 'Local Market'],
      Dining: ['Italian Bistro', 'Sushi Restaurant', 'Coffee Shop', 'Pizza Place'],
      Transportation: ['Shell', 'Chevron', 'Uber', 'Metro Transit'],
      Shopping: ['Amazon', 'Target', 'Best Buy', 'Local Store'],
      Entertainment: ['Netflix', 'Movie Theater', 'Concert Venue', 'Gym'],
      Utilities: ['Electric Company', 'Water Utility', 'Internet Provider']
    };

    cycles.forEach((cycle) => {
      const numTransactions = Math.floor(Math.random() * 8) + 5;
      let totalAmount = 0;

      for (let i = 0; i < numTransactions && totalAmount < cycle.statementBalance; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const merchantList = merchants[category];
        const merchant = merchantList[Math.floor(Math.random() * merchantList.length)];

        const maxAmount = Math.min(300, cycle.statementBalance - totalAmount);
        const amount = Math.floor(Math.random() * maxAmount) + 10;

        const cycleStart = new Date(cycle.statementStart);
        const cycleEnd = new Date(cycle.statementEnd);
        const dayRange = Math.floor((cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24));
        const randomDay = Math.floor(Math.random() * dayRange);
        const transactionDate = this.addDays(cycleStart, randomDay);

        transactions.push({
          id: this.generateId('txn'),
          description: `${merchant} Purchase`,
          amount,
          date: transactionDate.toISOString(),
          merchant,
          category
        });

        totalAmount += amount;
      }
    });

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}
