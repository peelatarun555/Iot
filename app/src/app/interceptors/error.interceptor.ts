import { Injectable } from '@angular/core';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private router: Router) {}
    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMsg = '';
                if (
                    error instanceof HttpErrorResponse &&
                    error.status === 401
                ) {
                    localStorage.removeItem('x-access-token');
                    this.router.navigateByUrl('/log-in');
                } else if (
                    error instanceof HttpErrorResponse &&
                    error.status === 403
                ) {
                    errorMsg =
                        'Access denied. Please contact your system administrator.';
                } else if (error.error instanceof ErrorEvent) {
                    console.log('This is client side error');
                    errorMsg = `Error: ${error.error.message}`;
                } else {
                    console.log('This is server side error');
                    errorMsg = `Error Code: ${error.status},  Message: ${error.message}`;
                }
                return throwError(() => new Error(errorMsg));
            })
        );
    }
}
