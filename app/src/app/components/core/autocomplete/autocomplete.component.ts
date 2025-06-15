import {
    ControlValueAccessor,
    FormControl,
    FormsModule,
    NgControl,
    ReactiveFormsModule,
    TouchedChangeEvent,
    Validators,
} from '@angular/forms';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    Injector,
    Input,
    OnInit,
    Optional,
    Self,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
    MatAutocompleteModule,
    MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, Observable } from 'rxjs';
import { createOptionItem } from '../../../helpers/create-option-item';
import { OptionItem } from '../../../models/core';

@Component({
    selector: 'dui-autocomplete[label]',
    templateUrl: './autocomplete.component.html',
    styleUrls: ['./autocomplete.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatFormFieldModule,
        MatAutocompleteModule,
        MatInputModule,
        MatProgressSpinnerModule,
        FormsModule,
        TranslateModule,
        ReactiveFormsModule,
    ],
})
export class AutocompleteComponent
    implements OnInit, ControlValueAccessor, AfterViewInit
{
    @Input() public label!: string;
    @Input() public preload: boolean;
    @Input() public restricted: boolean;
    @Input() public loadFn!: () => Observable<OptionItem[]>;
    @Input() public searchFn!: (
        searchString: string
    ) => Observable<OptionItem[]>;
    protected readonly notFoundMsg: string;
    protected readonly requiredMsg: string;
    protected searchCtrl: FormControl<string | null>;
    protected disabled: boolean;
    protected isLoading: boolean;
    protected hasItems: Signal<boolean>;
    protected filteredItems: WritableSignal<OptionItem[]>;
    private _onChange: (item: OptionItem | null) => void;
    private _onTouched: () => void;

    private _touched: boolean;
    private _selectedItem: OptionItem | null;
    private _items: OptionItem[];

    constructor(
        @Optional() @Self() private ngControl: NgControl,
        private readonly _injector: Injector
    ) {
        if (this.ngControl) this.ngControl.valueAccessor = this;

        this.preload = true;
        this.restricted = true;

        this.notFoundMsg = 'autocomplete.notFoundMsg';
        this.requiredMsg = 'autocomplete.requiredMsg';

        this.searchCtrl = new FormControl('');
        this.disabled = false;
        this.isLoading = false;
        this.filteredItems = signal([]);

        this._onChange = () => {};
        this._onTouched = () => {};

        this._touched = false;
        this._selectedItem = null;
        this._items = [];

        this.hasItems = computed(() => this.filteredItems().length > 0);
    }

    protected get value(): OptionItem | null {
        return this._selectedItem;
    }

    protected set value(item: OptionItem | null) {
        this._initItem(item);
        this._onChange(item);
    }

    protected get searchString(): string {
        return this.searchCtrl.value ?? '';
    }

    ngOnInit() {
        if (this.ngControl.control?.hasValidator(Validators.required))
            this.searchCtrl.addValidators(Validators.required);

        if (this.preload && this.loadFn == null)
            throw new Error(
                'Autocomplete component cannot be used. loadFn function is not defined'
            );
        if (!this.preload && this.searchFn == null)
            throw new Error(
                'Autocomplete component cannot be used. searchFn function is not defined'
            );

        if (this.preload) {
            this.isLoading = true;
            this.searchCtrl.disable();
            this.loadFn()
                .subscribe({
                    next: (items) => {
                        this._items = items;
                        this.filteredItems.set([...items]);
                    },
                })
                .add(() => {
                    this.isLoading = false;
                    if (!this.disabled) this.searchCtrl.enable();
                });
        }
    }

    ngAfterViewInit() {
        // Mark as touched to trigger validation
        this._injector.get(NgControl).control!.events.subscribe((event) => {
            if (event instanceof TouchedChangeEvent) {
                this._touched = event.touched;
                this.searchCtrl.markAsTouched();
            }
        });
    }

    writeValue(item: OptionItem): void {
        this._initItem(item);
    }

    registerOnChange(onChange: any): void {
        this._onChange = onChange;
    }

    registerOnTouched(onTouched: any): void {
        this._onTouched = onTouched;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    public filterItems(): void {
        if (!this.preload) {
            if ((this.searchCtrl.value?.length ?? 0) > 2) {
                this.isLoading = true;
                this.searchFn(this.searchString)
                    .pipe(debounceTime(200))
                    .subscribe({
                        next: (items) => {
                            this._items = items;
                            this.filteredItems.set([...items]);
                        },
                    })
                    .add(() => (this.isLoading = false));
            } else {
                this._items = [];
                this.filteredItems.set([]);
            }
        } else {
            this.filteredItems.set(
                this._items.filter((x) =>
                    x.text
                        .toLocaleLowerCase()
                        .includes(this.searchString.toLocaleLowerCase())
                )
            );
        }
    }

    public selectItem(event?: MatAutocompleteSelectedEvent): void {
        if (event != null) {
            this.value = event.option.value;
            this._markAsTouched();
            return;
        }

        if (this.searchString.length === 0) this.value = null;
        else {
            const item = this._items.find(
                (x) =>
                    x.text.toLocaleLowerCase() ===
                    this.searchString.toLocaleLowerCase()
            );
            if (item != null) {
                this.value = item;
            } else if (!this.restricted) {
                this.value = createOptionItem(this.searchString);
            } else {
                this.value = null;
                this.searchCtrl.setValue('');
            }
        }
        this._markAsTouched();
    }

    public displayFn(item: OptionItem | string) {
        if (typeof item === 'string') return item;
        return item?.text ?? '';
    }

    private _markAsTouched() {
        if (!this._touched) {
            this._onTouched();
            this._touched = true;
        }
    }

    private _initItem(item: OptionItem | null): void {
        this._selectedItem = item;
        this.searchCtrl.setValue(item?.text ?? '');
    }
}
