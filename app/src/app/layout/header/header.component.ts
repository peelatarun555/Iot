import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Output,
} from '@angular/core';
import { UserComponent } from '../user/user.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { SchemesComponent } from '../schemes/schemes.component';
import { LanguagesComponent } from '../languages/languages.component';

@Component({
    selector: 'dui-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        TranslateModule,
        SchemesComponent,
        LanguagesComponent,
        UserComponent,
    ],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
    @Output() toggleSideNavEvent: EventEmitter<void>;

    constructor() {
        this.toggleSideNavEvent = new EventEmitter();
    }

    toggleSideNav() {
        this.toggleSideNavEvent.emit();
    }
}
