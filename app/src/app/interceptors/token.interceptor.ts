import { Injectable, Injector } from '@angular/core';
import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(private injector: Injector) {}

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        const authService = this.injector.get(AuthService);
        const token: string | null = authService.token();

        const headers: { [key: string]: string } = {
            'Content-Type': 'application/json',
        };
        if (token != null) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        request = request.clone({
            setHeaders: headers,
        });
        return next.handle(request);
    }
}
