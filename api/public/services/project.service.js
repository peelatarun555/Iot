"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const auth_middleware_1 = require("@middlewares/auth.middleware");
const project_schema_1 = __importStar(require("@schemas/project.schema"));
const sensor_schema_1 = __importDefault(require("@schemas/sensor.schema"));
const user_schema_1 = __importStar(require("@schemas/user.schema"));
const enums_1 = require("@utils/enums");
const graphql_exception_1 = require("@utils/exceptions/graphql.exception");
const typeorm_1 = require("typeorm");
class ProjectService {
    static async getProjects(options) {
        if (options?.userId != null) {
            const projectAccess = await project_schema_1.ProjectAccess.find({
                where: { user: { id: options.userId } },
                select: { project: { name: true, id: true } },
                relations: { project: true },
                skip: options?.pagination?.skip ?? 0,
                take: options?.pagination?.take ?? 25,
            });
            return projectAccess.map((p) => p.project);
        }
        else {
            const projects = await project_schema_1.default.find({
                select: { name: true, id: true },
                skip: options?.pagination?.skip ?? 0,
                take: options?.pagination?.take ?? 25,
            });
            return projects;
        }
    }
    static async getSensors(projectId) {
        const project = await project_schema_1.default.findOne({
            where: { id: projectId },
            select: { sensors: true },
            relations: { sensors: true },
        });
        if (!project)
            throw new graphql_exception_1.NotFoundGraphException();
        return project?.sensors;
    }
    static async getProject(projectId) {
        const project = await project_schema_1.default.findOneBy({
            id: projectId,
        });
        if (!project) {
            throw new graphql_exception_1.NotFoundGraphException("Project with id '" + projectId + "' not found");
        }
        return project;
    }
    static async getUsers(project, options) {
        const projectAccess = await project_schema_1.ProjectAccess.find({
            where: { project: { id: project.id } },
            relations: { user: true },
        });
        const users = projectAccess.map((p) => user_schema_1.ProjectUser.fromUser(p.user, p.permission));
        if (options?.userId == null) {
            return users;
        }
        const selfUser = users.find((user) => user.id == options.userId);
        if (!selfUser ||
            !(0, auth_middleware_1.hasPermissionAccess)(selfUser.permission, enums_1.Permission.admin)) {
            throw new graphql_exception_1.ForbiddenGraphException();
        }
        return users;
    }
    static async updateProject(projectId, options) {
        const projectAccessArray = [];
        const project = await this.getProject(projectId);
        if (options.name)
            project.name = options.name;
        if (options.users && options.users.length > 0) {
            const projectAccessOld = await project_schema_1.ProjectAccess.find({
                where: { project: { id: project.id } },
                relations: { user: true },
                select: { user: { id: true } },
            });
            const users = await user_schema_1.default.find({
                where: {
                    id: (0, typeorm_1.In)(Array.from(new Set(options.users.map((u) => u.userId)).values())),
                },
                select: { id: true },
            });
            for (const user of options.users) {
                const foundUser = users.find((u) => u.id == user.userId);
                if (!foundUser) {
                    throw new graphql_exception_1.BadRequestGraphException("User with id " + user.userId + " does not exist.");
                }
                const indexOldAccess = projectAccessOld.findIndex((p) => p.user.id == foundUser.id);
                if (indexOldAccess < 0) {
                    const access = new project_schema_1.ProjectAccess();
                    access.user = foundUser;
                    access.permission = user.permission;
                    access.project = project;
                    projectAccessArray.push(access);
                }
                else {
                    if (projectAccessOld[indexOldAccess].permission != user.permission) {
                        projectAccessOld[indexOldAccess].permission = user.permission;
                        await projectAccessOld[indexOldAccess].save();
                    }
                    projectAccessOld.splice(indexOldAccess, 1);
                }
            }
            await project_schema_1.ProjectAccess.remove(projectAccessOld);
        }
        if (options.sensors && options.sensors.length > 0) {
            const sensors = await sensor_schema_1.default.find({
                where: { id: (0, typeorm_1.In)(Array.from(new Set(options.sensors).values())) },
                select: { id: true },
            });
            project.sensors = [];
            for (const sensor of options.sensors) {
                const foundSensor = sensors.find((s) => s.id == sensor);
                if (!foundSensor) {
                    throw new graphql_exception_1.BadRequestGraphException("Sensor with id " + sensor + " does not exist.");
                }
                project.sensors.push(foundSensor);
            }
        }
        await project.save();
        await project_schema_1.ProjectAccess.insert(projectAccessArray);
        return project;
    }
    static async deleteProject(projectId) {
        const result = await project_schema_1.default.delete({ id: projectId });
        if (result.affected != 1) {
            throw new graphql_exception_1.NotFoundGraphException("Can not delete project: project not found id " + projectId);
        }
        await project_schema_1.ProjectAccess.delete({ project: { id: projectId } });
        return true;
    }
    static async createProject(name, options) {
        const projectAccessArray = [];
        const project = new project_schema_1.default();
        project.name = name;
        if (options && options.users && options.users.length > 0) {
            const users = await user_schema_1.default.find({
                where: {
                    id: (0, typeorm_1.In)(Array.from(new Set(options.users.map((u) => u.userId)).values())),
                },
            });
            for (const user of options.users) {
                const foundUser = users.find((u) => u.id == user.userId);
                if (!foundUser) {
                    throw new graphql_exception_1.BadRequestGraphException("User with id " + user.userId + " does not exist.");
                }
                const access = new project_schema_1.ProjectAccess();
                access.user = foundUser;
                access.permission = user.permission;
                access.project = project;
                projectAccessArray.push(access);
            }
        }
        if (options && options.sensors && options.sensors.length > 0) {
            const sensors = await sensor_schema_1.default.find({
                where: { id: (0, typeorm_1.In)(Array.from(new Set(options.sensors).values())) },
                select: { id: true },
            });
            project.sensors = [];
            for (const sensor of options.sensors) {
                const foundSensor = sensors.find((s) => s.id == sensor);
                if (!foundSensor) {
                    throw new graphql_exception_1.BadRequestGraphException("Sensor with id " + sensor + " does not exist.");
                }
                project.sensors.push(foundSensor);
            }
        }
        await project.save();
        await project_schema_1.ProjectAccess.insert(projectAccessArray);
        return project;
    }
    static async checkUserPermission(projectId, userId, minPermission) {
        const projectAccess = await project_schema_1.ProjectAccess.findOne({
            where: { user: { id: userId }, project: { id: projectId } },
        });
        if (!projectAccess) {
            throw new graphql_exception_1.ForbiddenGraphException();
        }
        if (!(0, auth_middleware_1.hasPermissionAccess)(projectAccess.permission, minPermission)) {
            throw new graphql_exception_1.ForbiddenGraphException();
        }
    }
}
exports.ProjectService = ProjectService;
