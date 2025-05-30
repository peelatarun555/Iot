import {
    ActivatedRouteSnapshot,
    CanActivateFn,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const authService = inject(AuthService);
    if (authService.token() == null) {
        // Set the redirectUrl to the current attempted URL
        authService.redirectUrl = state.url;
        inject(Router).navigate(['/account']);
        return false;
    }
    return true;
};
