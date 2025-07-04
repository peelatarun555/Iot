import { Injectable } from '@angular/core';

const ls = localStorage;

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
    constructor() {}

    public getValue<T>(key: string): any {
        return ls.getItem(key) as T;
    }

    public get<T>(key: string): any {
        return JSON.parse(ls.getItem(key) ?? '{}') as T;
    }

    public getList<T>(key: string) {
        const before = ls.getItem(key);
        return before ? (JSON.parse(before) as T[]) : [];
    }

    public set(key: string, value: any): void {
        if (!value && value === undefined) {
            return;
        }
        const arr = JSON.stringify(value);
        ls.setItem(key, arr);
    }

    public clearAll(): void {
        ls.clear();
    }

    public remove(key: string): void {
        ls.removeItem(key);
    }
}
