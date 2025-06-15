import { Permission } from "@utils/enums";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from "class-validator";

// GET /projects/:id
export class GetProjectParams {
  @IsInt()
  id!: number;
}

// POST /projects
export class CreateProjectDto {
  @Length(3, 64)
  @Matches(/^[a-zA-Z0-9](?:[- ]?[a-zA-Z0-9]){2,}$/, {
    message: "Project name must be alphanumeric with optional hyphens/spaces"
  })
  name!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ProjectUserDto)
  users?: ProjectUserDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  sensors?: number[];
}

// PATCH/PUT /projects/:id
export class UpdateProjectDto {
  @IsOptional()
  @Length(3, 64)
  @Matches(/^[a-zA-Z0-9](?:[- ]?[a-zA-Z0-9]){2,}$/)
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ProjectUserDto)
  users?: ProjectUserDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsInt({ each: true })
  sensors?: number[];
}

// DELETE /projects/:id
export class DeleteProjectParams {
  @IsInt()
  id!: number;
}

// GET /projects pagination
export class ProjectPaginationDto {
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  take?: number = 25;

  @IsInt()
  @Min(0)
  @IsOptional()
  skip?: number = 0;
}

// Nested DTO for project users
export class ProjectUserDto {
  @IsInt()
  userId!: number;

  @IsEnum(Permission)
  permission!: Permission;
}
 