import { MigrationInterface, QueryRunner } from "typeorm";

export class V1schema1733495775399 implements MigrationInterface {
    name = 'V1schema1733495775399'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "worker" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "business_id" integer, CONSTRAINT "PK_dc8175fa0e34ce7a39e4ec73b94" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customer" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "email" character varying NOT NULL, "phone" character varying(15), "business_id" integer, CONSTRAINT "UQ_fdb2f3ad8115da4c7718109a6eb" UNIQUE ("email"), CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "business" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4cca40c3813d4b88a83edb459bc" UNIQUE ("email"), CONSTRAINT "PK_0bd850da8dafab992e2e9b058e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "service" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "price" numeric(10,2) NOT NULL, "estimated_time_minutes" integer NOT NULL, "business_id" integer, CONSTRAINT "PK_85a21558c006647cd76fdce044b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "booking_service" ("id" SERIAL NOT NULL, "booking_id" integer, "service_id" integer, CONSTRAINT "PK_227cfeeee338c1e04fab754e56b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."booking_status_enum" AS ENUM('Pending', 'In Progress', 'Completed', 'Cancelled')`);
        await queryRunner.query(`CREATE TABLE "booking" ("id" SERIAL NOT NULL, "booking_date" TIMESTAMP NOT NULL, "status" "public"."booking_status_enum" NOT NULL DEFAULT 'Pending', "total_price" numeric(10,2) NOT NULL, "business_id" integer, "customer_id" integer, CONSTRAINT "PK_49171efc69702ed84c812f33540" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "booking_worker" ("id" SERIAL NOT NULL, "booking_id" integer, "worker_id" integer, CONSTRAINT "PK_37c9a0dbdef309b5f746fdcf568" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "worker" ADD CONSTRAINT "FK_83cbcf65d35013243e4c8b5b309" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer" ADD CONSTRAINT "FK_9ca98deab5f4c69b8e7f7665444" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service" ADD CONSTRAINT "FK_89f78c853cdc9cc2231d0d6e031" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_service" ADD CONSTRAINT "FK_53eb14b6a83c23dab313273e475" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_service" ADD CONSTRAINT "FK_d324e3875e33beb4660ad21936f" FOREIGN KEY ("service_id") REFERENCES "service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_74b30acee146444e632b8468f71" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_ae80346292fa587731a5d2546e6" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_worker" ADD CONSTRAINT "FK_0ee4c6be424d8898afe6ff3f340" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking_worker" ADD CONSTRAINT "FK_76532da7a4fd86e150e952a4cac" FOREIGN KEY ("worker_id") REFERENCES "worker"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking_worker" DROP CONSTRAINT "FK_76532da7a4fd86e150e952a4cac"`);
        await queryRunner.query(`ALTER TABLE "booking_worker" DROP CONSTRAINT "FK_0ee4c6be424d8898afe6ff3f340"`);
        await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_ae80346292fa587731a5d2546e6"`);
        await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_74b30acee146444e632b8468f71"`);
        await queryRunner.query(`ALTER TABLE "booking_service" DROP CONSTRAINT "FK_d324e3875e33beb4660ad21936f"`);
        await queryRunner.query(`ALTER TABLE "booking_service" DROP CONSTRAINT "FK_53eb14b6a83c23dab313273e475"`);
        await queryRunner.query(`ALTER TABLE "service" DROP CONSTRAINT "FK_89f78c853cdc9cc2231d0d6e031"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT "FK_9ca98deab5f4c69b8e7f7665444"`);
        await queryRunner.query(`ALTER TABLE "worker" DROP CONSTRAINT "FK_83cbcf65d35013243e4c8b5b309"`);
        await queryRunner.query(`DROP TABLE "booking_worker"`);
        await queryRunner.query(`DROP TABLE "booking"`);
        await queryRunner.query(`DROP TYPE "public"."booking_status_enum"`);
        await queryRunner.query(`DROP TABLE "booking_service"`);
        await queryRunner.query(`DROP TABLE "service"`);
        await queryRunner.query(`DROP TABLE "business"`);
        await queryRunner.query(`DROP TABLE "customer"`);
        await queryRunner.query(`DROP TABLE "worker"`);
    }

}
