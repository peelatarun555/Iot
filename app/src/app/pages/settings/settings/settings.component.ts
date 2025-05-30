import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    Signal,
    signal,
    untracked,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
    MatDrawer,
    MatDrawerMode,
    MatSidenavModule,
} from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterModule, Scroll } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter, map } from 'rxjs';
import {
    AppBreakpoints,
    BreakpointWatcherService,
} from 'src/app/services/core/breakpoint-watcher.service';

export interface SettingItem {
    icon: string;
    label: string;
    link: string;
}

@Component({
    standalone: true,
    imports: [
        RouterModule,
        TranslateModule,
        MatIconModule,
        MatButtonModule,
        MatSidenavModule,
    ],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
    settingItems: WritableSignal<Array<SettingItem>> = signal([]);
    activeSetting: WritableSignal<SettingItem> = signal(this.settingItems()[0]);

    breakpointObserverResult = toSignal(
        this._breakpointWatcherObserver.observe(AppBreakpoints.Mobile)
    );

    drawer = viewChild<MatDrawer>('drawer');
    drawerMode: Signal<MatDrawerMode> = computed(() => 'side');

    constructor(
        private _breakpointWatcherObserver: BreakpointWatcherService,
        private _router: Router
    ) {
        this.initializeSettingItems();

        this.drawerMode = computed(() => {
            return this.breakpointObserverResult()?.matches ? 'side' : 'over';
        });

        effect(() => {
            if (this.drawerMode() === 'side') {
                this.drawer()?.open();
            } else this.drawer()?.close();
        });

        this._router.events
            .pipe(
                filter(
                    (event) =>
                        event instanceof NavigationEnd ||
                        event instanceof Scroll
                ),
                map((event) => {
                    let url = '';
                    if (event instanceof Scroll) url = event.routerEvent.url;
                    else if (event instanceof NavigationEnd) url = event.url;

                    let activeItem = untracked(this.settingItems)[0];
                    for (const item of untracked(this.settingItems)) {
                        if (url.includes(item.label)) {
                            activeItem = item;
                            break;
                        }
                    }
                    this.activeSetting.set(activeItem);
                }),
                takeUntilDestroyed()
            )
            .subscribe();
    }

    initializeSettingItems() {
        this.settingItems.set([
            {
                icon: 'settings',
                label: 'general',
                link: 'general',
            },
            {
                icon: 'account_box',
                label: 'account',
                link: 'account',
            },
        ]);
    }
}
