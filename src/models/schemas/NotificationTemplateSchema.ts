import { EntitySchema } from 'typeorm';
import type { NotificationTemplateEntity } from '../../forms/notificationTemplate';
import { baseColumnOptions } from './BaseSchema';

export const NotificationTemplateSchema = new EntitySchema<NotificationTemplateEntity>({
    name: 'NotificationTemplate',
    columns: {
        ...baseColumnOptions,
        name: {
            type: String,
            nullable: false,
        },
        type: {
            type: 'enum',
            enum: ['email', 'push'],
            nullable: false,
        },
        subject: {
            type: String,
            nullable: false,
        },
        content: {
            type: String,
            nullable: false,
        },
        metadata: {
            type: 'jsonb',
            nullable: true,
        },
    }
});