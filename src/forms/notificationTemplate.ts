export interface NotificationTemplateEntity {
    id: number;
    name: string;
    type: 'email' | 'push';
    subject: string;
    content: string;
    metadata?: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}
