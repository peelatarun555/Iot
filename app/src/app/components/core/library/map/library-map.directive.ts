import {
    AfterViewInit,
    Directive,
    ElementRef,
    HostListener,
    signal,
    ViewChild,
    WritableSignal,
} from '@angular/core';
import { LibraryService } from '../../../../services/core/library.service';
import { BuildingLevel } from '../../../../models/enums/buildingLevel';
import { debounceTime, Subject } from 'rxjs';
import { SeatState } from '../../../../models/enums/seatState';
import { AuthService } from '../../../../services/auth.service';

@Directive({
    selector: '[duiLibraryDirective]',
    standalone: true,
})
export abstract class LibraryMapDirective implements AfterViewInit {
    protected readonly defaultColor: string;
    protected floor: BuildingLevel;
    protected svgRatio: number;
    protected svgHeight: WritableSignal<number>;
    protected svgWidth: WritableSignal<number>;
    protected marginLeft: WritableSignal<number>;
    protected intervalEnabled: number;
    private readonly _intervalIterations: number;
    @ViewChild('svgWrapper') private _svgWrapper!: ElementRef;
    private readonly _resizeSubject: Subject<void>;
    protected readonly isAdminUser: boolean =
        this.authService.role() === 'admin'; // Show tooltips if admin

    protected constructor(
        protected readonly libraryService: LibraryService,
        protected readonly authService: AuthService
    ) {
        this.defaultColor = libraryService.convertColor(SeatState.UNKNOWN);
        this._intervalIterations = 5;

        this.floor = BuildingLevel.GROUND;
        this.svgRatio = 0;

        this.svgHeight = signal(0);
        this.svgWidth = signal(0);
        this.marginLeft = signal(0);
        this.intervalEnabled = this._intervalIterations;

        this._resizeSubject = new Subject();

        this._resizeSubject.pipe(debounceTime(200)).subscribe(() => {
            this.intervalEnabled = this._intervalIterations;
            this.getFrameSize();
        });
    }

    @HostListener('window:resize', ['$event.target.innerWidth'])
    onResize() {
        this._resizeSubject.next();
    }

    ngAfterViewInit(): void {
        this.getFrameSize();
    }

    getColor(libraryId: string): string | undefined {
        return this.libraryService.getColor(libraryId);
    }

    getTooltip(libraryId: string): string {
        return this.libraryService.getTooltip(libraryId);
    }

    tableClick(libraryId: string) {
        console.log('Seat clicked: ', libraryId);
        // Future work: Issue #105, maybe #103: Open sidebar with information about ground/upper_seat_XY
    }

    protected getFrameSize() {
        const refreshInterval = setInterval(() => {
            if (this.intervalEnabled > 0) {
                const nativeElement = this._svgWrapper.nativeElement;
                if (
                    nativeElement.offsetHeight > 0 ||
                    nativeElement.offsetWidth > 0
                ) {
                    this.calculateSvgWidth(
                        nativeElement.offsetHeight,
                        nativeElement.offsetWidth
                    );
                    this.intervalEnabled -= 1;
                } else {
                    this.intervalEnabled = this._intervalIterations;
                }
            } else {
                clearInterval(refreshInterval);
            }
        }, 10);
    }

    protected calculateSvgWidth(height: number, width: number) {
        let newWidth: number;
        let newHeight: number;
        if (height * this.svgRatio <= width) {
            newWidth = height * this.svgRatio;
            newHeight = height;
        } else {
            newWidth = width;
            newHeight = width / this.svgRatio;
        }
        this.svgWidth.set(newWidth);
        this.svgHeight.set(newHeight);
        this.marginLeft.set((width - newWidth) / 2);
    }
}
