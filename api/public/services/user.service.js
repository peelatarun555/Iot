"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_schema_1 = __importDefault(require("@schemas/user.schema"));
const logger_1 = __importDefault(require("@tightec/logger"));
const enums_1 = require("@utils/enums");
const env_1 = require("@utils/env");
const graphql_exception_1 = require("@utils/exceptions/graphql.exception");
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const ldap_authentication_1 = require("ldap-authentication");
const email_service_1 = __importDefault(require("./email.service"));
class UserService {
    static async setUserPassword(email, passwordTmp, password) {
        const user = await user_schema_1.default.findOne({
            where: { email: email, passwordTmp: passwordTmp },
            select: { lastPasswordResetAt: true, id: true },
        });
        if (!user) {
            throw new graphql_exception_1.AuthGraphException();
        }
        if (user.lastPasswordResetAt != null &&
            new Date().getTime() - user.lastPasswordResetAt.getTime() >
                12 * 60 * 60 * 1000) {
            throw new graphql_exception_1.BadRequestGraphException("Password reset was: " +
                user.lastPasswordResetAt.toLocaleString() +
                " must be in 12h! Request a new tmpPassword.");
        }
        user.password = await this.hashPassword(password);
        user.save();
    }
    static async resetUserPassword(email) {
        const user = await user_schema_1.default.findOne({
            where: { email: email },
            select: {
                lastPasswordResetAt: true,
                id: true,
                firstname: true,
                lastname: true,
            },
        });
        if (!user) {
            throw new graphql_exception_1.NotFoundGraphException("User was not found by email");
        }
        if (user.lastPasswordResetAt != null &&
            new Date().getTime() - user.lastPasswordResetAt.getTime() < 2 * 60 * 1000) {
            throw new graphql_exception_1.BadRequestGraphException("Last password reset was: " +
                user.lastPasswordResetAt.toLocaleString() +
                " must wait 2min!");
        }
        const passwordTmp = this.generateNewTmpPassword();
        user.passwordTmp = passwordTmp;
        user.lastPasswordResetAt = new Date();
        await user.save();
        await new email_service_1.default().sendPasswordResetEmail({
            email: email,
            name: user.firstname + " " + user.lastname,
            passwordTmp: passwordTmp,
        });
    }
    static async loginUserLDAP(email, password) {
        const username = email.split("@")[0];
        let ldapUser;
        try {
            ldapUser = await (0, ldap_authentication_1.authenticate)({
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
        }
        catch (err) {
            logger_1.default.info("LDAP login error: " + err);
            return null;
        }
        if (!ldapUser) {
            return null;
        }
        const user = await user_schema_1.default.findOneBy({ email: ldapUser.mail });
        if (user != null)
            return user;
        return await this.createUser(ldapUser.mail, ldapUser.givenName, ldapUser.sn, {
            role: enums_1.Role.default,
            notSetPasswordTmp: true,
        });
        return null;
    }
    static async loginUser(email, password) {
        let user = await this.loginUserLDAP(email, password);
        if (user == null) {
            user = await user_schema_1.default.findOne({
                select: { id: true, role: true, password: true },
                where: { email: email },
            });
            if (!user || !user.password) {
                throw new graphql_exception_1.AuthGraphException();
            }
            if (!(await (0, bcryptjs_1.compare)(password, user.password))) {
                throw new graphql_exception_1.AuthGraphException();
            }
        }
        const userJwt = {
            id: user.id,
            role: user.role,
        };
        const payload = (0, jsonwebtoken_1.sign)(userJwt, env_1.env.JWT_SECRET, { algorithm: "HS256" });
        return payload;
    }
    static generateNewTmpPassword() {
        let passwortTmp = "";
        for (let i = 0; i < 8; i++) {
            passwortTmp += Math.floor(Math.random() * 10).toString();
        }
        return passwortTmp;
    }
    static hashPassword(password) {
        return new Promise((resolve, reject) => (0, bcryptjs_1.genSalt)(10, function (err, salt) {
            if (err)
                return reject(err);
            (0, bcryptjs_1.hash)(password, salt, function (err, hash) {
                if (err)
                    return reject(err);
                resolve(hash);
            });
        }));
    }
    static async createUser(email, firstname, lastname, options) {
        const user = await user_schema_1.default.findOne({
            select: { id: true },
            where: { email: email },
        });
        if (user != null) {
            throw new graphql_exception_1.BadRequestGraphException("User with email '" + email + "' already exists");
        }
        if (options.password != null) {
            options.password = await this.hashPassword(options.password);
        }
        let passwortTmp;
        if (!options.password && !options.notSetPasswordTmp) {
            passwortTmp = this.generateNewTmpPassword();
        }
        const createdUser = await user_schema_1.default.create({
            email,
            firstname,
            lastname,
            password: options.password,
            passwordTmp: passwortTmp,
            registeredAt: options.registeredAt ?? new Date(),
            role: options.role ?? enums_1.Role.default,
        }).save();
        if (passwortTmp != null) {
            await new email_service_1.default().sendCreateNewUserEmail({
                email: email,
                name: firstname + " " + lastname,
                passwordTmp: passwortTmp,
            });
        }
        return createdUser;
    }
    static async updateUser(userId, options) {
        const user = await user_schema_1.default.findOne({
            select: { id: true },
            where: { id: userId },
        });
        if (!user) {
            throw new graphql_exception_1.BadRequestGraphException("User with id '" + userId + "' does not exits");
        }
        if (options.email != null) {
            const user = await user_schema_1.default.findOne({
                select: { id: true },
                where: { email: options.email },
            });
            if (user != null) {
                throw new graphql_exception_1.BadRequestGraphException("Can not change user email: already exists");
            }
        }
        const updatedUserResult = await user_schema_1.default.update({ id: userId }, options);
        return updatedUserResult.affected == 1;
    }
    static async getUser(userId) {
        const user = await user_schema_1.default.findOneBy({
            id: userId,
        });
        if (!user) {
            throw new graphql_exception_1.NotFoundGraphException("User with id '" + userId + "' not found");
        }
        return user;
    }
    static async getUserByEmail(email) {
        const user = await user_schema_1.default.findOneBy({
            email: email,
        });
        if (!user) {
            throw new graphql_exception_1.NotFoundGraphException("User with email '" + email + "' not found");
        }
        return user;
    }
    static async getUsers(options) {
        if (options?.placeId == null)
            return user_schema_1.default.find({
                skip: options?.pagination?.skip ?? 0,
                take: options?.pagination?.take ?? 25,
            });
        return user_schema_1.default.find({
            skip: options?.pagination?.skip ?? 0,
            take: options?.pagination?.take ?? 25,
            where: { placeAccess: { place: { id: options.placeId } } },
        });
    }
    static async deleteUser(userId) {
        const deleteUserResult = await user_schema_1.default.delete({ id: userId });
        return deleteUserResult.affected == 1;
    }
    static hasUserAccessToId(userId, targetUserId, role) {
        if (role == enums_1.Role.admin) {
            return true;
        }
        return userId == targetUserId;
    }
}
exports.UserService = UserService;
