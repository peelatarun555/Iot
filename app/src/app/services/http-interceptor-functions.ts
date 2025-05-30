import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

const tokenInterceptorFn: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.token();

    const headers: { [key: string]: string } = {
        'Content-Type': 'application/json',
    };
    if (token != null) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const clonedRequest = req.clone({
        setHeaders: headers,
    });

    return next(clonedRequest);
};

const errorInterceptorFn: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMsg = '';

            if (error.status === 401) {
                localStorage.removeItem('x-access-token');
                router.navigateByUrl('/log-in');
            } else if (error.status === 403) {
                errorMsg =
                    'Access denied. Please contact your system administrator.';
            } else if (error.error instanceof ErrorEvent) {
                console.log('This is a client-side error');
                errorMsg = `Error: ${error.error.message}`;
            } else {
                console.log('This is a server-side error');
                errorMsg = `Error Code: ${error.status}, Message: ${error.message}`;
            }

            return throwError(() => new Error(errorMsg));
        })
    );
};

export { errorInterceptorFn, tokenInterceptorFn };
