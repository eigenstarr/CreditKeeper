import axios from 'axios';
import type {
  Customer,
  Account,
  Transaction,
  CreditData,
  ProjectedScenario,
  ProjectedResult,
  UserProfile,
  Mission
} from '../../shared/types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getCustomers = async (): Promise<Customer[]> => {
  const response = await api.get('/customers');
  return response.data;
};

export const getCustomer = async (customerId: string): Promise<Customer> => {
  const response = await api.get(`/customers/${customerId}`);
  return response.data;
};

export const getAccounts = async (customerId: string): Promise<Account[]> => {
  const response = await api.get(`/customers/${customerId}/accounts`);
  return response.data;
};

export const getAccount = async (accountId: string): Promise<Account> => {
  const response = await api.get(`/accounts/${accountId}`);
  return response.data;
};

export const getTransactions = async (accountId: string): Promise<Transaction[]> => {
  const response = await api.get(`/accounts/${accountId}/transactions`);
  return response.data;
};

export const getCreditData = async (accountId: string): Promise<CreditData> => {
  const response = await api.get(`/accounts/${accountId}/credit`);
  return response.data;
};

export const simulateScenario = async (
  accountId: string,
  scenario: ProjectedScenario
): Promise<ProjectedResult> => {
  const response = await api.post('/simulate', { accountId, scenario });
  return response.data;
};

export const getMissions = async (): Promise<Mission[]> => {
  const response = await api.get('/missions');
  return response.data;
};

export const completeMission = async (missionId: string): Promise<Mission> => {
  const response = await api.post(`/missions/${missionId}/complete`);
  return response.data;
};

export const getProfile = async (customerId: string): Promise<UserProfile> => {
  const response = await api.get(`/profile/${customerId}`);
  return response.data;
};

export const createProfile = async (profile: UserProfile): Promise<UserProfile> => {
  const response = await api.post('/profile', profile);
  return response.data;
};

export const updateProfile = async (
  customerId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> => {
  const response = await api.put(`/profile/${customerId}`, updates);
  return response.data;
};

export const checkHealth = async (): Promise<{ status: string; mockDataMode: boolean }> => {
  const response = await api.get('/health');
  return response.data;
};

export const generateSyntheticProfile = async (type: 'excellent' | 'healthy' | 'risky' | 'poor'): Promise<any> => {
  const response = await api.post('/synthetic/generate', { type });
  return response.data;
};

export const getSyntheticProfile = async (profileId: string): Promise<any> => {
  const response = await api.get(`/synthetic/${profileId}`);
  return response.data;
};

export const getToyScore = async (profileId: string): Promise<any> => {
  const response = await api.get(`/toyscore/${profileId}`);
  return response.data;
};

export const getToyScoreCreditData = async (profileId: string): Promise<any> => {
  const response = await api.get(`/toyscore/${profileId}/credit`);
  return response.data;
};

export const simulateToyScore = async (profileId: string, scenario: any): Promise<any> => {
  const response = await api.post('/toyscore/simulate', { profileId, scenario });
  return response.data;
};
