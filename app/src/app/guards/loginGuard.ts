import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const loginGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    if (authService.token() == null) {
        return true;
    }
    inject(Router).navigate(['/']);
    return false;
};
