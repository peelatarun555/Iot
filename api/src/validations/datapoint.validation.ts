import { TimeGroupSettings } from "@utils/enums";
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxDate,
  Min,
  MinDate,
  
} from "class-validator";
import { Type } from "class-transformer";

// GET /datapoints/:sensorId/:timestamp
export class GetDatapointParams {
  @IsInt()
  sensorId!: number;

  @IsDate()
  @Type(() => Date)
  timestamp!: Date;
}

// GET /datapoints/pagination
export class DatapointPaginationDto {
  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  take: number = 500;

  @IsInt()
  @Min(0)
  @IsOptional()
  skip: number = 0;
}

// GET /datapoints/filter
export class FilterOptionsDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @MinDate(new Date("2011-01-01"))
  @MaxDate(new Date("3000-01-01"))
  from?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @MinDate(new Date("2011-01-01"))
  @MaxDate(new Date("3000-01-01"))
  to?: Date;

  @IsOptional()
  @IsEnum(TimeGroupSettings)
  timeGroupSettings: TimeGroupSettings = TimeGroupSettings.minute;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  binSize: number = 15;
}

// GET /datapoints/:sensorId
export class GetDatapointsParams {
  @IsInt()
  @Min(0)
  sensorId!: number;
}

// POST /datapoints
export class CreateDatapointDto {
  @IsDate()
  @Type(() => Date)
  @MinDate(new Date("2011-01-01"))
  @MaxDate(new Date("3000-01-01"))
  timestamp!: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsString()
  valueString?: string;

  @IsInt()
  @Min(0)
  sensorId!: number;
}

// PATCH/PUT /datapoints
export class UpdateDatapointDto {
  @IsDate()
  @Type(() => Date)
  @MinDate(new Date("2011-01-01"))
  @MaxDate(new Date("3000-01-01"))
  timestamp!: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsString()
  valueString?: string;

  @IsInt()
  @Min(0)
  sensorId!: number;
}

// DELETE /datapoints
export class DeleteDatapointParams {
  @IsDate()
  @Type(() => Date)
  @MinDate(new Date("2011-01-01"))
  @MaxDate(new Date("3000-01-01"))
  timestamp!: Date;

  @IsInt()
  @Min(0)
  sensorId!: number;
}

// DELETE /datapoints/sensor/:sensorId
export class DeleteSensorDatapointsParams {
  @IsInt()
  @Min(0)
  sensorId!: number;
}

// DELETE /datapoints/time-range
export class DeleteTimeRangeDto {
  @IsDate()
  @Type(() => Date)
  @MinDate(new Date("2011-01-01"))
  @MaxDate(new Date("3000-01-01"))
  timestampFrom!: Date;

  @IsDate()
  @Type(() => Date)
  @MinDate(new Date("2011-01-01"))
  @MaxDate(new Date("3000-01-01"))
  timestampTo!: Date;

  @IsInt()
  @Min(0)
  sensorId!: number;
}
