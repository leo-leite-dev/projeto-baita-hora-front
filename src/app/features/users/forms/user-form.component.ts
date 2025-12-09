import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormGenericModule } from '../../../../shareds/common/FormGenericModule';

export type UserForm = {
    email: FormControl<string>;
    username: FormControl<string>;
};

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [FormGenericModule],
    templateUrl: './user-form.component.html',
    styleUrl: './user-form.component.scss'
})
export class UserFormComponent {
    @Input({ required: true }) group!: FormGroup<UserForm>;
    @Input() locked = false;
    @Input() editableKeys: string[] = [];
}