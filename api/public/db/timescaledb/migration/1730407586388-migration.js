"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1730407586388 = void 0;
class Migration1730407586388 {
    name = "Migration1730407586388";
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "datapoints" (
                "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
                "value" double precision,
                "value_string" text,
                "sensor_id" integer NOT NULL,
                CONSTRAINT "PK_6b8b242509cbef8ae5519973967" PRIMARY KEY ("timestamp", "sensor_id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_6b8b242509cbef8ae551997396" ON "datapoints" ("sensor_id", "timestamp")
        `);
        await queryRunner.query(`
            SELECT create_hypertable('datapoints', by_range('timestamp'), CREATE_DEFAULT_INDEXES => false);
        `);
        await queryRunner.query(`
            SELECT add_dimension('datapoints', by_hash('sensor_id', 4));
        `);
        await queryRunner.query(`
            CREATE TABLE "datasources" (
                "id" SERIAL NOT NULL,
                "name" character varying(32) NOT NULL,
                "token" character varying(128) NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                CONSTRAINT "UQ_caf73075cb3846144946ee66c69" UNIQUE ("name"),
                CONSTRAINT "UQ_03d07ee0d239750f9db05183c7c" UNIQUE ("token"),
                CONSTRAINT "PK_58956946c51ef1259c83ac28afa" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "locations" (
                "id" SERIAL NOT NULL,
                "latitude" integer NOT NULL,
                "longitude" integer NOT NULL,
                "altitude" integer,
                CONSTRAINT "PK_7cc1c9e3853b94816c094825e74" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."sensor_types_type_enum" AS ENUM('number', 'string')
        `);
        await queryRunner.query(`
            CREATE TABLE "sensor_types" (
                "id" SERIAL NOT NULL,
                "name" character varying(32) NOT NULL,
                "type" "public"."sensor_types_type_enum" NOT NULL DEFAULT 'number',
                CONSTRAINT "UQ_e6683424ba038c8ad80470bb42d" UNIQUE ("name"),
                CONSTRAINT "PK_063d1815fd04605c2b2ca1a0189" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "sensors" (
                "id" SERIAL NOT NULL,
                "name" character varying(32) NOT NULL,
                "alias" character varying(32),
                "sensor_type_id" integer NOT NULL,
                "device_id" integer NOT NULL,
                "deleted_at" TIMESTAMP,
                "library_id" character varying(32),
                CONSTRAINT "PK_b8bd5fcfd700e39e96bcd9ba6b7" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_b8bd5fcfd700e39e96bcd9ba6b" ON "sensors" ("id")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_ad20927c73008343dd3b9c119e" ON "sensors" ("library_id")
            WHERE library_id IS NOT NULL
        `);
        await queryRunner.query(`
            CREATE TABLE "projects" (
                "id" SERIAL NOT NULL,
                "name" character varying(32) NOT NULL,
                CONSTRAINT "UQ_2187088ab5ef2a918473cb99007" UNIQUE ("name"),
                CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."project_access_permission_enum" AS ENUM('read', 'write', 'admin')
        `);
        await queryRunner.query(`
            CREATE TABLE "project_access" (
                "id" SERIAL NOT NULL,
                "permission" "public"."project_access_permission_enum" NOT NULL DEFAULT 'read',
                "user_id" integer NOT NULL,
                "project_id" integer NOT NULL,
                CONSTRAINT "PK_2599211353b56186daa70f9808a" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_4289c9dfeb4306af2e2e8edaac" ON "project_access" ("project_id", "user_id")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'moderator', 'default')
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "firstname" character varying(32) NOT NULL,
                "lastname" character varying(32) NOT NULL,
                "email" character varying(64) NOT NULL,
                "password" character varying(72),
                "password_tmp" character varying(16),
                "last_password_reset_at" TIMESTAMP WITH TIME ZONE,
                "registered_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "role" "public"."users_role_enum" NOT NULL DEFAULT 'default',
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email")
        `);
        await queryRunner.query(`
            CREATE TABLE "places" (
                "id" SERIAL NOT NULL,
                "name" character varying(64) NOT NULL,
                "parent_id" integer,
                "open_access" boolean NOT NULL DEFAULT false,
                CONSTRAINT "UQ_d93026712ed97941ccec28f8137" UNIQUE ("name"),
                CONSTRAINT "PK_1afab86e226b4c3bc9a74465c12" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_1afab86e226b4c3bc9a74465c1" ON "places" ("id")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_d93026712ed97941ccec28f813" ON "places" ("name")
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."place_access_permission_enum" AS ENUM('read', 'write', 'admin')
        `);
        await queryRunner.query(`
            CREATE TABLE "place_access" (
                "id" SERIAL NOT NULL,
                "permission" "public"."place_access_permission_enum" NOT NULL DEFAULT 'read',
                "user_id" integer NOT NULL,
                "place_id" integer NOT NULL,
                CONSTRAINT "PK_29cf6c1547c59a7e5bcfd9f4f1e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_72c56d614de59e4ae1aa5d6148" ON "place_access" ("user_id", "place_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "device_types" (
                "id" SERIAL NOT NULL,
                "name" character varying(32) NOT NULL,
                CONSTRAINT "UQ_755591f9e972996061e1e90eb38" UNIQUE ("name"),
                CONSTRAINT "PK_c22e8985afe8ffe3ee485e41af8" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."devices_status_enum" AS ENUM('development', 'production', 'emptyBattery')
        `);
        await queryRunner.query(`
            CREATE TABLE "devices" (
                "id" SERIAL NOT NULL,
                "name" character varying(32) NOT NULL,
                "dev_eui" character varying(32) NOT NULL,
                "description" character varying(256),
                "status" "public"."devices_status_enum" NOT NULL,
                "created_at" TIMESTAMP NOT NULL,
                "deleted_at" TIMESTAMP,
                "device_type_id" integer NOT NULL,
                "place_id" integer NOT NULL,
                "location_id" integer,
                CONSTRAINT "UQ_5948d630c066b025210eb6d32a2" UNIQUE ("dev_eui"),
                CONSTRAINT "REL_3339609cb36cca36db0119e70e" UNIQUE ("location_id"),
                CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_b1514758245c12daf43486dd1f" ON "devices" ("id")
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_5948d630c066b025210eb6d32a" ON "devices" ("dev_eui")
        `);
        await queryRunner.query(`
            CREATE TABLE "project_sensors" (
                "project_id" integer NOT NULL,
                "sensor_id" integer NOT NULL,
                CONSTRAINT "PK_b5f314c7304c932f77f17d4069a" PRIMARY KEY ("project_id", "sensor_id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_583ffaef1275e37b9c55e8232f" ON "project_sensors" ("project_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3c90966cd811abc8f8212fb805" ON "project_sensors" ("sensor_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "sensors"
            ADD CONSTRAINT "FK_b3e4627155abe56be7afa23b361" FOREIGN KEY ("sensor_type_id") REFERENCES "sensor_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "sensors"
            ADD CONSTRAINT "FK_09256ffd8e60978aee88e684ffe" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "project_access"
            ADD CONSTRAINT "FK_8403386a40900550af298f91d5c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "project_access"
            ADD CONSTRAINT "FK_5b2fe463e0d98585db0bb59b4a8" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "places"
            ADD CONSTRAINT "FK_0b809a6495e707a9ad218a6bba7" FOREIGN KEY ("parent_id") REFERENCES "places"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "place_access"
            ADD CONSTRAINT "FK_79a67f182106d2f067f976c53ee" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "place_access"
            ADD CONSTRAINT "FK_1e217c8f2c5df1ed8f96c7ff51f" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "devices"
            ADD CONSTRAINT "FK_473c90a9cf5f18226886e62a3b3" FOREIGN KEY ("device_type_id") REFERENCES "device_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "devices"
            ADD CONSTRAINT "FK_38a779e92e4fc3d5376f438e926" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "devices"
            ADD CONSTRAINT "FK_3339609cb36cca36db0119e70e4" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "project_sensors"
            ADD CONSTRAINT "FK_583ffaef1275e37b9c55e8232fa" FOREIGN KEY ("project_id") REFERENCES "sensors"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "project_sensors"
            ADD CONSTRAINT "FK_3c90966cd811abc8f8212fb805c" FOREIGN KEY ("sensor_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "project_sensors" DROP CONSTRAINT "FK_3c90966cd811abc8f8212fb805c"
        `);
        await queryRunner.query(`
            ALTER TABLE "project_sensors" DROP CONSTRAINT "FK_583ffaef1275e37b9c55e8232fa"
        `);
        await queryRunner.query(`
            ALTER TABLE "devices" DROP CONSTRAINT "FK_3339609cb36cca36db0119e70e4"
        `);
        await queryRunner.query(`
            ALTER TABLE "devices" DROP CONSTRAINT "FK_38a779e92e4fc3d5376f438e926"
        `);
        await queryRunner.query(`
            ALTER TABLE "devices" DROP CONSTRAINT "FK_473c90a9cf5f18226886e62a3b3"
        `);
        await queryRunner.query(`
            ALTER TABLE "place_access" DROP CONSTRAINT "FK_1e217c8f2c5df1ed8f96c7ff51f"
        `);
        await queryRunner.query(`
            ALTER TABLE "place_access" DROP CONSTRAINT "FK_79a67f182106d2f067f976c53ee"
        `);
        await queryRunner.query(`
            ALTER TABLE "places" DROP CONSTRAINT "FK_0b809a6495e707a9ad218a6bba7"
        `);
        await queryRunner.query(`
            ALTER TABLE "project_access" DROP CONSTRAINT "FK_5b2fe463e0d98585db0bb59b4a8"
        `);
        await queryRunner.query(`
            ALTER TABLE "project_access" DROP CONSTRAINT "FK_8403386a40900550af298f91d5c"
        `);
        await queryRunner.query(`
            ALTER TABLE "sensors" DROP CONSTRAINT "FK_09256ffd8e60978aee88e684ffe"
        `);
        await queryRunner.query(`
            ALTER TABLE "sensors" DROP CONSTRAINT "FK_b3e4627155abe56be7afa23b361"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_3c90966cd811abc8f8212fb805"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_583ffaef1275e37b9c55e8232f"
        `);
        await queryRunner.query(`
            DROP TABLE "project_sensors"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5948d630c066b025210eb6d32a"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b1514758245c12daf43486dd1f"
        `);
        await queryRunner.query(`
            DROP TABLE "devices"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."devices_status_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "device_types"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_72c56d614de59e4ae1aa5d6148"
        `);
        await queryRunner.query(`
            DROP TABLE "place_access"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."place_access_permission_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_d93026712ed97941ccec28f813"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_1afab86e226b4c3bc9a74465c1"
        `);
        await queryRunner.query(`
            DROP TABLE "places"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."users_role_enum"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4289c9dfeb4306af2e2e8edaac"
        `);
        await queryRunner.query(`
            DROP TABLE "project_access"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."project_access_permission_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "projects"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ad20927c73008343dd3b9c119e"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b8bd5fcfd700e39e96bcd9ba6b"
        `);
        await queryRunner.query(`
            DROP TABLE "sensors"
        `);
        await queryRunner.query(`
            DROP TABLE "sensor_types"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."sensor_types_type_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "locations"
        `);
        await queryRunner.query(`
            DROP TABLE "datasources"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_6b8b242509cbef8ae551997396"
        `);
        await queryRunner.query(`
            DROP TABLE "datapoints"
        `);
    }
}
exports.Migration1730407586388 = Migration1730407586388;
