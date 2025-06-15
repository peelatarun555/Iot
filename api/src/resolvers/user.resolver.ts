import CurrentUser from "@middlewares/user.middleware";
import Project from "@schemas/project.schema";
import User from "@schemas/user.schema";
import { ProjectService } from "@services/project.service";
import { UserService } from "@services/user.service";
import { Role } from "@utils/enums";
import {
  BadRequestGraphException,
  ForbiddenGraphException,
} from "@utils/exceptions/restapi.exception";
import { ContextUser } from "@utils/interfaces/context.interface";
import {
  UserCreateArgs,
  UserCreateInput,
  UserDeleteArgs,
  UserGetArgs,
  UserGetPaginationInput,
  UserLoginArgs,
  UserPasswordResetArgs,
  UserSetPasswordArgs,
  UserUpdateArgs,
  UserUpdateInput,
} from "@validations/user.validation";
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

@Resolver(() => User)
export class UserResolver {
  @FieldResolver(() => [Project])
  projects(@Root() user: User): Promise<Project[]> {
    return ProjectService.getProjects({ userId: user.id });
  }

  @Mutation(() => String)
  loginUser(@Args() { email, password }: UserLoginArgs) {
    return UserService.loginUser(email, password);
  }

  @Mutation(() => String)
  async setUserPassword(
    @Args() { email, password, passwordTmp }: UserSetPasswordArgs
  ) {
    await UserService.setUserPassword(email, passwordTmp, password);

    return UserService.loginUser(email, password);
  }

  @Mutation(() => Boolean)
  async resetUserPassword(@Args() { email }: UserPasswordResetArgs) {
    await UserService.resetUserPassword(email);

    return true;
  }

  @Authorized(Role.admin)
  @Mutation(() => User)
  createUser(
    @Args() { email, firstname, lastname }: UserCreateArgs,
    @Arg("options", { nullable: true }) options?: UserCreateInput
  ) {
    return UserService.createUser(email, firstname, lastname, {
      role: options?.role,
      registeredAt: options?.registeredAt,
      password: options?.password,
    });
  }

  @Authorized(Role.default)
  @Mutation(() => User)
  async updateUser(
    @Args() { id }: UserUpdateArgs,
    @CurrentUser() user: ContextUser,
    @Arg("options", { nullable: true }) options: UserUpdateInput
  ) {
    //check if user updates self or is admin
    if (id != user.id && user.role != Role.admin) {
      throw new ForbiddenGraphException();
    }

    if (options != null && Object.entries(options).length > 0)
      await UserService.updateUser(id, options);

    return UserService.getUser(id);
  }

  @Authorized(Role.default)
  @Query(() => User)
  user(@Args() { id }: UserGetArgs, @CurrentUser() user: ContextUser) {
    if (id != null && !UserService.hasUserAccessToId(user.id, id, user.role)) {
      throw new ForbiddenGraphException("No access to user with id " + id);
    }

    return UserService.getUser(id ?? user.id);
  }

  @Authorized(Role.admin)
  @Query(() => [User])
  users(
    @Arg("pagination", { nullable: true }) pagination?: UserGetPaginationInput
  ) {
    return UserService.getUsers({ pagination: pagination });
  }

  @Authorized(Role.admin)
  @Mutation(() => Boolean)
  async deleteUser(
    @Args() { id }: UserDeleteArgs,
    @CurrentUser() user: ContextUser
  ) {
    if (id == user.id) {
      throw new BadRequestGraphException("Can not delete self");
    }

    await UserService.getUser(id);

    return UserService.deleteUser(id);
  }
}
