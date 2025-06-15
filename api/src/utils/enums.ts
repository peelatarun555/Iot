import { registerEnumType } from "type-graphql";

export enum Locale {
  de = "de",
  en = "en",
}

export enum Role {
  Admin = 'Admin',
  Moderator = 'Moderator',
  User = 'User',
  Default = "Default" 
}

export enum Permission {
  Admin = 'Admin',
  Write = 'Write',
  Read = 'Read'
}


registerEnumType(Role, {
  name: "Role",
});

registerEnumType(Permission, {
  name: "Permission",
});

export enum DeviceStatus {
  development = "development",
  production = "production",
  emptyBattery = "emptyBattery",
}

registerEnumType(DeviceStatus, {
  name: "DeviceStatus",
});

export enum SensorDataType {
  number = "number",
  string = "string",
}

registerEnumType(SensorDataType, {
  name: "SensorDataType",
});

export enum TimeGroupSettings {
  year = "year",
  week = "week",
  month = "month",
  day = "day",
  hour = "hour",
  minute = "minute",
  second = "second",
}

registerEnumType(TimeGroupSettings, {
  name: "TimeGroupSettings",
});
