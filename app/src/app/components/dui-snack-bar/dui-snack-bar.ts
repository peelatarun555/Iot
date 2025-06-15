import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import SnackBarType from './utils/SnackBarType';
import DuiSnackBarComponent from './dui-snack-bar.component';
import SnackBarData from './utils/SnackBarData';

@Injectable({
    providedIn: 'root',
})
export default class DuiSnackBar {
    constructor(private readonly _snackBar: MatSnackBar) {}

    public open(
        severity: SnackBarType,
        message: string,
        duration: number = 5000
    ) {
        let severityClass = '';

        switch (severity) {
            case SnackBarType.INFO:
                severityClass = 'info';
                break;
            case SnackBarType.WARNING:
                severityClass = 'warning';
                break;
            case SnackBarType.ERROR:
                severityClass = 'error';
                break;
        }

        this._snackBar.openFromComponent(DuiSnackBarComponent, {
            data: <SnackBarData>{
                message,
                icon: severityClass,
            },
            duration: duration,
            horizontalPosition: 'end',
            panelClass: ['custom-snack-bar', `snack-bar-${severityClass}`],
        });
    }
}
