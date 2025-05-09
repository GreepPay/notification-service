export interface NotificationEntity {
    id: number;
    auth_user_id: string;
    type: 'email' | 'push';
    title: string;
    content: string;
    email: string | null;
    is_read: boolean;
    delivery_status: 'pending' | 'sent' | 'delivered' | 'failed';
    created_at: Date;
    updated_at: Date;
}

export interface BroadcastNotificationOptions {
    notificationType: string;
    additionalData?: Record<string, any>;
    priority?: 'high' | 'normal';
  }
  