import { Routes } from '@angular/router';
import { DataChartComponent } from './components/core/data-chart/data-chart.component';
import { Role } from './restapi/utils/enums';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { LayoutComponent } from './layout/layout.component';
import { ViewLayoutComponent } from './layout/view-layout/view-layout.component';
import { AdminComponent } from './pages/admin/admin.component';
import { HomeComponent } from './pages/home/home.component';
import { LibraryComponent } from './pages/library/library.component';
import { MapComponent } from './pages/map/map.component';
import { loginGuard } from './guards/loginGuard';
import { LibraryGroundPageComponent } from './pages/library/floors/ground-floor/library-ground-page.component';
import { LibraryUpperPageComponent } from './pages/library/floors/upper-floor/library-upper-page.component';
import { BothFloorsComponent } from './pages/library/floors/both-floors/both-floors.component';

export const routes: Routes = [
    // Account login, registration, password retrieval, and other screens
    {
        path: 'account',
        canActivate: [loginGuard],
        title: 'Login - EoT Dataplatform',
        loadChildren: () => import('./pages/account/account.routes'),
    },
    {
        path: 'view',
        component: ViewLayoutComponent,
        children: [
            {
                path: 'library',
                component: LibraryComponent,
                children: [
                    {
                        path: 'ground-floor',
                        component: LibraryGroundPageComponent,
                        title: 'Library Ground Floor - EoT Dataplatform',
                    },
                    {
                        path: 'upper-floor',
                        component: LibraryUpperPageComponent,
                        title: 'Library Upper Floor - EoT Dataplatform',
                    },
                    {
                        path: '',
                        component: BothFloorsComponent,
                        title: 'Library - EoT Dataplatform',
                    },
                ],
            },
        ],
    },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                component: HomeComponent,
                title: 'Dashboard - EoT Dataplatform',
            },
            {
                path: 'graphs',
                component: DataChartComponent,
            },
            {
                path: 'library',
                component: LibraryComponent,
                children: [
                    {
                        path: 'ground-floor',
                        component: LibraryGroundPageComponent,
                        title: 'Library Ground Floor - EoT Dataplatform',
                    },
                    {
                        path: 'upper-floor',
                        component: LibraryUpperPageComponent,
                        title: 'Library Upper Floor - EoT Dataplatform',
                    },
                    {
                        path: '',
                        redirectTo: 'ground-floor',
                        pathMatch: 'full',
                    },
                ],
            },
            {
                path: 'map',
                component: MapComponent,
            },
            {
                path: 'administration',
                canActivate: [roleGuard(Role.admin)],
                component: AdminComponent,
                title: 'Administration - EoT Dataplatform',
            },
            {
                path: 'settings',
                loadChildren: () => import('./pages/settings/settings.routes'),
            },
            { path: '', redirectTo: 'library', pathMatch: 'full' },
        ],
    },
    { path: '**', redirectTo: 'library' },
];
