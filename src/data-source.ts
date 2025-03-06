import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { 
  NotificationSchema,
  NotificationTemplateSchema,
  DeviceTokenSchema
} from './models/schemas';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  entities: [
    NotificationSchema,
    NotificationTemplateSchema,
    DeviceTokenSchema
  ],
  subscribers: [],
  migrations: ['src/database/migrations/*.ts'],
});