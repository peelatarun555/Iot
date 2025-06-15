// src/app/services/place.service.ts

import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import {api} from '../../restapi/axios'; // ✅ Adjust this path if needed
import { Place } from '../../models/place';
import { AdminPlacesDto, IPlacesRequest } from '../../models/admin';

@Injectable({
    providedIn: 'root',
})
export class PlaceService {
    constructor() {}

    public getAdminPlaces(requestObj: Partial<IPlacesRequest>): Observable<AdminPlacesDto> {
        return from(
            api.post('/places/admin', requestObj)
        ).pipe(map((res) => res.data));
    }

    public searchPlaces(searchString: string): Observable<Place[]> {
        return from(
            api.get(`/places/search?query=${encodeURIComponent(searchString)}`)
        ).pipe(map((res) => res.data));
    }

    public createPlace(place: Place): Observable<Place> {
        return from(
            api.post('/places', {
                name: place.name,
                parentId: place.parentId,
            })
        ).pipe(map((res) => res.data));
    }

    public updatePlace(place: Place): Observable<Place> {
        return from(
            api.put(`/places/${place.id}`, {
                name: place.name,
                parentId: place.parentId,
            })
        ).pipe(map((res) => res.data));
    }

    public removePlace(placeId: number): Observable<boolean> {
        return from(
            api.delete(`/places/${placeId}`)
        ).pipe(map((res) => res.data));
    }
}
