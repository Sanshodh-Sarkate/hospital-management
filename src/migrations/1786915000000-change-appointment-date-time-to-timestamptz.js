const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class ChangeAppointmentDateTimeToTimestamptz1786915000000 {
    name = 'ChangeAppointmentDateTimeToTimestamptz1786915000000'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "appointment_date_time" TYPE TIMESTAMP WITH TIME ZONE`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "appointment_date_time" TYPE TIMESTAMP WITHOUT TIME ZONE`);
    }
}
