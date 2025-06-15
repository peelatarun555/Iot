import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Role } from '../restapi/utils/enums';

export const roleGuard = (role: Role) => {
    return () => {
        if (inject(AuthService).role() !== role) {
            inject(Router).navigate(['']);
            return false;
        }
        return true;
    };
};
