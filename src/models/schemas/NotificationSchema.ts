import { EntitySchema } from 'typeorm';
import { baseColumnOptions } from './BaseSchema';

export const NotificationSchema = new EntitySchema<NotificationEntity>({
    name: 'Notification',
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
    indices: [
        { name: "idx_notifications_auth_user_id", columns: ["auth_user_id"] },
        { name: "idx_notifications_created_at", columns: ["created_at"] },
        { name: "idx_notifications_is_read", columns: ["is_read"] },
        { 
            name: "idx_notifications_user_unread",
            columns: ["auth_user_id", "created_at"],
            where: "is_read = false"
        }
    ]
});