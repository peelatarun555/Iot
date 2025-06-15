/* eslint-disable @typescript-eslint/no-unused-vars */

import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1691161579171 implements MigrationInterface {
  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

/** Create hypertable and add dimension
    await queryRunner.query(`
            SELECT create_hypertable('datapoints', by_range('timestamp'), CREATE_DEFAULT_INDEXES => false);
        `);
    await queryRunner.query(`
            SELECT add_dimension('datapoints', by_hash('sensor_id', 4));
        `);
 */
