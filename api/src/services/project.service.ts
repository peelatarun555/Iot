import { hasPermissionAccess } from "@middlewares/auth.middleware";
import { ProjectAccess } from "@schemas/project.schema";
import { User } from "@schemas/user.schema";
import  Project  from "@schemas/project.schema";
import Sensor from "@schemas/sensor.schema";
import { Permission } from "@utils/enums";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@utils/exceptions/restapi.exception";
import { In } from "typeorm";

export class ProjectService {
  /**
   * Get projects from user
   * @param options
   * @returns Project[]
   */
  public static async getProjects(options?: {
    userId?: number;
    pagination?: { skip?: number; take?: number };
  }): Promise<Project[]> {
    if (options?.userId != null) {
      const projectAccess = await ProjectAccess.find({
        where: { user: { id: options.userId } },
        select: { project: { name: true, id: true } },
        relations: { project: true },
        skip: options?.pagination?.skip ?? 0,
        take: options?.pagination?.take ?? 25,
      });

      return projectAccess.map((p) => p.project);
    } else {
      const projects = await Project.find({
        select: { name: true, id: true },
        skip: options?.pagination?.skip ?? 0,
        take: options?.pagination?.take ?? 25,
      });

      return projects;
    }
  }

  /**
   * Get sensors from project
   * @param projectId
   */
  public static async getSensors(projectId: number): Promise<Sensor[]> {
    const project = await Project.findOne({
      where: { id: projectId },
      select: { sensors: true },
      relations: { sensors: true },
    });

    if (!project) throw new NotFoundException();

    return project?.sensors;
  }

  /**
   * Get project by id
   * @param projectId
   * @returns Project
   */
  public static async getProject(projectId: number): Promise<Project> {
    //find project in db
    const project = await Project.findOneBy({
      id: projectId,
    });

    if (!project) {
      throw new NotFoundException(
        "Project with id '" + projectId + "' not found"
      );
    }

    return project;
  }

  /**
   * Get users from project
   * @param project
   * @returns
   */
 public static async getUsers(
  project: Project,
  options?: { userId?: number }
): Promise<ProjectAccess[]> { // Changed return type to ProjectAccess[]
  const projectAccess = await ProjectAccess.find({
    where: { project: { id: project.id } },
    relations: { user: true },
  });

  if (options?.userId == null) return projectAccess;

  const selfUser = projectAccess.find((pa) => pa.user.id === options.userId);
  if (!selfUser || !hasPermissionAccess(selfUser.permission, Permission.Admin)) {
    throw new ForbiddenException();
  }

  return projectAccess;
}

  /**
   * Update a project
   * @param id
   * @param options
   * @returns Project
   */
  public static async updateProject(
    projectId: number,
    options: {
      name?: string;
      users?: { userId: number; permission: Permission }[];
      sensors?: number[];
    }
  ): Promise<Project> {
    const projectAccessArray: ProjectAccess[] = [];

    const project = await this.getProject(projectId);

    if (options.name) project.name = options.name;

    if (options.users && options.users.length > 0) {
      const projectAccessOld = await ProjectAccess.find({
        where: { project: { id: project.id } },
        relations: { user: true },
        select: { user: { id: true } },
      });

      const users = await User.find({
        where: {
          id: In(
            Array.from(new Set(options.users.map((u) => u.userId)).values())
          ),
        },
        select: { id: true },
      });

      for (const user of options.users) {
        const foundUser = users.find((u) => u.id == user.userId);
        if (!foundUser) {
          throw new BadRequestException(
            "User with id " + user.userId + " does not exist."
          );
        }

        const indexOldAccess = projectAccessOld.findIndex(
          (p) => p.user.id == foundUser.id
        );

        if (indexOldAccess < 0) {
          const access = new ProjectAccess();
          access.user = foundUser;
          access.permission = user.permission;
          access.project = project;
          projectAccessArray.push(access);
        } else {
          if (projectAccessOld[indexOldAccess].permission != user.permission) {
            projectAccessOld[indexOldAccess].permission = user.permission;
            await projectAccessOld[indexOldAccess].save();
          }
          projectAccessOld.splice(indexOldAccess, 1);
        }
      }

      await ProjectAccess.remove(projectAccessOld);
    }

    //check if all sensors exist in db
    if (options.sensors && options.sensors.length > 0) {
      const sensors = await Sensor.find({
        where: { id: In(Array.from(new Set(options.sensors).values())) },
        select: { id: true },
      });

      project.sensors = [];

      for (const sensor of options.sensors) {
        const foundSensor = sensors.find((s) => s.id == sensor);
        if (!foundSensor) {
          throw new BadRequestException(
            "Sensor with id " + sensor + " does not exist."
          );
        }
        project.sensors.push(foundSensor);
      }
    }

    await project.save();

    //insert project access
    await ProjectAccess.insert(projectAccessArray);

    return project;
  }

  /**
   * Delete project
   * @param projectId
   */
  public static async deleteProject(projectId: number): Promise<boolean> {
    const result = await Project.delete({ id: projectId });

    if (result.affected != 1) {
      throw new NotFoundException(
        "Can not delete project: project not found id " + projectId
      );
    }

    await ProjectAccess.delete({ project: { id: projectId } });

    return true;
  }

  /**
   * Create a new project
   * @param name
   * @param options
   * @returns Project
   */
  public static async createProject(
    name: string,
    options?: {
      users?: { userId: number; permission: Permission }[];
      sensors?: number[];
    }
  ): Promise<Project> {
    const projectAccessArray: ProjectAccess[] = [];

    const project = new Project();
    project.name = name;

    //check if all users exist in db
    if (options && options.users && options.users.length > 0) {
      const users = await User.find({
        where: {
          id: In(
            Array.from(new Set(options.users.map((u) => u.userId)).values())
          ),
        },
      });

      for (const user of options.users) {
        const foundUser = users.find((u) => u.id == user.userId);
        if (!foundUser) {
          throw new BadRequestException(
            "User with id " + user.userId + " does not exist."
          );
        }

        const access = new ProjectAccess();
        access.user = foundUser;
        access.permission = user.permission;
        access.project = project;
        projectAccessArray.push(access);
      }
    }

    //check if all sensors exist in db
    if (options && options.sensors && options.sensors.length > 0) {
      const sensors = await Sensor.find({
        where: { id: In(Array.from(new Set(options.sensors).values())) },
        select: { id: true },
      });

      project.sensors = [];

      for (const sensor of options.sensors) {
        const foundSensor = sensors.find((s) => s.id == sensor);
        if (!foundSensor) {
          throw new BadRequestException(
            "Sensor with id " + sensor + " does not exist."
          );
        }
        project.sensors.push(foundSensor);
      }
    }

    await project.save();

    //insert project access
    await ProjectAccess.insert(projectAccessArray);

    return project;
  }

  /**
   * Check if user has permissions of project
   * @param isPermission
   * @param shouldPermission
   */
  public static async checkUserPermission(
    projectId: number,
    userId: number,
    minPermission: Permission
  ): Promise<void> {
    const projectAccess = await ProjectAccess.findOne({
      where: { user: { id: userId }, project: { id: projectId } },
    });

    if (!projectAccess) {
      throw new ForbiddenException();
    }

    if (!hasPermissionAccess(projectAccess.permission, minPermission)) {
      throw new ForbiddenException();
    }
  }
}
