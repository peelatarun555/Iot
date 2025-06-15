export enum Locale {
    de = 'de',
    en = 'en',
}

export enum Role {
    admin = 'admin',
    moderator = 'moderator',
    default = 'default',
}

export enum Permission {
    read = 'read',
    write = 'write',
    admin = 'admin',
}

export enum DeviceStatus {
    development = 'development',
    production = 'production',
    emptyBattery = 'emptyBattery',
}

export enum SensorDataType {
    number = 'number',
    string = 'string',
}

export enum SensorType {
    humidity = 'humidity',
    co2 = 'co2',
    temperature = 'temperature',
    activity = 'activity',
    default = 'default',
}

export enum TimeGroupSettings {
    year = 'year',
    week = 'week',
    month = 'month',
    day = 'day',
    hour = 'hour',
    minute = 'minute',
    second = 'second',
}
