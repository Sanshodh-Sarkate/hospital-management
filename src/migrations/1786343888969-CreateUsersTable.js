const { Table } = require("typeorm");

module.exports = class CreateUsersTable1786343888969 {
  async up(queryRunner) {
    // Ensure uuid extension is available in Postgres
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "first_name",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "last_name",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          {
            name: "email",
            type: "varchar",
            length: "255",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "password",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "phone_number",
            type: "varchar",
            length: "20",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "role",
            type: "enum",
            enum: ["PATIENT", "DOCTOR", "RECEPTIONIST", "ADMIN"],
            default: "'PATIENT'",
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
          },
          {
            name: "last_login",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "password_reset_token",
            type: "varchar",
            length: "255",
            isNullable: true,
          },
          {
            name: "password_reset_expires",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "password_changed_at",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true
    );
  }

  async down(queryRunner) {
    await queryRunner.dropTable("users");
  }
};
