import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Admin } from './entity/Admin';
import { Region } from './entity/Region';
import { LocalManagerPublic } from './entity/LocalManagerPublic';
import { LocalManagerGeneral } from './entity/LocalManagerGeneral';
import { LocalGovernment } from './entity/LocalGovernment';
import { Employer } from './entity/Employer';
import { SeasonWorker } from './entity/SeasonWorker';
import { Country } from './entity/Country';
import { VisaStatus } from './entity/VisaStatus';
import { Insurance } from './entity/Insurance';
import { Payment } from './entity/Payment';
import { BankAccount } from './entity/BankAccount';
import { CreditCard } from './entity/CreditCard';
import { ErrorCode } from './entity/ErrorCode';

// Global DataSource instance with initialized state tracking
declare global {
  // eslint-disable-next-line no-var
  var __APP_DATASOURCE__: DataSource | undefined;
}

// Create DataSource with explicit entity instances
const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '12345678',
  database: process.env.DB_DATABASE || 'insmart',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    Admin,
    Region,
    LocalManagerPublic,
    LocalManagerGeneral,
    LocalGovernment,
    Employer,
    SeasonWorker,
    Country,
    VisaStatus,
    Insurance,
    Payment,
    BankAccount,
    CreditCard,
    ErrorCode,
  ],
  migrations: [],
  subscribers: [],
});

export async function initializeDataSource(): Promise<DataSource> {
  try {
    // Use global cached instance if available and initialized
    if (global.__APP_DATASOURCE__?.isInitialized) {
      console.log('[TypeORM] Reusing existing DataSource');
      return global.__APP_DATASOURCE__;
    }

    // Initialize if not yet done
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      global.__APP_DATASOURCE__ = AppDataSource;
      console.log('[TypeORM] DataSource initialized successfully');
    }

    return AppDataSource;
  } catch (error) {
    console.error('[TypeORM] DataSource initialization failed:', error);
    throw error;
  }
}

export { AppDataSource };
