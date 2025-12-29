import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountsService } from '../../../../Services/Accounts.Services';
import { FinesService } from '../../../../Services/Fines.Services';
import { Account, AccountRole } from '../../../../Models/Accounts';
import { FineLoan, ReturnDto, PayFineDto } from '../../../../Models/Fines';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-loans',
  templateUrl: './user-loans.html',
  styleUrls: ['./user-loans.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class UserLoansComponent implements OnInit {
  // Route state
  userId!: number;
  userNameFromQuery = '';

  // User header
  user: Account | null = null;
  userLoading = false;
  userError = '';

  // Loans/fines
  loans: FineLoan[] = [];
  loansLoading = false;
  loansError = '';

  // Stats
  activeLoans = 0;
  canBorrow = true;
  totalOutstanding = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly accounts: AccountsService,
    private readonly fines: FinesService
  ) {}

  ngOnInit(): void {
    // Read route params: /admin/users/:id/loans?userName=...
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.userNameFromQuery = String(this.route.snapshot.queryParamMap.get('userName') || '');

    if (!this.userId || Number.isNaN(this.userId)) {
      this.userError = 'Invalid user id in route.';
      return;
    }

    this.loadUser();
    this.loadLoansAndStats();
  }

  // ---- Loaders ----
  loadUser(): void {
    this.userLoading = true;
    this.userError = '';
    this.accounts.getById(this.userId).subscribe({
      next: (acc) => {
        this.user = acc;
        this.userLoading = false;
      },
      error: (err) => {
        this.userError = this.extractError(err, 'Failed to load user.');
        this.userLoading = false;
      },
    });
  }

  loadLoansAndStats(): void {
    this.loansLoading = true;
    this.loansError = '';

    // Loans list
    this.fines.getLoans({ userId: this.userId }).subscribe({
      next: (data) => {
        this.loans = data ?? [];
        this.loansLoading = false;
      },
      error: (err) => {
        this.loansError = this.extractError(err, 'Failed to load loans.');
        this.loansLoading = false;
      },
    });

    // Active count
    this.fines.getActiveCount(this.userId).subscribe({
      next: (stats) => {
        this.activeLoans = stats?.activeLoans ?? 0;
        this.canBorrow = !!stats?.canBorrow;
      },
      error: (err) => {
        this.loansError = this.extractError(err, 'Failed to load active count.');
      },
    });

    // Outstanding total
    this.fines.getOutstanding(this.userId).subscribe({
      next: (res) => {
        this.totalOutstanding = res?.totalOutstanding ?? 0;
      },
      error: (err) => {
        this.loansError = this.extractError(err, 'Failed to load outstanding total.');
      },
    });
  }

  // ---- Actions ----
  returnLoan(loan: FineLoan): void {
    if (!confirm(`Return loan #${loan.id} for book #${loan.bookId}?`)) return;
    const dto: ReturnDto = { loanId: loan.id };
    this.fines.returnLoan(dto).subscribe({
      next: () => this.loadLoansAndStats(),
      error: (err) => {
        this.loansError = this.extractError(err, 'Return failed.');
      },
    });
  }

  payFine(loan: FineLoan): void {
    const min = loan.fineAmount ?? 0;
    const input = prompt(`Enter amount to pay (>= outstanding fine ${min}):`, String(min));
    if (input === null) return;
    const amount = Number(input);
    if (Number.isNaN(amount) || amount < min) {
      alert('Amount must be a number and >= outstanding fine.');
      return;
    }
    const dto: PayFineDto = { loanId: loan.id, amount };
    this.fines.payFine(dto).subscribe({
      next: () => this.loadLoansAndStats(),
      error: (err) => {
        this.loansError = this.extractError(err, 'Payment failed.');
      },
    });
  }

  // ---- Helpers ----
  roleLabel(role: AccountRole | number | string | undefined): string {
    if (role === 1 || role === AccountRole.Admin) return 'Admin';
    return 'User';
  }
  isActiveLoan(loan: FineLoan): boolean {
    return !loan.returnDate;
  }
  isOverdue(loan: FineLoan): boolean {
    const nowIso = new Date().toISOString();
    return !loan.returnDate && loan.dueDate < nowIso;
  }
  isUnpaid(loan: FineLoan): boolean {
    return (loan.fineAmount ?? 0) > 0 && !loan.paymentStatus;
  }
  statusLabels(loan: FineLoan): string[] {
    const labels: string[] = [];
    if (this.isActiveLoan(loan)) labels.push('Active');
    if (this.isOverdue(loan)) labels.push('Overdue');
    if (!this.isActiveLoan(loan)) labels.push('Returned');
    if (this.isUnpaid(loan)) labels.push('Unpaid');
    if ((loan.fineAmount ?? 0) > 0 && loan.paymentStatus) labels.push('Paid');
    return labels;
  }
  displayName(): string {
    return this.user?.userName || this.userNameFromQuery || `User #${this.userId}`;
  }
  backToUsers(): void {
    this.router.navigateByUrl('/admin/manage-users');
  }
  private extractError(err: any, fallback: string): string {
    const msg = err?.error?.message || err?.message || '';
    return msg ? `${fallback} ${msg}` : fallback;
  }
}
``;
