// src/app/services/sensor.service.ts

import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import {api } from '../../restapi/axios'; // adjust path if needed
import { Sensor, SensorType } from '../../models/sensor';
import { AdminSensorsDto, ISensorsRequest } from '../../models/admin';

@Injectable({
    providedIn: 'root',
})
export class SensorService {
    constructor() {}

    public getSensorTypes(): Observable<SensorType[]> {
        return from(api.get('/sensors/types')).pipe(map(res => res.data));
    }

    public getAdminSensors(
        requestObj: Partial<ISensorsRequest>
    ): Observable<AdminSensorsDto> {
        return from(api.post('/sensors/admin', requestObj)).pipe(map(res => res.data));
    }

    public searchSensors(searchString: string): Observable<Sensor[]> {
        return from(
            api.get(`/sensors/search?query=${encodeURIComponent(searchString)}`)
        ).pipe(map(res => res.data));
    }

    public createSensor(sensor: Sensor): Observable<Sensor> {
        const sensorType = typeof sensor.sensorType === 'string'
            ? sensor.sensorType
            : sensor.sensorType.name;

        return from(
            api.post('/sensors', {
                name: sensor.name,
                sensorType,
                alias: sensor.alias,
                libraryId: sensor.libraryId,
                deviceId: sensor.device.id,
            })
        ).pipe(map(res => res.data));
    }

    public updateSensor(sensor: Sensor): Observable<Sensor> {
        const sensorType = typeof sensor.sensorType === 'string'
            ? sensor.sensorType
            : sensor.sensorType.name;

        return from(
            api.put(`/sensors/${sensor.id}`, {
                name: sensor.name,
                sensorType,
                alias: sensor.alias,
                libraryId: sensor.libraryId,
                deviceId: sensor.device.id,
            })
        ).pipe(map(res => res.data));
    }

    public removeSensor(sensorId: number): Observable<boolean> {
        return from(api.delete(`/sensors/${sensorId}`)).pipe(map(res => res.data));
    }
}
