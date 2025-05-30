import {
    ChangeDetectionStrategy,
    Component,
    Signal,
    ViewEncapsulation,
    computed,
    effect,
    viewChild,
} from '@angular/core';
import { SideNavBarComponent } from './side-nav-bar/side-nav-bar.component';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';
import {
    MatDrawer,
    MatDrawerMode,
    MatSidenavModule,
} from '@angular/material/sidenav';
import { toSignal } from '@angular/core/rxjs-interop';
import {
    AppBreakpoints,
    BreakpointWatcherService,
} from '../services/core/breakpoint-watcher.service';
import { FooterComponent } from './footer/footer.component';

@Component({
    selector: 'dui-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
    imports: [
        SideNavBarComponent,
        HeaderComponent,
        FooterComponent,
        RouterModule,
        MatSidenavModule,
    ],
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
    drawer = viewChild<MatDrawer>('drawer');
    breakpointObserverResult = toSignal(
        this._breakpointWatcherObserver.observe(AppBreakpoints.Mobile)
    );
    drawerMode: Signal<MatDrawerMode> = computed(() => 'side');

    constructor(private _breakpointWatcherObserver: BreakpointWatcherService) {
        this.drawerMode = computed(() => {
            return this.breakpointObserverResult()?.matches ? 'side' : 'over';
        });

        effect(() => {
            if (this.drawerMode() === 'side') {
                this.drawer()?.open();
            } else this.drawer()?.close();
        });
    }
}
