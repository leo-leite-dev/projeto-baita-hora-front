import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SideMenuComponent } from '../shared/nav/side-menu/side-menu.component';

@Component({
    selector: 'app-shell',
    standalone: true,
    imports: [RouterModule, SideMenuComponent],
    templateUrl: './shell.component.html',
    styleUrls: ['./shell.component.scss'],
})
export class ShellComponent { }