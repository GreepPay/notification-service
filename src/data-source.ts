import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import fs from "fs";
// import { 
//   NotificationSchema,
//   NotificationTemplateSchema,
//   DeviceTokenSchema
// } from './models/schemas';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  ssl:
  process.env.DB_USE_SSL === "true"
    ? {
        rejectUnauthorized: true,
        ca: fs
          .readFileSync(__dirname + "/database/ca-certificate.crt")
          .toString(),
      }
    : false,
  entities: [
    // NotificationSchema,
    // NotificationTemplateSchema,
    // DeviceTokenSchema
  ],
  subscribers: [],
  migrations: ['src/database/migrations/*.ts'],
});