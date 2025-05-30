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
import { AdminDevicesDto, IDevicesRequest } from '../../../../models/admin';
import { ItemOverviewDirective } from '../item-overview.directive';
import { Device } from '../../../../models/device';
import { DeviceService } from '../../../../services/core/device.service';
import { ItemDialogData, ItemTypes } from '../../../../models/core';
import { ManageDeviceDialogComponent } from '../../manage-item/manage-device-dialog/manage-device-dialog.component';

@Component({
    selector: 'dui-devices-overview',
    templateUrl: './devices-overview.component.html',
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
export class DevicesOverviewComponent extends ItemOverviewDirective<
    Device,
    ManageDeviceDialogComponent
> {
    protected hasDevices: boolean;

    protected displayedColumns: string[];
    protected dataSource: MatTableDataSource<Device>;

    protected nameSearchString: string;
    protected euiSearchString: string;
    protected descriptionSearchString: string;
    protected typeSearchString: string;
    protected placeSearchString: string;

    constructor(
        protected override readonly dialog: MatDialog,
        protected override readonly translateService: TranslateService,
        private readonly _cdr: ChangeDetectorRef,
        private readonly _deviceService: DeviceService,
        private readonly _snackBar: DuiSnackBar
    ) {
        super(dialog, translateService, ItemTypes.DEVICE);
        this.hasDevices = false;

        this.displayedColumns = [
            'id',
            'name',
            'eui',
            'description',
            'type',
            'place',
            'actions',
        ];
        this.dataSource = new MatTableDataSource();

        this.nameSearchString = '';
        this.euiSearchString = '';
        this.descriptionSearchString = '';
        this.typeSearchString = '';
        this.placeSearchString = '';
    }

    public loadItems(): void {
        this.ngUnsubscribeApi.next();
        this.loading = true;

        const requestObj: Partial<IDevicesRequest> = {
            deviceName: this.nameSearchString,
            deviceEui: this.euiSearchString,
            deviceDescription: this.descriptionSearchString,
            deviceType: this.typeSearchString,
            placeName: this.placeSearchString,
            index: this.paginator.pageIndex,
            take: this.paginator.pageSize,
            orderBy: this.activeSort != null ? this.activeSort : undefined,
            ascending:
                this.activeSort != null
                    ? this.sortDirection === 'asc'
                    : undefined,
        };

        this._deviceService
            .getAdminDevices(requestObj)
            .pipe(takeUntil(this.ngUnsubscribeApi))
            .subscribe({
                next: (adminDevices: AdminDevicesDto) =>
                    this._setDevices(adminDevices),
                error: (err: HttpErrorResponse) =>
                    this._snackBar.open(
                        SnackBarType.ERROR,
                        `Devices could not be loaded: \n ${err.message}`
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

    public clearEuiSearch() {
        this.euiSearchString = '';
        this.onClear();
    }

    public clearDescriptionSearch() {
        this.descriptionSearchString = '';
        this.onClear();
    }

    public clearTypeSearch() {
        this.typeSearchString = '';
        this.onClear();
    }

    public clearPlaceSearch() {
        this.placeSearchString = '';
        this.onClear();
    }

    protected override openDialog(
        data: ItemDialogData<Device>
    ): MatDialogRef<ManageDeviceDialogComponent> {
        return this.dialog.open(ManageDeviceDialogComponent, { data });
    }

    protected override createItem(device: Device) {
        this.ngUnsubscribeApi.next();
        this.loading = true;

        this._deviceService
            .createDevice(device)
            .pipe(takeUntil(this.ngUnsubscribeApi))
            .subscribe({
                next: () =>
                    this._snackBar.open(
                        SnackBarType.INFO,
                        `Device has been created.`
                    ),
                error: (err: HttpErrorResponse) =>
                    this._snackBar.open(
                        SnackBarType.ERROR,
                        `Device could not be created: \n ${err.message}`
                    ),
            })
            .add(() => {
                this.loadItems();
                this.loading = false;
            });
    }

    protected override saveItem(device: Device): void {
        this.ngUnsubscribeApi.next();
        this.loading = true;

        this._deviceService
            .updateDevice(device)
            .pipe(takeUntil(this.ngUnsubscribeApi))
            .subscribe({
                next: () =>
                    this._snackBar.open(
                        SnackBarType.INFO,
                        `Device has been saved.`
                    ),
                error: (err: HttpErrorResponse) =>
                    this._snackBar.open(
                        SnackBarType.ERROR,
                        `Device could not be saved: \n ${err.message}`
                    ),
            })
            .add(() => {
                this.loadItems();
                this.loading = false;
            });
    }

    protected override removeItem(deviceId: number): void {
        this.ngUnsubscribeApi.next();
        this.loading = true;

        this._deviceService
            .removeDevice(deviceId)
            .pipe(takeUntil(this.ngUnsubscribeApi))
            .subscribe({
                next: () =>
                    this._snackBar.open(
                        SnackBarType.INFO,
                        `Device has been removed.`
                    ),
                error: (err: HttpErrorResponse) =>
                    this._snackBar.open(
                        SnackBarType.ERROR,
                        `Device could not be removed: \n ${err.message}`
                    ),
            })
            .add(() => {
                this.loadItems();
                this.loading = false;
            });
    }

    private _setDevices(adminDevices: AdminDevicesDto) {
        this.paginator.pageIndex = adminDevices.index;
        this.paginator.pageSize = adminDevices.take;
        this.paginator.length = adminDevices.total;

        this.hasDevices = adminDevices.devices.length > 0;
        this.dataSource.data = adminDevices.devices;

        this._cdr.markForCheck();
    }
}
