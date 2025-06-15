import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

export enum AppBreakpoints {
    MobileS = '480px',
    Mobile = '600px',
    Tablet = '720px',
    DesktopS = '960px',
    Desktop = '1280px',
    DesktopL = '1920px',
}

@Injectable({ providedIn: 'root' })
export class BreakpointWatcherService {
    constructor(private _breakpointObserver: BreakpointObserver) {}

    getScreenBreakpoints(breakpoints: AppBreakpoints | AppBreakpoints[]) {
        if (!Array.isArray(breakpoints)) breakpoints = [breakpoints];
        return breakpoints.map((breakpoint) => `(min-width: ${breakpoint})`);
    }

    observe(
        breakpoints: AppBreakpoints | AppBreakpoints[]
    ): Observable<BreakpointState> {
        return this._breakpointObserver
            .observe(this.getScreenBreakpoints(breakpoints))
            .pipe(takeUntilDestroyed());
    }
}
