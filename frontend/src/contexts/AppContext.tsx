import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type {
  Customer,
  Account,
  Transaction,
  CreditData,
  UserProfile,
  AppMode,
  ProjectedResult
} from '../../../shared/types';

interface AppContextType {
  customer: Customer | null;
  setCustomer: (customer: Customer | null) => void;
  account: Account | null;
  setAccount: (account: Account | null) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  creditData: CreditData | null;
  setCreditData: (creditData: CreditData | null) => void;
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  projectedResult: ProjectedResult | null;
  setProjectedResult: (result: ProjectedResult | null) => void;
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
  isMockData: boolean;
  setIsMockData: (isMock: boolean) => void;
  isToyScore: boolean;
  setIsToyScore: (isToy: boolean) => void;
  syntheticProfileId: string | null;
  setSyntheticProfileId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mode, setMode] = useState<AppMode>('real');
  const [projectedResult, setProjectedResult] = useState<ProjectedResult | null>(null);
  const [currentScreen, setCurrentScreen] = useState<string>('onboarding');
  const [isMockData, setIsMockData] = useState<boolean>(false);
  const [isToyScore, setIsToyScore] = useState<boolean>(false);
  const [syntheticProfileId, setSyntheticProfileId] = useState<string | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('creditkeeper_profile');
    const savedToyMode = localStorage.getItem('creditkeeper_toy_mode');
    const savedSyntheticId = localStorage.getItem('creditkeeper_synthetic_id');

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setCurrentScreen('home');
    }
    if (savedToyMode) {
      setIsToyScore(JSON.parse(savedToyMode));
    }
    if (savedSyntheticId) {
      setSyntheticProfileId(savedSyntheticId);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      localStorage.setItem('creditkeeper_profile', JSON.stringify(profile));
    }
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('creditkeeper_toy_mode', JSON.stringify(isToyScore));
  }, [isToyScore]);

  useEffect(() => {
    if (syntheticProfileId) {
      localStorage.setItem('creditkeeper_synthetic_id', syntheticProfileId);
    }
  }, [syntheticProfileId]);

  const value: AppContextType = {
    customer,
    setCustomer,
    account,
    setAccount,
    transactions,
    setTransactions,
    creditData,
    setCreditData,
    profile,
    setProfile,
    mode,
    setMode,
    projectedResult,
    setProjectedResult,
    currentScreen,
    setCurrentScreen,
    isMockData,
    setIsMockData,
    isToyScore,
    setIsToyScore,
    syntheticProfileId,
    setSyntheticProfileId
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
