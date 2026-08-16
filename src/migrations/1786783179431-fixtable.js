/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class Fixtable1786783179431 {
    name = 'Fixtable1786783179431'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "medical_reports" ADD COLUMN IF NOT EXISTS "report_charge" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "payment_date" SET DEFAULT now()`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "payment_date" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "medical_reports" DROP COLUMN IF EXISTS "report_charge"`);
    }
}
