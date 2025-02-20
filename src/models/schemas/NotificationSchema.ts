import { EntitySchema } from 'typeorm';
import { baseColumnOptions } from './BaseSchema';
import type { NotificationEntity } from '../../forms/notification';

export const NotificationSchema = new EntitySchema<NotificationEntity>({
    name: 'Notifications',
    columns: {
        ...baseColumnOptions,
        auth_user_id: {
            type: String,
            nullable: false,
        },
        type: {
            type: 'enum',
            enum: ['email', 'push'],
            nullable: false,
        },
        email: {
            type: String,
            nullable: true,
        },
        title: {
            type: String,
            nullable: false,
        },
        content: {
            type: String,
            nullable: false,
        },
        is_read: {
            type: Boolean,
            default: false,
        },
        delivery_status: {
            type: 'enum',
            enum: ['pending', 'sent', 'delivered', 'failed'],
            default: 'pending',
        },
    },
});