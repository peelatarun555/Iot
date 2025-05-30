import {
    ChangeDetectionStrategy,
    Component,
    computed,
    Signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../restapi/utils/enums';

interface NavItem {
    icon: string;
    label: string;
    link: string;
}

@Component({
    selector: 'dui-side-nav-bar',
    templateUrl: './side-nav-bar.component.html',
    styleUrls: ['./side-nav-bar.component.scss'],
    imports: [
        MatIconModule,
        RouterLink,
        RouterLinkActive,
        MatButtonModule,
        TranslateModule,
    ],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavBarComponent {
    protected sideNavItems: NavItem[];
    protected isAdmin: Signal<boolean>;

    constructor(private readonly _authService: AuthService) {
        this.sideNavItems = [
            // {
            //     icon: 'dashboard',
            //     label: 'navigation.dashboard',
            //     link: 'dashboard',
            // },
            {
                icon: 'local_library',
                label: 'Library',
                link: 'library',
            },
            //     {
            //         icon: 'map',
            //         label: 'navigation.map',
            //         link: 'map',
            //     },
            //     {
            //         icon: 'data_thresholding',
            //         label: 'navigation.graphs',
            //         link: 'graphs',
            //     },
        ];
        this.isAdmin = computed(() => {
            return this._authService.role() === Role.admin;
        });
    }
}
