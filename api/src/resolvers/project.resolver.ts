import { hasRoleAccess } from "@middlewares/auth.middleware";
import CurrentUser from "@middlewares/user.middleware";
import Project from "@schemas/project.schema";
import Sensor from "@schemas/sensor.schema";
import { ProjectUser } from "@schemas/user.schema";
import { ProjectService } from "@services/project.service";
import { Permission, Role } from "@utils/enums";
import { ContextUser } from "@utils/interfaces/context.interface";
import {
  ProjectCreateArgs,
  ProjectCreateInput,
  ProjectDeleteArgs,
  ProjectGetArgs,
  ProjectGetPaginationInput,
  ProjectUpdateArgs,
  ProjectUpdateInput,
} from "@validations/project.validation";
import {
  Arg,
  Args,
  Authorized,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";

@Resolver(() => Project)
export class ProjectResolver {
  @FieldResolver(() => [Sensor])
  sensors(@Root() project: Project): Promise<Sensor[]> {
    return ProjectService.getSensors(project.id);
  }

  @Authorized(Role.admin)
  @FieldResolver(() => [ProjectUser])
  users(
    @Root() project: Project,
    @CurrentUser() user: ContextUser
  ): Promise<ProjectUser[]> {
    return ProjectService.getUsers(project, {
      userId: user.role != Role.admin ? user.id : undefined,
    });
  }

  @Authorized(Role.default)
  @Query(() => [Project])
  projects(
    @CurrentUser() user: ContextUser,
    @Arg("pagination", { nullable: true })
    pagination?: ProjectGetPaginationInput
  ): Promise<Project[]> {
    return ProjectService.getProjects({
      pagination: pagination,
      userId: user.role != Role.admin ? user.id : undefined,
    });
  }

  @Authorized(Role.default)
  @Query(() => Project)
  async project(
    @Args() { id }: ProjectGetArgs,
    @CurrentUser() user: ContextUser
  ): Promise<Project> {
    //check user access for project
    if (!hasRoleAccess(user.role, Role.admin)) {
      await ProjectService.checkUserPermission(id, user.id, Permission.read);
    }

    return ProjectService.getProject(id);
  }

  @Authorized(Role.moderator)
  @Mutation(() => Project)
  createProject(
    @Args() { name }: ProjectCreateArgs,
    @Arg("options", { nullable: true }) options?: ProjectCreateInput
  ): Promise<Project> {
    return ProjectService.createProject(name, options);
  }

  @Authorized(Role.default)
  @Mutation(() => Project)
  async updateProject(
    @Args() { id }: ProjectUpdateArgs,
    @CurrentUser() user: ContextUser,
    @Arg("options") options: ProjectUpdateInput
  ): Promise<Project> {
    //check user access for project

    if (!hasRoleAccess(user.role, Role.admin)) {
      await ProjectService.checkUserPermission(id, user.id, Permission.admin);
    }

    return ProjectService.updateProject(id, options);
  }

  @Authorized(Role.default)
  @Mutation(() => Boolean)
  async deleteProject(
    @Args() { id }: ProjectDeleteArgs,
    @CurrentUser() user: ContextUser
  ): Promise<boolean> {
    //check user access for project
    if (!hasRoleAccess(user.role, Role.admin)) {
      await ProjectService.checkUserPermission(id, user.id, Permission.admin);
    }

    return ProjectService.deleteProject(id);
  }
}
