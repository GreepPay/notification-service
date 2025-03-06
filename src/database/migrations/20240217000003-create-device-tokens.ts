import type { MigrationInterface, QueryRunner } from "typeorm";
import pkg from "typeorm";
const { Table } = pkg;

export class CreateDeviceTokens20240217000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "device_tokens",
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
            name: "device_type",
            type: "enum",
            enum: ["ios", "android", "web"],
            enumName: "device_type_enum",
            isNullable: false,
          },
          {
            name: "token",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
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
    await queryRunner.dropTable("device_tokens");
    await queryRunner.query(`DROP TYPE IF EXISTS "device_type_enum"`);
  }
}
