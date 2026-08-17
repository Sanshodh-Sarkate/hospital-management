/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddRescheduledToAppointmentStatusEnum1786896000000 {
    name = 'AddRescheduledToAppointmentStatusEnum1786896000000'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TYPE "public"."appointments_status_enum" ADD VALUE IF NOT EXISTS 'RESCHEDULED';`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        // Enum values cannot be easily removed in PostgreSQL without recreating the enum
    }
}
