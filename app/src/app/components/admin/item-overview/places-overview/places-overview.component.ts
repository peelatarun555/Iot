import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Place } from '../../../../models/place';
import { PlaceService } from '../../../../services/core/place.service';
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
import { AdminPlacesDto, IPlacesRequest } from '../../../../models/admin';
import { ItemOverviewDirective } from '../item-overview.directive';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ItemDialogData, ItemTypes } from '../../../../models/core';
import { ManagePlaceDialogComponent } from '../../manage-item/manage-place-dialog/manage-place-dialog.component';

@Component({
    selector: 'dui-places-overview',
    templateUrl: './places-overview.component.html',
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
export class PlacesOverviewComponent extends ItemOverviewDirective<
    Place,
    ManagePlaceDialogComponent
> {
    protected hasPlaces: boolean;

    protected displayedColumns: string[];
    protected dataSource: MatTableDataSource<Place>;

    protected nameSearchString: string;
    protected parentSearchString: string;

    constructor(
        protected override readonly dialog: MatDialog,
        protected override readonly translateService: TranslateService,
        private readonly _cdr: ChangeDetectorRef,
        private readonly _placeService: PlaceService,
        private readonly _snackBar: DuiSnackBar
    ) {
        super(dialog, translateService, ItemTypes.PLACE);
        this.hasPlaces = false;

        this.displayedColumns = ['id', 'name', 'parent', 'actions'];
        this.dataSource = new MatTableDataSource();

        this.nameSearchString = '';
        this.parentSearchString = '';
    }

    public loadItems(): void {
        this.ngUnsubscribeApi.next();
        this.loading = true;

        const requestObj: Partial<IPlacesRequest> = {
            placeName: this.nameSearchString,
            parentPlaceName: this.parentSearchString,
            index: this.paginator.pageIndex,
            take: this.paginator.pageSize,
            orderBy: this.activeSort != null ? this.activeSort : undefined,
            ascending:
                this.activeSort != null
                    ? this.sortDirection === 'asc'
                    : undefined,
        };

        this._placeService
            .getAdminPlaces(requestObj)
            .pipe(takeUntil(this.ngUnsubscribeApi))
            .subscribe({
                next: (adminPlaces: AdminPlacesDto) =>
                    this._setPlaces(adminPlaces),
                error: (err: HttpErrorResponse) => {
                    this._snackBar.open(
                        SnackBarType.ERROR,
                        `Places could not be loaded: \n ${err.message}`
                    );
                },
            })
            .add(() => {
                this.loading = false;
            });
    }

    public clearNameSearch() {
        this.nameSearchString = '';
        this.onClear();
    }

    public clearParentSearch() {
        this.parentSearchString = '';
        this.onClear();
    }

    protected override openDialog(
        data: ItemDialogData<Place>
    ): MatDialogRef<ManagePlaceDialogComponent> {
        return this.dialog.open(ManagePlaceDialogComponent, { data });
    }

    protected override createItem(place: Place) {
        this.ngUnsubscribeApi.next();
        this.loading = true;

        this._placeService
            .createPlace(place)
            .pipe(takeUntil(this.ngUnsubscribeApi))
            .subscribe({
                next: () =>
                    this._snackBar.open(
                        SnackBarType.INFO,
                        `Place has been created.`
                    ),
                error: (err: HttpErrorResponse) =>
                    this._snackBar.open(
                        SnackBarType.ERROR,
                        `Place could not be created: \n ${err.message}`
                    ),
            })
            .add(() => {
                this.loadItems();
                this.loading = false;
            });
    }

    protected override saveItem(place: Place): void {
        this.ngUnsubscribeApi.next();
        this.loading = true;

        this._placeService
            .updatePlace(place)
            .pipe(takeUntil(this.ngUnsubscribeApi))
            .subscribe({
                next: () =>
                    this._snackBar.open(
                        SnackBarType.INFO,
                        `Place has been saved.`
                    ),
                error: (err: HttpErrorResponse) =>
                    this._snackBar.open(
                        SnackBarType.ERROR,
                        `Place could not be saved: \n ${err.message}`
                    ),
            })
            .add(() => {
                this.loadItems();
                this.loading = false;
            });
    }

    protected override removeItem(placeId: number): void {
        this.ngUnsubscribeApi.next();
        this.loading = true;

        this._placeService
            .removePlace(placeId)
            .pipe(takeUntil(this.ngUnsubscribeApi))
            .subscribe({
                next: () =>
                    this._snackBar.open(
                        SnackBarType.INFO,
                        `Place has been removed.`
                    ),
                error: (err: HttpErrorResponse) =>
                    this._snackBar.open(
                        SnackBarType.ERROR,
                        `Place could not be removed: \n ${err.message}`
                    ),
            })
            .add(() => {
                this.loadItems();
                this.loading = false;
            });
    }

    private _setPlaces(adminPlaces: AdminPlacesDto) {
        this.paginator.pageIndex = adminPlaces.index;
        this.paginator.pageSize = adminPlaces.take;
        this.paginator.length = adminPlaces.total;

        this.hasPlaces = adminPlaces.places.length > 0;
        this.dataSource.data = adminPlaces.places;

        this._cdr.markForCheck();
    }
}
