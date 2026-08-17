const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class AddDepartmentIdToAppointments1786910000000 {
    name = 'AddDepartmentIdToAppointments1786910000000'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "department_id" uuid`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_appointments_department" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_appointments_department"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "department_id"`);
    }
}
