// user.dto.ts
import { Role } from "@utils/enums";
import {
  IsAlphanumeric,
  IsDate,
  IsEmail,
  IsInt,
  IsOptional,
  Length,
  Matches,
  Max,
  Min,
} from "class-validator";

// For POST /users
export class CreateUserDto {
  @Length(5, 64)
  @IsEmail()
  email!: string;

  @Length(2, 32)
  @IsAlphanumeric()
  firstname!: string;

  @Length(2, 32)
  @IsAlphanumeric()
  lastname!: string;

  @IsOptional()
  @Length(6, 32)
  @Matches(/^[ A-Za-z0-9_@./#&+-]*$/)
  password?: string;

  @IsOptional()
  @IsAlphanumeric()
  role?: Role;

  @IsOptional()
  @IsDate()
  registeredAt?: Date;
}

// For PUT/PATCH /users/:id
export class UpdateUserDto {
  @IsOptional()
  @Length(5, 64)
  @IsEmail()
  email?: string;

  @IsOptional()
  @Length(2, 32)
  @IsAlphanumeric()
  firstname?: string;

  @IsOptional()
  @Length(2, 32)
  @IsAlphanumeric()
  lastname?: string;

  @IsOptional()
  @Length(6, 32)
  @Matches(/^[ A-Za-z0-9_@./#&+-]*$/)
  password?: string;

  @IsOptional()
  @IsAlphanumeric()
  role?: Role;

  @IsOptional()
  @IsDate()
  registeredAt?: Date;
}

// For POST /users/password-reset
export class PasswordResetDto {
  @Length(5, 64)
  @IsEmail()
  email!: string;
}

// For POST /users/set-password
export class SetPasswordDto {
  @Length(5, 64)
  @IsEmail()
  email!: string;

  @Length(6, 32)
  @Matches(/^[ A-Za-z0-9_@./#&+-]*$/)
  password!: string;

  @Length(6, 32)
  @Matches(/^[ A-Za-z0-9_@./#&+-]*$/)
  passwordTmp!: string;
}

// For POST /auth/login
export class LoginDto {
  @Length(5, 64)
  @IsEmail()
  email!: string;

  @Length(6, 32)
  @Matches(/^[ A-Za-z0-9_@./#&+-]*$/)
  password!: string;
}

// For GET /users pagination
export class UserPaginationDto {
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  take: number = 25;

  @IsInt()
  @Min(0)
  @IsOptional()
  skip: number = 0;
}

// For DELETE /users/:id
export class DeleteUserParams {
  @IsInt()
  id!: number;
}

// For GET /users/:id
export class GetUserParams {
  @IsInt()
  @IsOptional()
  id?: number;
}
