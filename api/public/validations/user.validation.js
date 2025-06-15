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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDeleteArgs = exports.UserGetPaginationInput = exports.UserGetArgs = exports.UserUpdateInput = exports.UserUpdateArgs = exports.UserLoginArgs = exports.UserSetPasswordArgs = exports.UserPasswordResetArgs = exports.UserCreateInput = exports.UserCreateArgs = void 0;
const enums_1 = require("@utils/enums");
const class_validator_1 = require("class-validator");
const type_graphql_1 = require("type-graphql");
let UserCreateArgs = class UserCreateArgs {
    email;
    firstname;
    lastname;
};
exports.UserCreateArgs = UserCreateArgs;
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(5, 64),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UserCreateArgs.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(2, 32),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], UserCreateArgs.prototype, "firstname", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(2, 32),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], UserCreateArgs.prototype, "lastname", void 0);
exports.UserCreateArgs = UserCreateArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], UserCreateArgs);
let UserCreateInput = class UserCreateInput {
    password;
    role;
    registeredAt;
};
exports.UserCreateInput = UserCreateInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(6, 32),
    (0, class_validator_1.Matches)(RegExp(/^[ A-Za-z0-9_@./#&+-]*$/)),
    __metadata("design:type", String)
], UserCreateInput.prototype, "password", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], UserCreateInput.prototype, "role", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UserCreateInput.prototype, "registeredAt", void 0);
exports.UserCreateInput = UserCreateInput = __decorate([
    (0, type_graphql_1.InputType)()
], UserCreateInput);
let UserPasswordResetArgs = class UserPasswordResetArgs {
    email;
};
exports.UserPasswordResetArgs = UserPasswordResetArgs;
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(5, 64),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UserPasswordResetArgs.prototype, "email", void 0);
exports.UserPasswordResetArgs = UserPasswordResetArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], UserPasswordResetArgs);
let UserSetPasswordArgs = class UserSetPasswordArgs {
    email;
    password;
    passwordTmp;
};
exports.UserSetPasswordArgs = UserSetPasswordArgs;
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(5, 64),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UserSetPasswordArgs.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(6, 32),
    (0, class_validator_1.Matches)(RegExp(/^[ A-Za-z0-9_@./#&+-]*$/)),
    __metadata("design:type", String)
], UserSetPasswordArgs.prototype, "password", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(6, 32),
    (0, class_validator_1.Matches)(RegExp(/^[ A-Za-z0-9_@./#&+-]*$/)),
    __metadata("design:type", String)
], UserSetPasswordArgs.prototype, "passwordTmp", void 0);
exports.UserSetPasswordArgs = UserSetPasswordArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], UserSetPasswordArgs);
let UserLoginArgs = class UserLoginArgs {
    email;
    password;
};
exports.UserLoginArgs = UserLoginArgs;
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(5, 64),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UserLoginArgs.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    (0, class_validator_1.Length)(6, 32),
    (0, class_validator_1.Matches)(RegExp(/^[ A-Za-z0-9_@./#&+-]*$/)),
    __metadata("design:type", String)
], UserLoginArgs.prototype, "password", void 0);
exports.UserLoginArgs = UserLoginArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], UserLoginArgs);
let UserUpdateArgs = class UserUpdateArgs {
    id;
};
exports.UserUpdateArgs = UserUpdateArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UserUpdateArgs.prototype, "id", void 0);
exports.UserUpdateArgs = UserUpdateArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], UserUpdateArgs);
let UserUpdateInput = class UserUpdateInput {
    email;
    firstname;
    lastname;
    password;
    role;
    registeredAt;
};
exports.UserUpdateInput = UserUpdateInput;
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(5, 64),
    (0, class_validator_1.IsEmail)(),
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    __metadata("design:type", String)
], UserUpdateInput.prototype, "email", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(2, 32),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], UserUpdateInput.prototype, "firstname", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(2, 32),
    (0, class_validator_1.IsAlphanumeric)(),
    __metadata("design:type", String)
], UserUpdateInput.prototype, "lastname", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.Length)(6, 32),
    (0, class_validator_1.Matches)(RegExp(/^[ A-Za-z0-9_@./#&+-]*$/)),
    __metadata("design:type", String)
], UserUpdateInput.prototype, "password", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsAlphanumeric)(),
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    __metadata("design:type", String)
], UserUpdateInput.prototype, "role", void 0);
__decorate([
    (0, type_graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    (0, type_graphql_1.Authorized)(enums_1.Role.admin),
    __metadata("design:type", Date)
], UserUpdateInput.prototype, "registeredAt", void 0);
exports.UserUpdateInput = UserUpdateInput = __decorate([
    (0, type_graphql_1.InputType)()
], UserUpdateInput);
let UserGetArgs = class UserGetArgs {
    id;
};
exports.UserGetArgs = UserGetArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UserGetArgs.prototype, "id", void 0);
exports.UserGetArgs = UserGetArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], UserGetArgs);
let UserGetPaginationInput = class UserGetPaginationInput {
    take = 25;
    skip = 0;
};
exports.UserGetPaginationInput = UserGetPaginationInput;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 25 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Object)
], UserGetPaginationInput.prototype, "take", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { defaultValue: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Object)
], UserGetPaginationInput.prototype, "skip", void 0);
exports.UserGetPaginationInput = UserGetPaginationInput = __decorate([
    (0, type_graphql_1.InputType)()
], UserGetPaginationInput);
let UserDeleteArgs = class UserDeleteArgs {
    id;
};
exports.UserDeleteArgs = UserDeleteArgs;
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], UserDeleteArgs.prototype, "id", void 0);
exports.UserDeleteArgs = UserDeleteArgs = __decorate([
    (0, type_graphql_1.ArgsType)()
], UserDeleteArgs);
