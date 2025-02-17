import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateIndexes20240217000004 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add indexes for notifications table
        await queryRunner.query(`
            CREATE INDEX "idx_notifications_auth_user_id" ON "notifications" ("auth_user_id");
            CREATE INDEX "idx_notifications_created_at" ON "notifications" ("created_at");
            CREATE INDEX "idx_notifications_is_read" ON "notifications" ("is_read");
        `);

        // Add indexes for device_tokens table
        await queryRunner.query(`
            CREATE INDEX "idx_device_tokens_auth_user_id" ON "device_tokens" ("auth_user_id");
            CREATE INDEX "idx_device_tokens_token" ON "device_tokens" ("token");
            CREATE INDEX "idx_device_tokens_is_active" ON "device_tokens" ("is_active");
        `);

        // Add indexes for notification_templates table
        await queryRunner.query(`
            CREATE INDEX "idx_notification_templates_name" ON "notification_templates" ("name");
            CREATE INDEX "idx_notification_templates_type" ON "notification_templates" ("type");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove indexes from notifications table
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_notifications_auth_user_id";
            DROP INDEX IF EXISTS "idx_notifications_created_at";
            DROP INDEX IF EXISTS "idx_notifications_is_read";
        `);

        // Remove indexes from device_tokens table
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_device_tokens_auth_user_id";
            DROP INDEX IF EXISTS "idx_device_tokens_token";
            DROP INDEX IF EXISTS "idx_device_tokens_is_active";
        `);

        // Remove indexes from notification_templates table
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_notification_templates_name";
            DROP INDEX IF EXISTS "idx_notification_templates_type";
        `);
    }
}