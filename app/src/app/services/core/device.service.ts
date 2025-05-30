import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import {api} from '../../restapi/axios'; // ✅ Adjust this path
import { Device, DeviceType } from '../../models/device';
import { AdminDevicesDto, IDevicesRequest } from '../../models/admin';

@Injectable({
    providedIn: 'root',
})
export class DeviceService {
    constructor() {}

    public getDeviceTypes(): Observable<DeviceType[]> {
        return from(
            api.get('/device-types')
        ).pipe(map((res) => res.data));
    }

    public getAdminDevices(requestObj: Partial<IDevicesRequest>): Observable<AdminDevicesDto> {
        return from(
            api.post('/devices/admin', requestObj)
        ).pipe(map((res) => res.data));
    }

    public searchDevices(searchString: string): Observable<Device[]> {
        return from(
            api.get(`/devices/search?query=${encodeURIComponent(searchString)}`)
        ).pipe(map((res) => res.data));
    }

    public createDevice(device: Device): Observable<Device> {
        const deviceType = typeof device.deviceType === 'string'
            ? device.deviceType
            : device.deviceType.name;

        return from(
            api.post('/devices', {
                name: device.name,
                description: device.description,
                deviceType,
                devEui: device.devEui,
                status: device.status,
                placeId: device.place.id,
            })
        ).pipe(map((res) => res.data));
    }

    public updateDevice(device: Device): Observable<Device> {
        const deviceType = typeof device.deviceType === 'string'
            ? device.deviceType
            : device.deviceType.name;

        return from(
            api.put(`/devices/${device.id}`, {
                name: device.name,
                description: device.description,
                deviceType,
                devEui: device.devEui,
                status: device.status,
                placeId: device.place.id,
            })
        ).pipe(map((res) => res.data));
    }

    public removeDevice(deviceId: number): Observable<boolean> {
        return from(
            api.delete(`/devices/${deviceId}`)
        ).pipe(map((res) => res.data));
    }
}
