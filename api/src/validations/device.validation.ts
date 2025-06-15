import { DeviceStatus } from "@utils/enums";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean, // Added missing import
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max, // Added missing import
  Min, // Added missing import
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

// Removed duplicate exports at bottom
// Only keep these class declarations

export class DeviceSensorDto {
  @Length(3, 32)
  @Matches(/^[A-Za-z0-9](?:[-]?[a-z0-9]){2,}$/, {
    message: "Name must start with alphanumeric and can contain hyphens",
  })
  name!: string;

  @IsOptional()
  @Length(3, 32)
  alias?: string;

  @Length(3, 32)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: "Sensor type can only contain letters, numbers, hyphens and underscores",
  })
  sensorType!: string;
}

export class CreateDeviceDto {
  @Length(3, 64)
  @Matches(/^[A-Za-z0-9](?:[-]?[a-z0-9]){2,}$/)
  name!: string;

  @Length(3, 32)
  deviceType!: string;

  @Length(16, 16)
  devEui!: string;

  @IsEnum(DeviceStatus)
  status!: DeviceStatus;

  @IsInt()
  @Min(0) // Now has imported Min decorator
  placeId!: number;

  @IsOptional()
  @Length(0, 256)
  description?: string;

  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(16)
  @ValidateNested({ each: true })
  @Type(() => DeviceSensorDto)
  sensors?: DeviceSensorDto[];
}

export class UpdateDeviceDto {
  @IsOptional()
  @Length(3, 64)
  @Matches(/^[A-Za-z0-9](?:[-]?[a-z0-9]){2,}$/)
  name?: string;

  @IsOptional()
  @Length(3, 32)
  deviceType?: string;

  @IsOptional()
  @Length(16, 16)
  devEui?: string;

  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  placeId?: number;

  @IsOptional()
  @Length(0, 256)
  description?: string;

  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(16)
  @ValidateNested({ each: true })
  @Type(() => DeviceSensorDto)
  sensors?: DeviceSensorDto[];
}

export class DevicePaginationDto {
  @IsInt()
  @Min(1) // Now has imported Min
  @Max(50) // Now has imported Max
  @IsOptional()
  take: number = 25;

  @IsInt()
  @Min(0)
  @IsOptional()
  skip: number = 0;
}

export class DevicesOrderDto {
  @IsOptional()
  @IsString()
  orderBy: "name" | "eui" | "description" | "type" | "place" = "name";

  @IsOptional()
  @IsBoolean() // Now has imported IsBoolean
  ascending: boolean = true;
}

// Removed duplicate export block at bottom
