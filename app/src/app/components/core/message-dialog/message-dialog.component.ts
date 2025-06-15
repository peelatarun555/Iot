import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

type MessageDialogData = {
    title: string;
    message: string;
    buttonLabel: string;
};

@Component({
    templateUrl: './message-dialog.component.html',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, MatIconModule, TranslateModule],
})
export class MessageDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: MessageDialogData) {}
}
