/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class CreateNewUserDocsUrl1787122019062 {
    name = 'CreateNewUserDocsUrl1787122019062'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_appointments_department"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "patient_document_url" character varying(255)`);
        await queryRunner.query(`ALTER TYPE "public"."appointments_status_enum" RENAME TO "appointments_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."appointments_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'REJECTED')`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "status" TYPE "public"."appointments_status_enum" USING "status"::"text"::"public"."appointments_status_enum"`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."appointments_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_8592c8a9f19602a39b5a0439972" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_8592c8a9f19602a39b5a0439972"`);
        await queryRunner.query(`CREATE TYPE "public"."appointments_status_enum_old" AS ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW', 'RESCHEDULED')`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "status" TYPE "public"."appointments_status_enum_old" USING "status"::"text"::"public"."appointments_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."appointments_status_enum_old" RENAME TO "appointments_status_enum"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "patient_document_url"`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_appointments_department" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }
}
