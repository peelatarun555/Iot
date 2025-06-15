"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const datapoint_resolver_1 = require("./datapoint.resolver");
const datasource_resolver_1 = require("./datasource.resolver");
const device_resolvers_1 = require("./device.resolvers");
const place_resolver_1 = require("./place.resolver");
const project_resolver_1 = require("./project.resolver");
const sensor_resolvers_1 = require("./sensor.resolvers");
const user_resolver_1 = require("./user.resolver");
exports.resolvers = [
    user_resolver_1.UserResolver,
    project_resolver_1.ProjectResolver,
    device_resolvers_1.DeviceResolver,
    sensor_resolvers_1.SensorResolver,
    place_resolver_1.PlaceResolver,
    datasource_resolver_1.DatasourceResolver,
    datapoint_resolver_1.DatapointResolver,
];
