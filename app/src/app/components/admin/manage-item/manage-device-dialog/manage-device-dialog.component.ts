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
import { Device, DeviceType } from '../../../../models/device';
import { DeviceStatus } from '../../../../restapi/utils/enums';
import {
    createOptionItem,
    transformToOptionItem,
} from '../../../../helpers/create-option-item';
import { DeviceService } from '../../../../services/core/device.service';
import { ItemDialogData, OptionItem } from '../../../../models/core';

@Component({
    templateUrl: './manage-device-dialog.component.html',
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
export class ManageDeviceDialogComponent implements OnDestroy {
    protected readonly deviceStatus: typeof DeviceStatus;

    protected readonly formGroup: FormGroup;
    protected readonly newItem: boolean;

    protected readonly loadDeviceTypesFn: () => Observable<OptionItem[]>;
    protected readonly searchPlacesFn: (
        searchString: string
    ) => Observable<OptionItem[]>;

    protected readonly _ngUnsubscribe: Subject<void>;

    constructor(
        private readonly _dialogRef: MatDialogRef<ManageDeviceDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        private readonly _dialogData: ItemDialogData<Device>,
        private readonly _fb: FormBuilder,
        private readonly _placeService: PlaceService,
        private readonly _deviceService: DeviceService
    ) {
        this.deviceStatus = DeviceStatus;

        const deviceType = this._dialogData.item?.deviceType ?? null;
        let type: OptionItem | null;
        if (deviceType === null) type = null;
        else if (typeof deviceType === 'object') {
            type = transformToOptionItem(deviceType);
        } else {
            type = createOptionItem(deviceType);
        }

        let place: OptionItem | null = null;
        if (this._dialogData.item?.place != null)
            place = transformToOptionItem(this._dialogData.item.place);

        this.formGroup = this._fb.group({
            name: new FormControl<string>(this._dialogData.item?.name ?? '', [
                Validators.required,
                Validators.minLength(3),
            ]),
            type: new FormControl<OptionItem | null>(type, Validators.required),
            eui: new FormControl<string>(this._dialogData.item?.devEui ?? ''),
            description: new FormControl<string>(
                this._dialogData.item?.description ?? ''
            ),
            status: new FormControl<DeviceStatus | null>(
                this._dialogData.item?.status ?? null,
                Validators.required
            ),
            place: new FormControl<OptionItem | null>(
                place,
                Validators.required
            ),
        });
        this.newItem = this._dialogData.newItem;

        this._ngUnsubscribe = new Subject();

        this.loadDeviceTypesFn = () => {
            return this._deviceService.getDeviceTypes().pipe(
                takeUntil(this._ngUnsubscribe),
                map((types: DeviceType[]) =>
                    types.map((type) => transformToOptionItem(type))
                )
            );
        };

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

    private _createObject(): Device {
        const selectedDeviceType = this.formGroup.get('type')?.value;
        let deviceType: string | DeviceType;
        if (selectedDeviceType.id === -1) deviceType = selectedDeviceType.text;
        else
            deviceType = <DeviceType>{
                id: selectedDeviceType.id,
                name: selectedDeviceType.text,
            };

        return <Device>{
            id: this._dialogData.item?.id,
            name: this.formGroup.get('name')?.value,
            deviceType: deviceType,
            devEui: this.formGroup.get('eui')?.value,
            description: this.formGroup.get('description')?.value,
            status: this.formGroup.get('status')?.value,
            place: {
                id: this.formGroup.get('place')?.value.id,
            },
        };
    }
}
