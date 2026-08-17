const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class SetAppointmentDateTimeWithoutTimezone1786920000000 {
    name = 'SetAppointmentDateTimeWithoutTimezone1786920000000'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "appointment_date_time" TYPE TIMESTAMP WITHOUT TIME ZONE`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "appointment_date_time" TYPE TIMESTAMP WITH TIME ZONE`);
    }
}
