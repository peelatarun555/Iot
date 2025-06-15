import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { PlacesOverviewComponent } from '../../components/admin/item-overview/places-overview/places-overview.component';
import { DevicesOverviewComponent } from '../../components/admin/item-overview/devices-overview/devices-overview.component';
import { SensorsOverviewComponent } from '../../components/admin/item-overview/sensors-overview/sensors-overview.component';

@Component({
    selector: 'dui-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        TranslateModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButton,
        MatTabsModule,
        DevicesOverviewComponent,
        PlacesOverviewComponent,
        SensorsOverviewComponent,
    ],
})
export class AdminComponent {}
