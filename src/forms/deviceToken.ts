export interface DeviceTokenEntity {
    id: number;
    auth_user_id: string;
    device_type: 'ios' | 'android' | 'web';
    token: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}
