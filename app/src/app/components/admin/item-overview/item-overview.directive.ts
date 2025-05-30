import {
    AfterViewInit,
    computed,
    Directive,
    OnDestroy,
    signal,
    Signal,
    ViewChild,
    WritableSignal,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { debounceTime, Subject } from 'rxjs';
import { Sort } from '@angular/material/sort';
import { ItemDialogData, ItemTypes } from '../../../models/core';
import { MessageDialogComponent } from '../../core/message-dialog/message-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Directive({
    standalone: true,
})
export abstract class ItemOverviewDirective<S, T>
    implements AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) protected paginator!: MatPaginator;

    protected isLoading: Signal<boolean>;

    protected activeSort: string | null;
    protected sortDirection: 'asc' | 'desc';

    protected readonly ngUnsubscribeApi: Subject<void>;

    private readonly _isLoading: WritableSignal<number>;
    private readonly _loadSubject: Subject<void>;

    protected constructor(
        protected readonly dialog: MatDialog,
        protected readonly translateService: TranslateService,
        private readonly _itemType: ItemTypes
    ) {
        this.isLoading = computed(() => this._isLoading() > 0);

        this.activeSort = null;
        this.sortDirection = 'asc';

        this.ngUnsubscribeApi = new Subject();

        this._isLoading = signal(0);
        this._loadSubject = new Subject();

        this._loadSubject.pipe(debounceTime(500)).subscribe(() => {
            this.loadItems();
        });
    }

    protected set loading(loading: boolean) {
        this._isLoading.update((loadingState) => {
            if (loading) return loadingState + 1;
            else if (loadingState > 0) return loadingState - 1;
            return 0;
        });
    }

    ngAfterViewInit() {
        this.paginator.pageSize = 10;
        this.loadItems();

        this.paginator.page.subscribe(() => {
            this._loadSubject.next();
        });
    }

    ngOnDestroy() {
        this.ngUnsubscribeApi.next();
        this.ngUnsubscribeApi.complete();

        this._loadSubject.complete();
    }

    public preventSort(event: Event) {
        event.stopPropagation();
    }

    public onInputChange(input: string) {
        this.paginator.pageIndex = 0;
        if (input.length === 0 || input.length > 2) this._loadSubject.next();
    }

    public onClear() {
        this.paginator.pageIndex = 0;
        this._loadSubject.next();
    }

    public sortData(data: Sort) {
        if (data.direction !== '') {
            this.activeSort = data.active;
            this.sortDirection = data.direction;
        } else this.activeSort = null;

        this.loadItems();
    }

    public openCreateDialog() {
        const dialogRef = this.openDialog({
            newItem: true,
            type: this._itemType,
        });

        dialogRef.afterClosed().subscribe((result: S) => {
            if (result) {
                this.createItem(result);
            }
        });
    }

    public openSaveDialog(item: S) {
        const dialogRef = this.openDialog({
            newItem: false,
            type: this._itemType,
            item,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.saveItem(result);
            }
        });
    }

    public openRemoveDialog(itemTitle: string, itemId: number) {
        const labels = this.translateService.instant('messageDialog');
        const dialogRef = this.dialog.open(MessageDialogComponent, {
            data: {
                title: `${labels.delete} ${itemTitle}`,
                message: labels.deleteMsg,
                buttonLabel: this.translateService.instant('delete'),
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.removeItem(itemId);
            }
        });
    }

    protected abstract loadItems(): void;

    protected abstract openDialog(data: ItemDialogData<S>): MatDialogRef<T>;

    protected abstract createItem(item: S): void;

    protected abstract saveItem(item: S): void;

    protected abstract removeItem(itemId: number): void;
}
