/**
 * The campus maps main component. Implements and handles the click event.
 * Still have to implement the click redirecting to the buildings subpage.
 * For me this map was a "fancy selection screen" but there also were ideas like
 * taking the SVG and making it into an interactive map, zoomable, with sensors
 * dynamically added via coords.
 */
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    Renderer2,
} from '@angular/core';

@Component({
    selector: 'dui-campus-map',
    standalone: true,
    imports: [],
    templateUrl: './campus_map.svg',
    styleUrl: './campus-map.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampusMapComponent implements AfterViewInit, OnDestroy {
    private listeners: (() => void)[] = [];

    constructor(
        private renderer: Renderer2,
        private el: ElementRef
    ) {}

    handleGroupClick(group: Event) {
        // Usually the "visual" element is the clicks target
        // a group is not visible, but can be fetched with the currentTarget attribute
        const currentTarget: SVGElement = group.currentTarget as SVGElement;
        console.log(currentTarget.getAttribute('id'));
        // Future work: Issues #112: Go to subpage by string "building_X", where x is the buildings letter
        // These page can then contain the graphs to show per building/room data
    }

    ngAfterViewInit() {
        // Add click event to each building group
        const svgContainer = this.el.nativeElement.querySelector('#campus_map');
        const svgGroups = svgContainer.querySelectorAll('.cls-hover');

        svgGroups.forEach((group: SVGElement) => {
            const listener = this.renderer.listen(
                group,
                'click',
                this.handleGroupClick
            );
            this.listeners.push(listener);
        });
    }

    ngOnDestroy(): void {
        this.listeners.forEach((removeListener) => removeListener());
    }
}
