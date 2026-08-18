/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class MedicalReportTable1786604940204 {
    name = 'MedicalReportTable1786604940204'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."medical_reports_report_type_enum" AS ENUM('LAB_TEST', 'X_RAY', 'MRI', 'CT_SCAN', 'ECG', 'ULTRASOUND', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "medical_reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "report_number" character varying(50) NOT NULL, "report_name" character varying(150) NOT NULL, "report_type" "public"."medical_reports_report_type_enum" NOT NULL, "result" text NOT NULL, "normal_range" character varying(100), "unit" character varying(50), "report_file_url" character varying(255), "remarks" text, "generated_at" TIMESTAMP NOT NULL DEFAULT now(), "appointment_id" uuid NOT NULL, "patient_id" uuid NOT NULL, "doctor_id" uuid NOT NULL, "generated_by" uuid NOT NULL, "updated_by" uuid, CONSTRAINT "UQ_1a7964e4b5d1c0b5b60d666d64e" UNIQUE ("report_number"), CONSTRAINT "PK_d5f4b80d583ee85380b5d4ac826" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "medical_reports" ADD CONSTRAINT "FK_73129fe925af48ba55234fdd142" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_reports" ADD CONSTRAINT "FK_251c373f7e33e9c319df8c79c7f" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_reports" ADD CONSTRAINT "FK_e2492fa5b8812c33c64d791d7f5" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_reports" ADD CONSTRAINT "FK_ef8563afdbca82e5a9fc1e79791" FOREIGN KEY ("generated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_reports" ADD CONSTRAINT "FK_dd1f8c6f2f9e586316031925baa" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "medical_reports" DROP CONSTRAINT "FK_dd1f8c6f2f9e586316031925baa"`);
        await queryRunner.query(`ALTER TABLE "medical_reports" DROP CONSTRAINT "FK_ef8563afdbca82e5a9fc1e79791"`);
        await queryRunner.query(`ALTER TABLE "medical_reports" DROP CONSTRAINT "FK_e2492fa5b8812c33c64d791d7f5"`);
        await queryRunner.query(`ALTER TABLE "medical_reports" DROP CONSTRAINT "FK_251c373f7e33e9c319df8c79c7f"`);
        await queryRunner.query(`ALTER TABLE "medical_reports" DROP CONSTRAINT "FK_73129fe925af48ba55234fdd142"`);
        await queryRunner.query(`DROP TABLE "medical_reports"`);
        await queryRunner.query(`DROP TYPE "public"."medical_reports_report_type_enum"`);
    }
}
