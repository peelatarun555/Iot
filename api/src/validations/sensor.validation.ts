// src/validations/sensor.validation.ts
import { SensorDataType } from "@utils/enums";
import {
  IsAlphanumeric,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";

// API response DTO
export class SensorResponseDto {
  id!: number;
  name!: string;
  alias?: string;
  sensorType!: string;
  libraryId?: string;
  deviceId!: number;
  sensorDataType?: SensorDataType;
}

// Pagination DTO
export class SensorPaginationDto {
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

// Path param DTO
export class GetSensorParams {
  @IsInt()
  id!: number;
}

// Create DTO
export class CreateSensorDto {
  @Length(3, 32)
  @IsAlphanumeric()
  name!: string;

  @Length(3, 32)
  @IsAlphanumeric()
  sensorType!: string;

  @IsInt()
  deviceId!: number;

  @IsOptional()
  @Length(0, 32)
  @IsAlphanumeric()
  alias?: string;

  @IsOptional()
  @Length(0, 32)
  @IsAlphanumeric()
  libraryId?: string;

  @IsOptional()
  @IsEnum(SensorDataType)
  sensorDataType?: SensorDataType;
}

// Update DTO
export class UpdateSensorDto {
  @IsOptional()
  @Length(3, 32)
  @IsAlphanumeric()
  name?: string;

  @IsOptional()
  @Length(3, 32)
  @IsAlphanumeric()
  sensorType?: string;

  @IsOptional()
  @IsInt()
  deviceId?: number;

  @IsOptional()
  @Length(0, 32)
  @IsAlphanumeric()
  alias?: string;

  @IsOptional()
  @Length(0, 32)
  @IsAlphanumeric()
  libraryId?: string;

  @IsOptional()
  @IsEnum(SensorDataType)
  sensorDataType?: SensorDataType;
}

// Delete param DTO
export class DeleteSensorParams {
  @IsInt()
  id!: number;
}

// Filter DTO
export class FilterSensorDto {
  @IsOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  alias?: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  type?: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  libraryId?: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  deviceName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  index: number = 0;

  @IsOptional()
  @IsInt()
  @Min(1)
  take: number = 25;

  @IsOptional()
  @IsString()
  orderBy?: "name" | "alias" | "type" | "libraryId" | "device";

  @IsOptional()
  @IsBoolean()
  ascending: boolean = true;
}
