import type { MigrationInterface, QueryRunner } from "typeorm";
import pkg from "typeorm";
const { Table } = pkg;

export class CreateNotifications20240217000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "notifications",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "auth_user_id",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "type",
            type: "enum",
            enum: ["email", "push"],
            enumName: "notification_type_enum",
            isNullable: false,
          },
          {
            name: "title",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "content",
            type: "text",
            isNullable: false,
          },
          {
            name: "is_read",
            type: "boolean",
            default: false,
          },
          {
            name: "delivery_status",
            type: "enum",
            enum: ["pending", "sent", "delivered", "failed"],
            enumName: "delivery_status_enum",
            default: "'pending'",
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("notifications");
    await queryRunner.query(`DROP TYPE IF EXISTS "delivery_status_enum"`);
  }
}
