/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddCreatedByAndUpdateByFieldsInPrescription1786526537100 {
    name = 'AddCreatedByAndUpdateByFieldsInPrescription1786526537100'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD "created_by" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD "updated_by" uuid`);
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD CONSTRAINT "FK_8b46fdc4a903b002fdfe30e2287" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD CONSTRAINT "FK_cc04cb0b0c7ebac24d87d8d9771" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP CONSTRAINT "FK_cc04cb0b0c7ebac24d87d8d9771"`);
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP CONSTRAINT "FK_8b46fdc4a903b002fdfe30e2287"`);
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP COLUMN "created_by"`);
    }
}
