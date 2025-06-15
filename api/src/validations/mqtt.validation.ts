import { IsInt, IsString, Length } from "class-validator";

export class MqttCommandDto {
  @IsInt()
  sensorId!: number;

  @IsString()
  @Length(1, 255)
  command!: string;
}
