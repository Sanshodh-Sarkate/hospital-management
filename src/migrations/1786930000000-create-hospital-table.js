const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class CreateHospitalTable1786930000000 {
    name = 'CreateHospitalTable1786930000000'

    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "hospital" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying(150) NOT NULL,
                "code" character varying(50) NOT NULL,
                "tagline" character varying(255),
                "description" text,
                "email" character varying(100) NOT NULL,
                "phone" character varying(20) NOT NULL,
                "emergency_phone" character varying(20),
                "address" text NOT NULL,
                "city" character varying(100) NOT NULL,
                "state" character varying(100) NOT NULL,
                "country" character varying(100) NOT NULL DEFAULT 'India',
                "postal_code" character varying(20) NOT NULL,
                "website" character varying(150),
                "established_year" integer,
                "total_beds" integer DEFAULT 250,
                "operating_hours" character varying(100) DEFAULT '24/7 Emergency & OPD Services',
                "logo_url" character varying(255),
                CONSTRAINT "UQ_hospital_code" UNIQUE ("code"),
                CONSTRAINT "PK_hospital_id" PRIMARY KEY ("id")
            )
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "hospital"`);
    }
}
