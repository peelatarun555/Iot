import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AccountComponent } from './account.component';

export default [
    {
        path: '',
        component: AccountComponent,
        children: [
            {
                path: 'login',
                component: LoginComponent,
            },
            { path: '', redirectTo: 'login', pathMatch: 'full' },
        ],
    },
] as Routes;
