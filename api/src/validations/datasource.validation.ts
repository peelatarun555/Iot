import {
  IsAlphanumeric,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";

// For GET /datasources?take=...&skip=...
export class DatasourcePaginationDto {
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

// For POST /datasources
export class CreateDatasourceDto {
  @IsString()
  @Length(2, 32)
  name!: string;

  @IsDate()
  expiresAt!: Date;

  @IsOptional()
  @IsString()
  @Length(64, 128)
  @IsAlphanumeric()
  token?: string;
}

// For PATCH/PUT /datasources/:id
export class UpdateDatasourceDto {
  @IsOptional()
  @IsString()
  @Length(2, 32)
  name?: string;

  @IsOptional()
  @IsDate()
  expiresAt?: Date;

  @IsOptional()
  @IsString()
  @Length(64, 128)
  @IsAlphanumeric()
  token?: string;
}

// For DELETE /datasources/:id
export class DeleteDatasourceParams {
  @IsInt()
  id!: number;
}

// For GET /datasources/:id
export class GetDatasourceParams {
  @IsInt()
  id!: number;
}
