import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { Observable } from 'rxjs';
import { MemberProfileDetails } from '../models/MemberProfileDetails';
import { MembersService } from '../services/member.service';

@Component({
  selector: 'app-member-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatCardModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    ClipboardModule,
  ],
  templateUrl: './member-view-dialog.component.html',
  styleUrls: ['./member-view-dialog.component.scss'],
})
export class MemberViewDialogComponent implements OnInit {
  details$!: Observable<MemberProfileDetails>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { memberId: string },
    private membersService: MembersService,
    private clipboard: Clipboard
  ) {}

  ngOnInit(): void {
    console.log('[MemberViewDialog] carregar detalhes de', this.data.memberId);
    this.details$ = this.membersService.getDetails(this.data.memberId);
  }

  copy(text?: string | null): void {
    if (!text) 
      return;
    this.clipboard.copy(String(text));
  }
}