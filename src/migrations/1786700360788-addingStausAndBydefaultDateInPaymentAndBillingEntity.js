/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddingStausAndBydefaultDateInPaymentAndBillingEntity1786700360788 {
    name = 'AddingStausAndBydefaultDateInPaymentAndBillingEntity1786700360788'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."billings_payment_status_enum" AS ENUM('UNPAID', 'PARTIALLY_PAID', 'PAID')`);
        await queryRunner.query(`ALTER TABLE "billings" ADD "payment_status" "public"."billings_payment_status_enum" NOT NULL DEFAULT 'UNPAID'`);
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "payment_date" SET DEFAULT now()`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "payments" ALTER COLUMN "payment_date" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "billings" DROP COLUMN "payment_status"`);
        await queryRunner.query(`DROP TYPE "public"."billings_payment_status_enum"`);
    }
}
