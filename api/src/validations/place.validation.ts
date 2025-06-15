import { Permission } from "@utils/enums";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

// GET /places/pagination
export class PlacePaginationDto {
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

// GET /places/search
export class PlaceSearchDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  names?: string[];
}

// GET /places/:id
export class GetPlaceByIdParams {
  @IsInt()
  id!: number;
}

// GET /places?name=
export class GetPlaceByNameQuery {
  @IsString()
  name!: string;
}

// POST /places
export class CreatePlaceDto {
  @Length(3, 64, { message: "Name must be between 3-64 characters" })
  @Matches(/^[a-zA-Z0-9\-_ ]+$/, { 
    message: "Invalid characters. Allowed: letters, numbers, spaces, hyphens, underscores" 
  })
  name!: string;

  @IsOptional()
  @IsInt()
  parentId?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => PlaceUserDto)
  users?: PlaceUserDto[];
}

// PATCH/PUT /places/:id
export class UpdatePlaceDto {
  @IsOptional()
  @Length(3, 64, { message: "Name must be between 3-64 characters" })
  @Matches(/^[a-zA-Z0-9\-_ ]+$/, { 
    message: "Invalid characters. Allowed: letters, numbers, spaces, hyphens, underscores" 
  })
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => PlaceUserDto)
  users?: PlaceUserDto[];

  @IsOptional()
  @IsInt()
  parentId?: number | null;
}

// DELETE /places/:id
export class DeletePlaceParams {
  @IsInt()
  id!: number;
} 

// GET /places/filter
export class FilterPlaceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  parentName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  index?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(1)
  take?: number = 25;

  @IsOptional()
  @IsEnum(["name", "parent", "id"])
  orderBy?: "name" | "parent" | "id";

  @IsOptional()
  @IsBoolean()
  ascending?: boolean = true;
}

// Nested DTO for place users
export class PlaceUserDto {
  @IsInt()
  @Min(1, { message: "User ID must be a positive integer" })
  userId!: number;

  @IsEnum(Permission)
  permission!: Permission;
}
