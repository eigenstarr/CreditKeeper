import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nessieApiKey: process.env.NESSIE_API_KEY || '',
  nessieBaseUrl: process.env.NESSIE_BASE_URL || 'http://api.nessieisreal.com',
  nodeEnv: process.env.NODE_ENV || 'development',
  useMockData: !process.env.NESSIE_API_KEY || process.env.USE_MOCK_DATA === 'true'
};
