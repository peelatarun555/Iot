"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatasourceResolver = void 0;
const datasource_schema_1 = require("@schemas/datasource.schema");
const datasource_service_1 = require("@services/datasource.service");
const enums_1 = require("@utils/enums");
const datasource_validation_1 = require("@validations/datasource.validation");
const type_graphql_1 = require("type-graphql");
let DatasourceResolver = class DatasourceResolver {
    datasources(pagination) {
        return datasource_service_1.DatasourceService.getDatasources({
            pagination: pagination,
        });
    }
    createDatasource({ name }, options) {
        return datasource_service_1.DatasourceService.createDatasource(name, options);
    }
    updateDatasource({ id }, options) {
        return datasource_service_1.DatasourceService.updateDatasource(id, options);
    }
    deleteDatasource({ id }) {
        return datasource_service_1.DatasourceService.deleteDatasource(id);
    }
};
exports.DatasourceResolver = DatasourceResolver;
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    (0, type_graphql_1.Query)(() => [datasource_schema_1.Datasource]),
    __param(0, (0, type_graphql_1.Arg)("pagination", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [datasource_validation_1.DatasoruceGetPaginationInput]),
    __metadata("design:returntype", Promise)
], DatasourceResolver.prototype, "datasources", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    (0, type_graphql_1.Mutation)(() => datasource_schema_1.Datasource),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, type_graphql_1.Arg)("options", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [datasource_validation_1.DatasourceCreateArgs,
        datasource_validation_1.DatasourceCreateInput]),
    __metadata("design:returntype", Promise)
], DatasourceResolver.prototype, "createDatasource", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    (0, type_graphql_1.Mutation)(() => datasource_schema_1.Datasource),
    __param(0, (0, type_graphql_1.Args)()),
    __param(1, (0, type_graphql_1.Arg)("options", { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [datasource_validation_1.DatasourceUpdateArgs,
        datasource_validation_1.DatasourceUpdateInput]),
    __metadata("design:returntype", Promise)
], DatasourceResolver.prototype, "updateDatasource", null);
__decorate([
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Args)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [datasource_validation_1.DatasourceDeleteArgs]),
    __metadata("design:returntype", Promise)
], DatasourceResolver.prototype, "deleteDatasource", null);
exports.DatasourceResolver = DatasourceResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => datasource_schema_1.Datasource)
], DatasourceResolver);
