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
import { Device } from '../../../../models/device';
import {
    createOptionItem,
    transformToOptionItem,
} from '../../../../helpers/create-option-item';
import { DeviceService } from '../../../../services/core/device.service';
import { ItemDialogData, OptionItem } from '../../../../models/core';
import { Sensor, SensorType } from '../../../../models/sensor';
import { SensorService } from '../../../../services/core/sensor.service';

@Component({
    templateUrl: './manage-sensor-dialog.component.html',
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
export class ManageSensorDialogComponent implements OnDestroy {
    protected readonly formGroup: FormGroup;
    protected readonly newItem: boolean;

    protected readonly loadSensorTypesFn: () => Observable<OptionItem[]>;
    protected readonly searchDevicesFn: (
        searchString: string
    ) => Observable<OptionItem[]>;

    protected readonly _ngUnsubscribe: Subject<void>;

    constructor(
        private readonly _dialogRef: MatDialogRef<ManageSensorDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        private readonly _dialogData: ItemDialogData<Sensor>,
        private readonly _fb: FormBuilder,
        private readonly _deviceService: DeviceService,
        private readonly _sensorService: SensorService
    ) {
        const sensorType = this._dialogData.item?.sensorType ?? null;
        let type: OptionItem | null;
        if (sensorType === null) type = null;
        else if (typeof sensorType === 'object') {
            type = transformToOptionItem(sensorType);
        } else {
            type = createOptionItem(sensorType);
        }

        let device: OptionItem | null = null;
        if (this._dialogData.item?.device != null)
            device = transformToOptionItem(this._dialogData.item.device);

        this.formGroup = this._fb.group({
            name: new FormControl<string>(this._dialogData.item?.name ?? '', [
                Validators.required,
                Validators.minLength(3),
            ]),
            type: new FormControl<OptionItem | null>(type, Validators.required),
            alias: new FormControl<string>(this._dialogData.item?.alias ?? ''),
            libraryId: new FormControl<string>(
                this._dialogData.item?.libraryId ?? ''
            ),
            device: new FormControl<OptionItem | null>(
                device,
                Validators.required
            ),
        });
        this.newItem = this._dialogData.newItem;

        this._ngUnsubscribe = new Subject();

        this.loadSensorTypesFn = () => {
            return this._sensorService.getSensorTypes().pipe(
                takeUntil(this._ngUnsubscribe),
                map((types: SensorType[]) =>
                    types.map((type) => transformToOptionItem(type))
                )
            );
        };

        this.searchDevicesFn = (searchString: string) => {
            return this._deviceService.searchDevices(searchString).pipe(
                takeUntil(this._ngUnsubscribe),
                map((places: Device[]) =>
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

    private _createObject(): Sensor {
        const selectedSensorType = this.formGroup.get('type')?.value;
        let sensorType: string | SensorType;
        if (selectedSensorType.id === -1) sensorType = selectedSensorType.text;
        else
            sensorType = <SensorType>{
                id: selectedSensorType.id,
                name: selectedSensorType.text,
            };

        return <Sensor>{
            id: this._dialogData.item?.id,
            name: this.formGroup.get('name')?.value,
            sensorType,
            alias: this.formGroup.get('alias')?.value,
            libraryId: this.formGroup.get('libraryId')?.value,
            device: this.formGroup.get('device')?.value,
        };
    }
}
