import { User } from "@schemas/user.schema";
import Logger from "@tightec/logger";
import { Role } from "@utils/enums";
import { env } from "@utils/env";
import {
  AuthException,
  BadRequestException,
  NotFoundException,
} from "@utils/exceptions/restapi.exception";
import { ContextUser } from "@utils/interfaces/context.interface";
import { compare, genSalt, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { authenticate } from "ldap-authentication";
import EmailService from "./email.service";

export class UserService {
  /**
   * Set new user password
   * @param email
   * @param passwordTmp
   * @param password
   */
  public static async setUserPassword(
    email: string,
    passwordTmp: string,
    password: string
  ): Promise<void> {
        const user = await User.findOne({
      where: { 
        email: email, 
        temporaryPassword: passwordTmp // Changed from passwordTmp
      },
      select: { lastPasswordResetAt: true, id: true },
    });

    if (!user) {
      throw new AuthException();
    }

    if (
      user.lastPasswordResetAt != null &&
      new Date().getTime() - user.lastPasswordResetAt.getTime() >
        12 * 60 * 60 * 1000
    ) {
      throw new BadRequestException(
        "Password reset was: " +
          user.lastPasswordResetAt.toLocaleString() +
          " must be in 12h! Request a new tmpPassword."
      );
    }

    user.password = await this.hashPassword(password);
    user.save();
  }

  /**
   * Request a new password via email
   * @param email
   */
  public static async resetUserPassword(email: string): Promise<void> {
   const user = await User.findOne({
  where: { email: email },
  select: {
    lastPasswordResetAt: true,
    id: true,
    firstName: true, // Changed from firstname
    lastName: true,  // Changed from lastname
  },
});

    if (!user) {
      throw new NotFoundException("User was not found by email");
    }

    if (
      user.lastPasswordResetAt != null &&
      new Date().getTime() - user.lastPasswordResetAt.getTime() < 2 * 60 * 1000
    ) {
      throw new BadRequestException(
        "Last password reset was: " +
          user.lastPasswordResetAt.toLocaleString() +
          " must wait 2min!"
      );
    }

    const passwordTmp = this.generateNewTmpPassword();

    user.temporaryPassword = passwordTmp;
    user.lastPasswordResetAt = new Date();

    await user.save();

    await new EmailService().sendPasswordResetEmail({
      email: email,
     name: user.firstName + " " + user.lastName,
      passwordTmp: passwordTmp,
    });
  }

  /**
   * Login with LDAP
   * @param email
   * @param password
   * @returns User
   */
  public static async loginUserLDAP(
    email: string,
    password: string
  ): Promise<User | null> {
    const username = email.split("@")[0];
    let ldapUser;

    try {
      ldapUser = await authenticate({
        ldapOpts: {
          url: "ldap://ldap.uni-koblenz.de",
        },
        userDn: `uid=${username},ou=people,dc=Uni-Koblenz,dc=de`,
        userSearchBase: "dc=Uni-Koblenz,dc=de",
        username: username,
        usernameAttribute: "uid",
        userPassword: password,
        starttls: true,
        attributes: ["mail", "sn", "givenName"],
      });
    } catch (err) {
      Logger.info("LDAP login error: " + err);
      return null;
    }

    if (!ldapUser) {
      return null;
    }

    const user = await User.findOneBy({ email: ldapUser.mail });

    if (user != null) return user;

   return await this.createUser(
  ldapUser.mail,
  ldapUser.givenName, // First name from LDAP
  ldapUser.sn,        // Last name from LDAP
  {
    role: Role.Default,
    notSetPasswordTmp: true,
  }
);
  }
  /**
   * Login user and return a jwt token
   * @param email
   * @param password
   * @returns jwtToken
   */
  public static async loginUser(
    email: string,
    password: string
  ): Promise<string> {
    let user = await this.loginUserLDAP(email, password);

    if (user == null) {
      //find user in db
      user = await User.findOne({
        select: { id: true, role: true, password: true },
        where: { email: email },
      });

      if (!user || !user.password) {
        throw new AuthException();
      }

      //compare hashed password
      if (!(await compare(password, user.password))) {
        throw new AuthException();
      }
    }

    const userJwt: ContextUser = {
      id: user.id,
      role: user.role,
    };

    const payload = sign(userJwt, env.JWT_SECRET, { algorithm: "HS256" });
    return payload;
  }

  /**
   * Generate new tmp password
   * @returns string
   */
  public static generateNewTmpPassword(): string {
    let passwortTmp = "";
    for (let i = 0; i < 8; i++) {
      passwortTmp += Math.floor(Math.random() * 10).toString();
    }

    return passwortTmp;
  }

  /**
   * Generate a password hash
   * @param password
   * @returns string
   */
  public static hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) =>
      genSalt(10, function (err, salt) {
        if (err) return reject(err);
        hash(password, salt, function (err, hash) {
          if (err) return reject(err);
          resolve(hash);
        });
      })
    );
  }

  /**
   * Create a new user
   * @param email
   * @param name
   * @param options
   * @returns User
   */
  public static async createUser(
  email: string,
  firstName: string, // Changed parameter name to camelCase
  lastName: string,  // Changed parameter name to camelCase
  options: {
    role?: Role;
    registeredAt?: Date;
    password?: string;
    notSetPasswordTmp?: boolean;
  }
): Promise<User> {
  // Find user in db
  const user = await User.findOne({
    select: { id: true },
    where: { email: email },
  });

  if (user != null) {
    throw new BadRequestException(
      "User with email '" + email + "' already exists"
    );
  }

  // Hash password if given
  if (options.password != null) {
    options.password = await this.hashPassword(options.password);
  }

  // Generate tmp password if necessary
  let passwordTmp: string | undefined; // Fixed variable name spelling
  if (!options.password && !options.notSetPasswordTmp) {
    passwordTmp = this.generateNewTmpPassword();
  }

  const createdUser = await User.create({
    email,
    firstName: firstName,    // Match parameter name
    lastName: lastName,      // Match parameter name
    password: options.password,
    temporaryPassword: passwordTmp,  // Correct variable name
    registeredAt: options.registeredAt ?? new Date(),
    role: options.role ?? Role.Default,
  }).save();

  // Send welcome email to user
  if (passwordTmp != null) {
    await new EmailService().sendCreateNewUserEmail({
      email: email,
      name: firstName + " " + lastName,  // Use correct parameter names
      passwordTmp: passwordTmp,
    });
  }

  return createdUser;
}


  /**
   * Update user
   * @param options
   * @returns User
   */
  public static async updateUser(
    userId: number,
    options: {
      email?: string;
      firstname?: string;
      lastname?: string;
      password?: string;
      role?: Role;
      registeredAt?: Date;
    }
  ): Promise<boolean> {
    //find user in db
    const user = await User.findOne({
      select: { id: true },
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException(
        "User with id '" + userId + "' does not exits"
      );
    }

    //check for unique email
    if (options.email != null) {
      //find user in db by email
      const user = await User.findOne({
        select: { id: true },
        where: { email: options.email },
      });

      if (user != null) {
        throw new BadRequestException(
          "Can not change user email: already exists"
        );
      }
    }

    const updatedUserResult = await User.update({ id: userId }, options);

    return updatedUserResult.affected == 1;
  }

  /**
   * Get user by id
   * @param userId
   * @returns User
   */
  public static async getUser(userId: number): Promise<User> {
    //find user in db
    const user = await User.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new NotFoundException(
        "User with id '" + userId + "' not found"
      );
    }

    return user;
  }

  /**
   * Get user by id
   * @param userId
   * @returns User
   */
  public static async getUserByEmail(email: string): Promise<User> {
    //find user in db
    const user = await User.findOneBy({
      email: email,
    });

    if (!user) {
      throw new NotFoundException(
        "User with email '" + email + "' not found"
      );
    }

    return user;
  }

  /**
   * Get users
   * @param options
   * @returns users
   */
  public static async getUsers(options?: {
    pagination?: { skip?: number; take?: number };
    placeId?: number;
  }): Promise<User[]> {
    if (options?.placeId == null)
      return User.find({
        skip: options?.pagination?.skip ?? 0,
        take: options?.pagination?.take ?? 25,
      });

    return User.find({
  skip: options?.pagination?.skip ?? 0,
  take: options?.pagination?.take ?? 25,
  where: { placeAccesses: { place: { id: options.placeId } } }, // Changed to placeAccesses
});
  }
  /**
   * Delete user by id
   * @param userId
   * @returns success
   */
  public static async deleteUser(userId: number): Promise<boolean> {
    const deleteUserResult = await User.delete({ id: userId });

    return deleteUserResult.affected == 1;
  }

  /**
   * Check if user has access to target userId
   * @param userId
   * @param targetUserId
   * @param role
   * @returns userHasAccess
   */
  public static hasUserAccessToId(
    userId: number,
    targetUserId: number,
    role: Role
  ): boolean {
    if (role == Role.Admin) {
      return true;
    }

    return userId == targetUserId;
  }
}
