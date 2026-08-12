/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddCreatedByUpdatedByToAppointments1786353890681 {
    name = 'AddCreatedByUpdatedByToAppointments1786353890681'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "created_by" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "updated_by" uuid`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_d7ca5e722b384f282042d92f4c1" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_513848484c6f8b4144dda24aa2d" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_513848484c6f8b4144dda24aa2d"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_d7ca5e722b384f282042d92f4c1"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "created_by"`);
    }
}
