import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BulkSelectDirective } from '../../app/shared/directives/bulk-select.directive';
import { BulkToolbarComponent } from '../../app/shared/components/bulk-toolbar/ui/bulk-toolbar.component';
import { LinkButtonComponent } from '../../app/shared/components/buttons/link-button/link-button.component';

@NgModule({
    imports: [
        CommonModule,
        MatTableModule,
        MatSortModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        BulkSelectDirective,
        BulkToolbarComponent,
        LinkButtonComponent,
    ],
    exports: [
        CommonModule,
        MatTableModule,
        MatSortModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        BulkSelectDirective,
        BulkToolbarComponent,
        LinkButtonComponent,
    ],
})
export class MatTableGenericModule { }