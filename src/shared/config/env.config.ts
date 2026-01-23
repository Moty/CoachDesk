import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  nodeEnv: 'development' | 'staging' | 'production' | 'test';
  port: number;
  logLevel: string;
  dbType: string;
  firestoreProjectId: string;
  firestoreDatabaseId: string;
  corsOrigin: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpFrom: string;
}

function validateEnv(): EnvConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  if (!['development', 'staging', 'production', 'test'].includes(nodeEnv)) {
    throw new Error(`Invalid NODE_ENV: ${nodeEnv}. Must be development, staging, production, or test`);
  }

  const port = parseInt(process.env.PORT || '3000', 10);
  if (isNaN(port) || port < 0 || port > 65535) {
    throw new Error(`Invalid PORT: ${process.env.PORT}. Must be a number between 0 and 65535`);
  }

  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  
  const config: EnvConfig = {
    nodeEnv: nodeEnv as 'development' | 'staging' | 'production' | 'test',
    port,
    logLevel: process.env.LOG_LEVEL || 'info',
    dbType: process.env.DB_TYPE || 'firestore',
    firestoreProjectId: process.env.FIRESTORE_PROJECT_ID || '',
    firestoreDatabaseId: process.env.FIRESTORE_DATABASE_ID || '(default)',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort,
    smtpUser: process.env.SMTP_USER || '',
    smtpPassword: process.env.SMTP_PASSWORD || '',
    smtpFrom: process.env.SMTP_FROM || 'noreply@coachdesk.com'
  };

  return config;
}

export const config = validateEnv();

export function logConfig(): void {
  console.log('Configuration loaded:');
  console.log(`  NODE_ENV: ${config.nodeEnv}`);
  console.log(`  PORT: ${config.port}`);
  console.log(`  LOG_LEVEL: ${config.logLevel}`);
  console.log(`  DB_TYPE: ${config.dbType}`);
  console.log(`  FIRESTORE_DATABASE_ID: ${config.firestoreDatabaseId}`);
  console.log(`  CORS_ORIGIN: ${config.corsOrigin}`);
}
