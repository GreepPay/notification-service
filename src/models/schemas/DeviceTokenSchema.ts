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
    },
    indices: [
        { name: "idx_device_tokens_auth_user_id", columns: ["auth_user_id"] },
        { name: "idx_device_tokens_token", columns: ["token"] },
        { name: "idx_device_tokens_is_active", columns: ["is_active"] }
    ]
});