import { EntitySchema } from 'typeorm';
import type { DeviceTokenEntity } from '../../forms/deviceToken';
import { baseColumnOptions } from './BaseSchema';

export const DeviceTokenSchema = new EntitySchema<DeviceTokenEntity>({
    name: 'DeviceToken',
    columns: {
        ...baseColumnOptions,
        auth_user_id: {
            type: String,
            nullable: false,
        },
        device_type: {
            type: 'enum',
            enum: ['ios', 'android', 'web'],
            nullable: false,
        },
        token: {
            type: String,
            nullable: false,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
    }
});