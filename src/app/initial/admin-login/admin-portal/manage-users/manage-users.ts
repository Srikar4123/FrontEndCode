import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { AccountsService } from '../../../../Services/Accounts.Services';
import {
  Account,
  AccountCreateDto,
  AccountUpdateDto,
  AccountRole,
} from '../../../../Models/Accounts';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { finalize, filter } from 'rxjs/operators';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  templateUrl: './manage-users.html',
  styleUrls: ['./manage-users.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
})
export class ManageUsersComponent implements OnInit {
  // Stream-based state
  accounts$ = new BehaviorSubject<Account[]>([]);
  loading = false;
  error = '';

  // Filters
  roleFilter: '' | AccountRole | string = '';
  searchQuery = '';

  // Create modal state
  createOpen = false;
  creating = false;
  createModel: AccountCreateDto = {
    userName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: AccountRole.User,
    // isActive optional
  };

  // Edit state
  editId: number | null = null;
  editModel: AccountUpdateDto = {
    userName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: AccountRole.User,
    isActive: true,
  };

  // Expose enum to template (optional)
  AccountRole = AccountRole;

  constructor(
    private readonly service: AccountsService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();

    // Re-load when the route is re-entered (e.g., navigating back here)
    this.router.events.pipe(filter((ev) => ev instanceof NavigationEnd)).subscribe(() => {
      this.load();
    });
  }

  load(): void {
    this.error = '';
    this.loading = true;

    const roleParam = this.roleFilter === '' ? undefined : this.roleFilter;
    const searchParam = this.searchQuery?.trim() || undefined;

    this.service
      .getAll({ role: roleParam, search: searchParam })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck(); // ensure change detection picks it up
        })
      )
      .subscribe({
        next: (data) => this.accounts$.next(data ?? []),
        error: (err) => (this.error = this.extractError(err, 'Failed to load accounts.')),
      });
  }

  // Modal: open/close
  openCreateModal(): void {
    this.error = '';
    this.createOpen = true;
    this.createModel = {
      userName: '',
      email: '',
      password: '',
      phoneNumber: '',
      role: AccountRole.User,
    };
  }
  closeCreateModal(): void {
    this.createOpen = false;
  }

  // Create confirm
  confirmCreate(): void {
    if (
      !this.createModel.userName ||
      !this.createModel.email ||
      !this.createModel.password ||
      !this.createModel.phoneNumber ||
      this.createModel.role === undefined ||
      this.createModel.role === null
    ) {
      this.error = 'All fields are required for create.';
      return;
    }
    this.error = '';
    this.creating = true;

    this.service
      .create(this.createModel)
      .pipe(finalize(() => (this.creating = false)))
      .subscribe({
        next: () => {
          this.createOpen = false;
          this.load();
        },
        error: (err) => (this.error = this.extractError(err, 'Create failed.')),
      });
  }

  // Inline edit
  startEdit(acc: Account): void {
    this.editId = acc.id;
    this.editModel = {
      userName: acc.userName,
      email: acc.email,
      password: acc.password,
      phoneNumber: acc.phoneNumber,
      role: acc.role,
      isActive: acc.isActive,
    };
  }
  cancelEdit(): void {
    this.editId = null;
  }
  saveEdit(id: number): void {
    if (
      !this.editModel.userName ||
      !this.editModel.email ||
      !this.editModel.password ||
      !this.editModel.phoneNumber ||
      this.editModel.role === undefined ||
      this.editModel.role === null
    ) {
      this.error = 'All fields are required for update (including Active).';
      return;
    }
    this.error = '';
    this.service.update(id, this.editModel).subscribe({
      next: () => {
        this.editId = null;
        this.load();
      },
      error: (err) => (this.error = this.extractError(err, 'Update failed.')),
    });
  }

  remove(id: number): void {
    if (!confirm(`Delete account #${id}?`)) return;
    this.error = '';
    this.service.delete(id).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = this.extractError(err, 'Delete failed.')),
    });
  }

  deactivate(id: number): void {
    this.error = '';
    this.service.deactivate(id).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = this.extractError(err, 'Deactivate failed.')),
    });
  }

  activate(id: number): void {
    this.error = '';
    this.service.activate(id).subscribe({
      next: () => this.load(), // Refresh the list after activation
      error: (err) => {
        this.error = this.extractError(err, 'Activate failed.');
      },
    });
  }

  roleLabel(role: AccountRole): string {
    return role === AccountRole.Admin ? 'Admin' : 'User';
  }

  trackById(_: number, acc: Account) {
    return acc.id;
  }

  private extractError(err: any, fallback: string): string {
    const msg = err?.error?.message || err?.message || '';
    return msg ? `${fallback} ${msg}` : fallback;
  }

  @ViewChild('createDialog') createDialog!: ElementRef<HTMLDialogElement>;
  creatingDialog = false;

  openCreateModalDialog(): void {
    this.error = '';
    // Reset the form model
    this.createModel = {
      userName: '',
      email: '',
      password: '',
      phoneNumber: '',
      role: AccountRole.User,
      // isActive optional
    };
    this.creating = false;

    // Open as modal for proper backdrop & focus
    this.createDialog?.nativeElement.showModal();
  }

  closeCreateModalDialog(): void {
    try {
      this.createDialog?.nativeElement.close();
    } catch {
      /* ignore */
    }
    this.creating = false;
  }

  confirmCreateDialog(): void {
    // Guard
    if (
      !this.createModel.userName ||
      !this.createModel.email ||
      !this.createModel.password ||
      !this.createModel.phoneNumber ||
      this.createModel.role === undefined ||
      this.createModel.role === null
    ) {
      this.error = 'All fields are required for create.';
      return;
    }

    this.error = '';
    this.creating = true;

    this.service
      .create(this.createModel)
      .pipe(finalize(() => (this.creating = false)))
      .subscribe({
        next: () => {
          // Close dialog only on success
          this.closeCreateModalDialog();
          // Refresh the list
          this.load();
        },
        error: (err) => {
          // Keep dialog open, show the error
          this.error = this.extractError(err, 'Create failed.');
        },
      });
  }

  // openCreateModalDialog(): void {
  //   this.error = '';
  //   this.createModel = {
  //     userName: '',
  //     email: '',
  //     password: '',
  //     phoneNumber: '',
  //     role: AccountRole.User,
  //   };
  //   // Open as modal for proper backdrop/focus trap
  //   this.createDialog.nativeElement.showModal();
  //   this.createOpen = true;
  // }

  // closeCreateModalDialog(): void {
  //   // Close the dialog
  //   try {
  //     this.createDialog.nativeElement.close();
  //   } catch {}
  //   this.createOpen = false;
  // }
}
