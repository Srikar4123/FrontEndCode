import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FinesService } from '../../../../Services/Fines.Services';

import { LoanDto } from '../../../../Models/Fines';

@Component({
  selector: 'app-history',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './history.html',

  styleUrls: ['./history.css'],
})
export class HistoryComponent implements OnInit {
  userId!: number;

  userName = '';

  loans: LoanDto[] = [];

  loading = false;

  error = '';

  constructor(
    private finesService: FinesService,

    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // SSR guard

    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('account');

    if (!stored) {
      this.error = 'User not logged in';

      return;
    }

    const user = JSON.parse(stored);

    this.userId = user.id;

    this.userName = user.userName;

    if (!this.userId) {
      this.error = 'Invalid user.';

      return;
    }

    this.loadLoans();
  }

  loadLoans(): void {
    this.loading = true;

    this.error = '';

    this.loans = [];

    this.finesService.getLoans({ userId: this.userId }).subscribe({
      next: (data) => {
        this.loans = data ?? [];

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        this.error = err?.error?.message ?? 'Failed to load your loan details.';

        this.loading = false;
      },
    });
  }

  trackLoan(_: number, loan: LoanDto) {
    return loan.id;
  }
}
