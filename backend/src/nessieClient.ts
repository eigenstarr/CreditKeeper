import axios, { AxiosInstance } from 'axios';
import { config } from './config.js';
import type { Customer, Account, Transaction } from '../../shared/types.js';
import { mockCustomer, mockAccount, mockTransactions } from './mockData.js';

class NessieClient {
  private client: AxiosInstance;
  private useMock: boolean;

  constructor() {
    this.useMock = config.useMockData;
    this.client = axios.create({
      baseURL: config.nessieBaseUrl,
      params: {
        key: config.nessieApiKey
      }
    });
  }

  async getCustomers(): Promise<Customer[]> {
    if (this.useMock) {
      console.log('[MOCK DATA MODE] Returning mock customer');
      return [mockCustomer];
    }

    try {
      const response = await this.client.get('/customers');
      const customers = Array.isArray(response.data) ? response.data : [response.data];
      return customers.map(this.mapCustomer);
    } catch (error) {
      console.error('Error fetching customers, falling back to mock data:', error);
      return [mockCustomer];
    }
  }

  private mapCustomer(data: any): Customer {
    return {
      id: data._id || data.id,
      firstName: data.first_name || data.firstName,
      lastName: data.last_name || data.lastName,
      address: {
        streetNumber: data.address?.street_number || '',
        streetName: data.address?.street_name || '',
        city: data.address?.city || '',
        state: data.address?.state || '',
        zip: data.address?.zip || ''
      }
    };
  }

  async getCustomer(customerId: string): Promise<Customer> {
    if (this.useMock) {
      console.log('[MOCK DATA MODE] Returning mock customer');
      return mockCustomer;
    }

    try {
      const response = await this.client.get(`/customers/${customerId}`);
      return this.mapCustomer(response.data);
    } catch (error) {
      console.error('Error fetching customer, falling back to mock data:', error);
      return mockCustomer;
    }
  }

  async getAccounts(customerId: string): Promise<Account[]> {
    if (this.useMock) {
      console.log('[MOCK DATA MODE] Returning mock account');
      return [mockAccount];
    }

    try {
      const response = await this.client.get(`/customers/${customerId}/accounts`);
      const accounts = Array.isArray(response.data) ? response.data : [response.data];
      return accounts.map(this.mapAccount);
    } catch (error) {
      console.error('Error fetching accounts, falling back to mock data:', error);
      return [mockAccount];
    }
  }

  private mapAccount(data: any): Account {
    return {
      id: data._id || data.id,
      type: data.type,
      balance: data.balance || 0,
      creditLimit: data.credit_limit || data.creditLimit,
      nickname: data.nickname
    };
  }

  async getAccount(accountId: string): Promise<Account> {
    if (this.useMock) {
      console.log('[MOCK DATA MODE] Returning mock account');
      return mockAccount;
    }

    try {
      const response = await this.client.get(`/accounts/${accountId}`);
      return this.mapAccount(response.data);
    } catch (error) {
      console.error('Error fetching account, falling back to mock data:', error);
      return mockAccount;
    }
  }

  async getPurchases(accountId: string): Promise<Transaction[]> {
    if (this.useMock) {
      console.log('[MOCK DATA MODE] Returning mock transactions');
      return mockTransactions;
    }

    try {
      const response = await this.client.get(`/accounts/${accountId}/purchases`);
      const purchases = Array.isArray(response.data) ? response.data : [response.data];
      return purchases.map((purchase: any) => ({
        id: purchase._id || purchase.id,
        description: purchase.description || 'Purchase',
        amount: purchase.amount || 0,
        date: purchase.purchase_date || purchase.date || new Date().toISOString(),
        merchant: purchase.merchant_id || purchase.merchant,
        category: purchase.medium || purchase.category
      }));
    } catch (error) {
      console.error('Error fetching purchases, falling back to mock data:', error);
      return mockTransactions;
    }
  }

  isUsingMockData(): boolean {
    return this.useMock;
  }
}

export const nessieClient = new NessieClient();
