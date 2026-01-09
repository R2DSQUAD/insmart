import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Admin } from '@/lib/entity/Admin';
import { Region } from '@/lib/entity/Region';
import { LocalManagerPublic } from '@/lib/entity/LocalManagerPublic';
import { LocalManagerGeneral } from '@/lib/entity/LocalManagerGeneral';
import { LocalGovernment } from '@/lib/entity/LocalGovernment';
import { Employer } from '@/lib/entity/Employer';
import { SeasonWorker } from '@/lib/entity/SeasonWorker';
import { Country } from '@/lib/entity/Country';
import { Insurance } from '@/lib/entity/Insurance';
import { Payment } from '@/lib/entity/Payment';
import { BankAccount } from '@/lib/entity/BankAccount';
import { CreditCard } from '@/lib/entity/CreditCard';

// Create DataSource with explicit entity instances
const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    Admin,
    Region,
    LocalManagerPublic,
    LocalManagerGeneral,
    LocalGovernment,
    Employer,
    SeasonWorker,
    Country,
    Insurance,
    Payment,
    BankAccount,
    CreditCard,
  ],
  migrations: [],
  subscribers: [],
});

export async function initializeDataSource(): Promise<DataSource> {
  try {
    // Initialize if not yet done
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('[TypeORM] DataSource initialized successfully');
    }

    return AppDataSource;
  } catch (error) {
    console.error('[TypeORM] DataSource initialization failed:', error);
    throw error;
  }
}

export { AppDataSource };
