import {
    computed,
    effect,
    Injectable,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';
import { Router } from '@angular/router';
import { Role } from '../restapi/utils/enums'; // Updated path
import { jwtDecode } from 'jwt-decode';
import { TranslateService } from '@ngx-translate/core';
import { api } from '../restapi/axios'; // Make sure your axios instance is exported here

type AuthState = {
    token: string | null;
    loading: boolean;
    errorMsg: string | null;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly _accessTokenKey: string = 'x-access-token';
    private readonly _state: WritableSignal<AuthState>;
    private _redirectUrl: string | null = null;

    private _token: Signal<string | null>;
    private _role: Signal<Role | null>;
    private _isAuthenticated: Signal<boolean>;
    private _isLoading: Signal<boolean>;
    private _errorMsg: Signal<string | null>;

    constructor(
        private readonly _router: Router,
        private readonly _translateService: TranslateService
    ) {
        const storedToken = localStorage.getItem(this._accessTokenKey);
        this._state = signal<AuthState>({
            token: storedToken,
            loading: false,
            errorMsg: null,
        });

        this._token = computed(() => this._state().token);
        this._role = computed(() => {
            const token = this._token();
            if (!token) return null;
            try {
                const role = (jwtDecode(token) as any).role;
                if (Object.values(Role).includes(role)) return role;
                return null;
            } catch {
                return null;
            }
        });
        this._isAuthenticated = computed(() => this._state().token != null);
        this._isLoading = computed(() => this._state().loading);
        this._errorMsg = computed(() => this._state().errorMsg);

        effect(() => {
            const token = this._token();
            if (token) {
                localStorage.setItem(this._accessTokenKey, token);
            } else {
                localStorage.removeItem(this._accessTokenKey);
            }
        });
    }

    public set redirectUrl(url: string | null) {
        this._redirectUrl = url;
    }

    public get token(): Signal<string | null> {
        return this._token;
    }

    public get role(): Signal<Role | null> {
        return this._role;
    }

    public get isAuthenticated(): Signal<boolean> {
        return this._isAuthenticated;
    }

    public get isLoading(): Signal<boolean> {
        return this._isLoading;
    }

    public get errorMsg(): Signal<string | null> {
        return this._errorMsg;
    }

    public logIn(email: string, password: string): void {
        this._state.update((state) => ({ ...state, loading: true }));

        api
            .post('/auth/login', { email, password }) // Adjust this endpoint as per your REST API
            .then((response) => {
                const token = response.data.token; // Or whatever your REST API returns
                this._state.set({
                    token,
                    loading: false,
                    errorMsg: null,
                });

                const redirectUrl = this._redirectUrl;
                this._redirectUrl = null;
                this._router.navigateByUrl(redirectUrl ?? '/');
            })
            .catch((error) => {
                const errorMsg = error.response?.data?.message || error.message;
                this._state.set({
                    token: null,
                    loading: false,
                    errorMsg,
                });
            });
    }

    public logout(): void {
        this._state.set({
            token: null,
            loading: false,
            errorMsg: null,
        });
        this.redirectUrl = null;
        this._router.navigateByUrl('account/login');
    }
}
