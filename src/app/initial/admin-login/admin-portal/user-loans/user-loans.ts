import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { FinesService } from '../../../../Services/Fines.Services';
import { FineLoan } from '../../../../Models/Fines';

interface UserLoanSummary {
  userId: number;
  userName: string;
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  unpaidFineCount: number;
  totalOutstanding: number;
}

@Component({
  selector: 'app-user-loans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-loans.html',
  styleUrls: ['./user-loans.css'],
})
export class UserLoansComponent implements OnInit {
  summaries$ = new BehaviorSubject<UserLoanSummary[]>([]);
  loading = false;
  error = '';

  constructor(
    private readonly finesService: FinesService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    // this.finesService
    //   .getLoans()
    //   .pipe(
    //     finalize(() => {
    //       this.loading = false;
    //       this.cdr.markForCheck();
    //     })
    //   )
    //   .subscribe({
    //     next: (loans) => {
    //       const summaries = this.buildSummary(loans);
    //       this.summaries$.next(summaries);
    //     },
    //     error: (err) => {
    //       this.error = err?.error?.message || 'Failed to load loan summary';
    //     },
    //   });
  }

  private buildSummary(loans: FineLoan[]): UserLoanSummary[] {
    const map = new Map<number, UserLoanSummary>();
    const today = new Date();

    for (const loan of loans) {
      if (!map.has(loan.userId)) {
        map.set(loan.userId, {
          userId: loan.userId,
          userName: loan.userName,
          totalLoans: 0,
          activeLoans: 0,
          overdueLoans: 0,
          unpaidFineCount: 0,
          totalOutstanding: 0,
        });
      }

      const summary = map.get(loan.userId)!;
      summary.totalLoans++;

      if (!loan.returnDate) {
        summary.activeLoans++;
        const due = new Date(loan.dueDate);
        if (!isNaN(due.getTime()) && due < today) {
          summary.overdueLoans++;
        }
      }

      if (!loan.paymentStatus && loan.fineAmount > 0) {
        summary.unpaidFineCount++;
        summary.totalOutstanding += loan.fineAmount;
      }
    }

    return Array.from(map.values());
  }

  viewUserLoans(userId: number): void {
    this.router.navigate(['/user-loans'], {
      queryParams: { userId },
    });
  }

  trackByUserId(_: number, item: UserLoanSummary): number {
    return item.userId;
  }
}
