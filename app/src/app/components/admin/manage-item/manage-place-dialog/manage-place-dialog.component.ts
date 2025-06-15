import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnDestroy,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { AutocompleteComponent } from '../../../core/autocomplete/autocomplete.component';
import { Place } from '../../../../models/place';
import { PlaceService } from '../../../../services/core/place.service';
import { transformToOptionItem } from '../../../../helpers/create-option-item';
import { ItemDialogData, OptionItem } from '../../../../models/core';

@Component({
    templateUrl: './manage-place-dialog.component.html',
    styleUrls: ['../manage-item-dialog.scss'],
    standalone: true,
    imports: [
        MatButton,
        MatDialogActions,
        MatDialogClose,
        MatDialogContent,
        MatIcon,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        TranslateModule,
        AutocompleteComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagePlaceDialogComponent implements OnDestroy {
    protected readonly formGroup: FormGroup;
    protected readonly newItem: boolean;

    protected readonly searchPlacesFn: (
        searchString: string
    ) => Observable<OptionItem[]>;

    protected readonly _ngUnsubscribe: Subject<void>;

    constructor(
        private readonly _dialogRef: MatDialogRef<ManagePlaceDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        private readonly _dialogData: ItemDialogData<Place>,
        private readonly _fb: FormBuilder,
        private readonly _placeService: PlaceService
    ) {
        let parentPlace: OptionItem | null = null;
        if (this._dialogData.item?.parent != null)
            parentPlace = transformToOptionItem(this._dialogData.item.parent);

        this.formGroup = this._fb.group({
            name: new FormControl<string>(this._dialogData.item?.name ?? '', [
                Validators.required,
                Validators.minLength(3),
            ]),
            parentPlace: new FormControl<OptionItem | null>(parentPlace),
        });
        this.newItem = this._dialogData.newItem;

        this._ngUnsubscribe = new Subject();

        this.searchPlacesFn = (searchString: string) => {
            return this._placeService.searchPlaces(searchString).pipe(
                takeUntil(this._ngUnsubscribe),
                map((places: Place[]) =>
                    places.map((place) => transformToOptionItem(place))
                )
            );
        };
    }

    ngOnDestroy() {
        this._ngUnsubscribe.next();
        this._ngUnsubscribe.complete();
    }

    protected submit(): void {
        if (!this.formGroup.valid) {
            for (const controlName in this.formGroup.controls) {
                this.formGroup.controls[controlName].markAsTouched();
            }
            return;
        }

        this._dialogRef.close(this._createObject());
    }

    private _createObject(): Place {
        return <Place>{
            id: this._dialogData.item?.id,
            name: this.formGroup?.get('name')?.value,
            parentId:
                this.formGroup?.get('parentPlace')?.value?.id ?? undefined,
        };
    }
}
