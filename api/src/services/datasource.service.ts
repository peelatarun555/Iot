import { Datasource } from "@schemas/datasource.schema";
import {
  BadRequestException,
  NotFoundException,
} from "@utils/exceptions/restapi.exception";
import { randomBytes } from "crypto";

export class DatasourceService {
  /**
   * Get datasources from db
   * @param options
   */
  public static async getDatasources(options?: {
    pagination?: { take?: number; skip?: number };
  }): Promise<Datasource[]> {
    const datasources = await Datasource.find({
      skip: options?.pagination?.skip ?? 0,
      take: options?.pagination?.take ?? 25,
    });

    return datasources;
  }

  /**
   * Get datasource by id
   * @param id
   */
  public static async getDatasource(id: number): Promise<Datasource> {
    const datasource = await Datasource.findOneBy({
      id: id,
    });

    if (!datasource) {
      throw new NotFoundException("Datasource not found");
    }

    return datasource;
  }

  public static async getDatasourceByKey(key: string): Promise<Datasource> {
    const datasource = await Datasource.findOneBy({ token: key });

    if (!datasource) {
      throw new NotFoundGraphException("Datasource not found");
    }

    return datasource;
  }

  /**
   * Create a new datasource
   * @param name
   * @param options
   */
  public static async createDatasource(
    name: string,
    options?: {
      token?: string;
      expiresAt?: Date;
    }
  ): Promise<Datasource> {
    const datasource = await Datasource.findOneBy({ name: name });

    if (datasource)
      throw new BadRequestException("Datasource already exists");

    const datasourceNew = new Datasource();
    datasourceNew.name = name;
    datasourceNew.expiresAt =
      options?.expiresAt ??
      new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365);
    datasourceNew.token = options?.token ?? randomBytes(64).toString("hex");

    await datasourceNew.save();

    return datasourceNew;
  }

  /**
   * Update datasource
   * @param id
   * @param options
   */
  public static async updateDatasource(
    id: number,
    options?: {
      name?: string;
      token?: string;
      expiresAt?: Date;
    }
  ): Promise<Datasource> {
    const datasource = await this.getDatasource(id);

    if (options?.name) {
      if (await Datasource.findOneBy({ name: options.name }))
        throw new BadRequestGraphException(
          "Datasource with name " + options.name + " already exists"
        );
      datasource.name = options.name;
    }
    if (options?.expiresAt) datasource.expiresAt = options.expiresAt;
    if (options?.token) datasource.token = options.token;

    await datasource.save();

    return datasource;
  }

  /**
   * Delete datasource by id
   * @param id
   */
  public static async deleteDatasource(id: number): Promise<boolean> {
    //check if datasource exists
    await this.getDatasource(id);

    const result = await Datasource.delete({ id: id });

    return result.affected != null && result.affected > 0;
  }
}
