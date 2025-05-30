import { Routes } from '@angular/router';
import { SettingsComponent } from './settings/settings.component';
import { GeneralSettingsComponent } from './general-settings/general-settings.component';

export default [
    {
        path: '',
        component: SettingsComponent,
        children: [
            {
                path: '',
                redirectTo: 'general',
                pathMatch: 'full',
            },
            {
                path: 'general',
                component: GeneralSettingsComponent,
            },
        ],
    },
] as Routes;
