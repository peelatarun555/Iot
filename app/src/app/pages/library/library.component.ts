import {
    ChangeDetectionStrategy,
    Component,
    computed,
    OnInit,
    Signal,
} from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';
import { LibraryService } from '../../services/core/library.service';
import { SocketState } from '../../models/SocketState';
import { LibraryGroundPageComponent } from './floors/ground-floor/library-ground-page.component';
import { LibraryUpperPageComponent } from './floors/upper-floor/library-upper-page.component';

@Component({
    selector: 'dui-library',
    standalone: true,
    imports: [
        MatTabsModule,
        LibraryGroundPageComponent,
        LibraryUpperPageComponent,
        TranslateModule,
        RouterModule,
    ],
    templateUrl: './library.component.html',
    styleUrl: './library.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryComponent implements OnInit {
    protected viewOnly: boolean;
    protected activeLink: string;
    protected readonly errorMessage: Signal<string | null>;

    constructor(
        private readonly _router: Router,
        private readonly _libraryService: LibraryService
    ) {
        this.activeLink = '';

        this.errorMessage = computed(() => {
            switch (this._libraryService.socketStatus()) {
                case SocketState.DISCONNECTED:
                    return "Oops! We've lost the connection. Please check your network and try again.";
                case SocketState.CONNECTION_ERROR:
                    return 'Connection error: The connection is unstable or corrupted. Please try reconnecting.';
                default:
                    return null;
            }
        });
        this.viewOnly = this._router.url.startsWith('/view/');
    }

    ngOnInit() {
        const segments = this._router.url.split('/');
        if (segments.length === 3) this.activeLink = segments[2];
    }
}
