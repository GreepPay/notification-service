import type { MigrationInterface, QueryRunner } from "typeorm";
import pkg from "typeorm";
const { Table } = pkg;

export class CreateNotificationTemplates20240217000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "notification_templates",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "name",
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
            name: "subject",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "content",
            type: "text",
            isNullable: false,
          },
          {
            name: "metadata",
            type: "jsonb",
            isNullable: true,
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
    await queryRunner.dropTable("notification_templates");
    await queryRunner.query(`DROP TYPE IF EXISTS "notification_type_enum"`);
  }
}
