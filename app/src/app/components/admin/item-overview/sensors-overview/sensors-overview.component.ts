import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DuiSnackBar, SnackBarType } from '../../../dui-snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AdminSensorsDto, ISensorsRequest } from '../../../../models/admin';
import { ItemOverviewDirective } from '../item-overview.directive';
import { ItemDialogData, ItemTypes } from '../../../../models/core';
import { SensorService } from '../../../../services/core/sensor.service';
import { Sensor } from '../../../../models/sensor';
import { ManageSensorDialogComponent } from '../../manage-item/manage-sensor-dialog/manage-sensor-dialog.component';

@Component({
    selector: 'dui-sensors-overview',
    templateUrl: './sensors-overview.component.html',
    styleUrls: ['../item-overview.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSortModule,
        MatPaginatorModule,
        TranslateModule,
        MatProgressSpinnerModule,
    ],
})
export class SensorsOverviewComponent extends ItemOverviewDirective<
    Sensor,
    ManageSensorDialogComponent
> {
    protected hasSensors: boolean;

    protected displayedColumns: string[];
    protected dataSource: MatTableDataSource<Sensor>;

    protected nameSearchString: string;
    protected typeSearchString: string;
    protected aliasSearchString: string;
    protected libraryIdSearchString: string;
    protected deviceSearchString: string;

    constructor(
        protected override readonly dialog: MatDialog,
        protected override readonly translateService: TranslateService,
        private readonly _cdr: ChangeDetectorRef,
        private readonly _sensorService: SensorService,
        private readonly _snackBar: DuiSnackBar
    ) {
        super(dialog, translateService, ItemTypes.SENSOR);
        this.hasSensors = false;

        this.displayedColumns = [
            'id',
            'name',
            'type',
            'alias',
            'libraryId',
            'device',
            'actions',
        ];
        this.dataSource = new MatTableDataSource();

        this.nameSearchString = '';
        this.typeSearchString = '';
        this.aliasSearchString = '';
        this.libraryIdSearchString = '';
        this.deviceSearchString = '';
    }

    public loadItems(): void {
        this.ngUnsubscribeApi.next();
        this.loading = true;

        const requestObj: Partial<ISensorsRequest> = {
            sensorName: this.nameSearchString,
            sensorAlias: this.aliasSearchString,
            sensorType: this.typeSearchString,
            libraryId: this.libraryIdSearchString,
            deviceName: this.deviceSearchString,
            index: this.paginator.pageIndex,
            take: this.paginator.pageSize,
            orderBy: this.activeSort != null ? this.activeSort : undefined,
            ascending:
                this.activeSort != null
                    ? this.sortDirection === 'asc'
                    : undefined,
        };

        this._sensorService
            .getAdminSensors(requestObj)
            .pipe(takeUntil(this.ngUnsubscribeApi))
            .subscribe({
                next: (adminSensors: AdminSensorsDto) =>
                    this._setSensors(adminSensors),
                error: (err: HttpErrorResponse) =>
                    this._snackBar.open(
                        SnackBarType.ERROR,
                        `Sensors could not be loaded: \n ${err.message}`
                    ),
            })
            .add(() => {
                this.loading = false;
            });
    }

    public clearNameSearch() {
        this.nameSearchString = '';
        this.onClear();
    }

    public clearAliasSearch() {
        this.aliasSearchString = '';
        this.onClear();
    }

    public clearTypeSearch() {
        this.typeSearchString = '';
        this.onClear();
    }

    public clearLibraryIdSearch() {
        this.libraryIdSearchString = '';
        this.onClear();
    }

    public clearDeviceSearch() {
        this.deviceSearchString = '';
        this.onClear();
    }

    protected override openDialog(
        data: ItemDialogData<Sensor>
    ): MatDialogRef<ManageSensorDialogComponent> {
        return this.dialog.open(ManageSensorDialogComponent, { data });
    }

    protected override createItem(sensor: Sensor) {
        this.ngUnsubscribeApi.next();
        this.loading = true;

        this._sensorService
            .createSensor(sensor)
            .pipe(takeUntil(this.ngUnsubscribeApi))
            .subscribe({
                next: () =>
                    this._snackBar.open(
                        SnackBarType.INFO,
                        `Sensor has been created.`
                    ),
                error: (err: HttpErrorResponse) =>
                    this._snackBar.open(
                        SnackBarType.ERROR,
                        `Sensor could not be created: \n ${err.message}`
                    ),
            })
            .add(() => {
                this.loadItems();
                this.loading = false;
            });
    }

    protected override saveItem(sensor: Sensor): void {
        this.ngUnsubscribeApi.next();
        this.loading = true;

        this._sensorService
            .updateSensor(sensor)
            .pipe(takeUntil(this.ngUnsubscribeApi))
            .subscribe({
                next: () =>
                    this._snackBar.open(
                        SnackBarType.INFO,
                        `Sensor has been saved.`
                    ),
                error: (err: HttpErrorResponse) =>
                    this._snackBar.open(
                        SnackBarType.ERROR,
                        `Sensor could not be saved: \n ${err.message}`
                    ),
            })
            .add(() => {
                this.loadItems();
                this.loading = false;
            });
    }

    protected override removeItem(sensorId: number): void {
        this.ngUnsubscribeApi.next();
        this.loading = true;

        this._sensorService
            .removeSensor(sensorId)
            .pipe(takeUntil(this.ngUnsubscribeApi))
            .subscribe({
                next: () =>
                    this._snackBar.open(
                        SnackBarType.INFO,
                        `Sensor has been removed.`
                    ),
                error: (err: HttpErrorResponse) =>
                    this._snackBar.open(
                        SnackBarType.ERROR,
                        `Sensor could not be removed: \n ${err.message}`
                    ),
            })
            .add(() => {
                this.loadItems();
                this.loading = false;
            });
    }

    private _setSensors(adminSensors: AdminSensorsDto) {
        this.paginator.pageIndex = adminSensors.index;
        this.paginator.pageSize = adminSensors.take;
        this.paginator.length = adminSensors.total;

        this.hasSensors = adminSensors.sensors.length > 0;
        this.dataSource.data = adminSensors.sensors;

        this._cdr.markForCheck();
    }
}
