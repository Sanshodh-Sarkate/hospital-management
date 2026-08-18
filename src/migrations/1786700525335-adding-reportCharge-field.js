/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddingReportChargeField1786700525335 {
    name = 'AddingReportChargeField1786700525335'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "medical_reports" ADD "report_charge" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "payment_date" SET DEFAULT now()`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "payment_date" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "medical_reports" DROP COLUMN "report_charge"`);
    }
}
