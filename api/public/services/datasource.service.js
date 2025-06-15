"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatasourceService = void 0;
const datasource_schema_1 = require("@schemas/datasource.schema");
const graphql_exception_1 = require("@utils/exceptions/graphql.exception");
const crypto_1 = require("crypto");
class DatasourceService {
    static async getDatasources(options) {
        const datasources = await datasource_schema_1.Datasource.find({
            skip: options?.pagination?.skip ?? 0,
            take: options?.pagination?.take ?? 25,
        });
        return datasources;
    }
    static async getDatasource(id) {
        const datasource = await datasource_schema_1.Datasource.findOneBy({
            id: id,
        });
        if (!datasource) {
            throw new graphql_exception_1.NotFoundGraphException("Datasource not found");
        }
        return datasource;
    }
    static async getDatasourceByKey(key) {
        const datasource = await datasource_schema_1.Datasource.findOneBy({ token: key });
        if (!datasource) {
            throw new graphql_exception_1.NotFoundGraphException("Datasource not found");
        }
        return datasource;
    }
    static async createDatasource(name, options) {
        const datasource = await datasource_schema_1.Datasource.findOneBy({ name: name });
        if (datasource)
            throw new graphql_exception_1.BadRequestGraphException("Datasource already exists");
        const datasourceNew = new datasource_schema_1.Datasource();
        datasourceNew.name = name;
        datasourceNew.expiresAt =
            options?.expiresAt ??
                new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365);
        datasourceNew.token = options?.token ?? (0, crypto_1.randomBytes)(64).toString("hex");
        await datasourceNew.save();
        return datasourceNew;
    }
    static async updateDatasource(id, options) {
        const datasource = await this.getDatasource(id);
        if (options?.name) {
            if (await datasource_schema_1.Datasource.findOneBy({ name: options.name }))
                throw new graphql_exception_1.BadRequestGraphException("Datasource with name " + options.name + " already exists");
            datasource.name = options.name;
        }
        if (options?.expiresAt)
            datasource.expiresAt = options.expiresAt;
        if (options?.token)
            datasource.token = options.token;
        await datasource.save();
        return datasource;
    }
    static async deleteDatasource(id) {
        await this.getDatasource(id);
        const result = await datasource_schema_1.Datasource.delete({ id: id });
        return result.affected != null && result.affected > 0;
    }
}
exports.DatasourceService = DatasourceService;
