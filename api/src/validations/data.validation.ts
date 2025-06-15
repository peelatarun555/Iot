import { Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

// TTN Webhook Types
export class EndDeviceIdsDto {
  @IsString()
  @IsNotEmpty()
  dev_eui!: string;  // Definite assignment assertion

  @IsString()
  @IsNotEmpty()
  device_id!: string; // Definite assignment assertion
}

export class RxMetadataDto {
  @IsNumber()
  @IsOptional()
  rssi?: number;
}

export class UplinkMessageSettingsDto {
  @IsDate()
  @Type(() => Date)
  time!: Date;  // Definite assignment assertion
}

export class UplinkMessageDto {
  @IsString()
  @IsNotEmpty()
  frm_payload!: string;  // Definite assignment assertion

  @IsObject()
  decoded_payload!: Record<string, string | number>;  // Definite assignment assertion

  @ValidateNested()
  @Type(() => UplinkMessageSettingsDto)
  settings!: UplinkMessageSettingsDto;  // Definite assignment assertion

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RxMetadataDto)
  @IsOptional()
  rx_metadata?: RxMetadataDto[];
}

export class TtnInsertDataDto {
  @ValidateNested()
  @Type(() => EndDeviceIdsDto)
  end_device_ids!: EndDeviceIdsDto;  // Definite assignment assertion

  @IsDate()
  @IsOptional()
  received_at?: Date;

  @ValidateNested()
  @Type(() => UplinkMessageDto)
  uplink_message!: UplinkMessageDto;  // Definite assignment assertion
}

// ChirpStack Webhook Types
export class DeviceInfoDto {
  @IsString()
  @IsNotEmpty()
  deviceName!: string;  // Definite assignment assertion

  @IsString()
  @IsNotEmpty()
  devEui!: string;  // Definite assignment assertion
}

export class RxInfoDto {
  @IsNumber()
  rssi!: number;  // Definite assignment assertion
}

export class ChirpInsertDataDto {
  @IsDate()
  time!: Date;  // Definite assignment assertion

  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo!: DeviceInfoDto;  // Definite assignment assertion

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RxInfoDto)
  rxInfo!: RxInfoDto[];  // Definite assignment assertion

  @IsObject()
  object!: Record<string, string | number>;  // Definite assignment assertion
}

// Interfaces for legacy compatibility
export interface IVInsertData extends TtnInsertDataDto {}
export interface IVInsertChirpUpData extends ChirpInsertDataDto {}
