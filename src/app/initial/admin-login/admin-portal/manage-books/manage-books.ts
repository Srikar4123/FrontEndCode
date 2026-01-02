import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import {
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { BooksService } from '../../../../Services/Book.Services';
import { Books, BookDto } from '../../../../Models/Books';

// NEW: use your services
import { AccountsService } from '../../../../Services/Accounts.Services';
import { FinesService } from '../../../../Services/Fines.Services';
import { Account, AccountRole } from '../../../../Models/Accounts';
import { AdminIssueDto } from '../../../../Models/Fines';

@Component({
  selector: 'app-manage-books',
  standalone: true,
  templateUrl: './manage-books.html',
  styleUrls: ['./manage-books.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class ManageBooksComponent implements OnInit, AfterViewInit {
  books: Books[] = [];
  loading = false;

  // Filter
  genre = 'All';
  genresPreset: string[] = [
    'All',
    'Fiction',
    'Non-Fiction',
    'Mystery',
    'Fantasy',
    'Sci-Fi',
    'Biography',
  ];

  // Create
  showCreate = false;
  createForm: FormGroup;

  // Edit
  editingId: number | null = null;
  editingForm: FormGroup | null = null;

  toastMessage: string | null = null;

  // reference to the filter popover in HTML:
  @ViewChild('filterDetails') filterDetails?: ElementRef;

  // =========================
  // NEW: Issue modal state
  // =========================
  issueModalOpen = false;
  selectedBook: Books | null = null;
  userSearchTerm = '';
  users: Account[] = [];
  selectedUserId: number | null = null;
  issuing = false;
  issueError: string | null = null;
  defaultLoanDays = 7; // due date = today + 14 days by default
  // ⚠️ Replace with real admin id from your auth/session
  currentAdminId = 1;

  constructor(
    private fb: FormBuilder,
    private booksService: BooksService,
    private accountsService: AccountsService,
    private finesService: FinesService,
    private router: Router
  ) {
    this.createForm = this.fb.group(
      {
        title: ['', [Validators.required]],
        description: [''],
        author: ['', [Validators.required]],
        imageUrl: [''],
        price: [0, [Validators.required, Validators.min(0)]],
        genre: ['', [Validators.required]],
        totalCopies: [0, [Validators.required, Validators.min(0)]],
        availableCopies: [0, [Validators.required, Validators.min(0)]],
        publishedYear: ['', Validators.required],
      },
      { validators: this.availableNotExceedTotal }
    );
  }

  ngOnInit(): void {
    const raw = localStorage.getItem('admin');

    if (!raw) {
      this.issueError = 'Admin session expired. Please login again.';

      return;
    }

    const admin = JSON.parse(raw);

    if (!admin?.accountId) {
      this.issueError = 'Invalid admin session. Please login again.';

      return;
    }

    this.currentAdminId = Number(admin.accountId);

    console.log('Logged in admin:', this.currentAdminId);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.load(), 0);
  }

  /** Cross-field validator: availableCopies <= totalCopies */
  availableNotExceedTotal(group: AbstractControl): ValidationErrors | null {
    const total = Number(group.get('totalCopies')?.value ?? 0);
    const avail = Number(group.get('availableCopies')?.value ?? 0);
    return avail > total ? { copiesRange: true } : null;
  }

  /** Load all books, optionally filtered by genre */
  load(): void {
    this.loading = true;
    const filter = this.genre && this.genre !== 'All' ? this.genre.trim() : undefined;
    this.booksService.getAll(filter).subscribe({
      next: (res) => {
        this.books = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  applyFilter(): void {
    this.load();
    this.closeFilterPanel();
  }

  clearFilter(): void {
    this.genre = 'All';
    this.load();
    this.closeFilterPanel();
  }

  onGenreChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.genre = value;
  }

  private closeFilterPanel(): void {
    if (this.filterDetails?.nativeElement?.open) {
      this.filterDetails.nativeElement.open = false;
    }
  }

  onFilterSummaryClick(_event: MouseEvent): void {
    if (this.showCreate) {
      this.showCreate = false;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const detailsEl = this.filterDetails?.nativeElement;
    if (!detailsEl) return;
    const clickTarget = event.target as Node;
    const clickedInsideFilter = detailsEl.contains(clickTarget);
    if (detailsEl.open && !clickedInsideFilter) {
      detailsEl.open = false;
    }
  }

  toggleCreate(): void {
    this.closeFilterPanel();
    this.showCreate = !this.showCreate;
    if (this.showCreate) {
      this.createForm.reset({
        title: '',
        description: '',
        author: '',
        imageUrl: '',
        price: 0,
        genre: '',
        totalCopies: 0,
        availableCopies: 0,
        publishedYear: '',
      });
    }
  }

  /** Add book (POST) — optimistic UI */
  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const v = this.createForm.value;
    const payload: BookDto = {
      title: v.title!,
      description: v.description ?? '',
      author: v.author!,
      imageUrl: (v.imageUrl ?? '').trim() || null,
      price: Number(v.price),
      genre: v.genre!,
      totalCopies: Number(v.totalCopies),
      availableCopies: Math.min(Number(v.availableCopies), Number(v.totalCopies)),
      publishedYear: String(v.publishedYear),
    };

    this.booksService.create(payload).subscribe({
      next: (created) => {
        alert(`Book "${created.title}" added successfully!`);
        this.showCreate = false;
        this.createForm.reset({
          title: '',
          description: '',
          author: '',
          imageUrl: '',
          price: 0,
          genre: '',
          totalCopies: 0,
          availableCopies: 0,
          publishedYear: '',
        });
        this.books = [created, ...this.books];
      },
      error: (err) => alert(err?.error?.message ?? 'Add failed'),
    });
  }

  startEdit(book: Books): void {
    this.editingId = book.id;
    this.editingForm = this.fb.group(
      {
        title: [book.title, [Validators.required]],
        description: [book.description ?? ''],
        author: [book.author, [Validators.required]],
        imageUrl: [book.imageUrl ?? ''],
        price: [book.price, [Validators.required, Validators.min(0)]],
        genre: [book.genre, [Validators.required]],
        totalCopies: [book.totalCopies, [Validators.required, Validators.min(0)]],
        availableCopies: [book.availableCopies, [Validators.required, Validators.min(0)]],
        publishedYear: [book.publishedYear, Validators.required],
      },
      { validators: this.availableNotExceedTotal }
    );
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editingForm = null;
  }

  /** Save inline edit (PUT) — optimistic update */
  saveEdit(bookId: number): void {
    if (!this.editingForm) return;
    if (this.editingForm.invalid) {
      this.editingForm.markAllAsTouched();
      return;
    }
    const v = this.editingForm.value;
    const payload: BookDto = {
      title: v.title!,
      description: v.description ?? '',
      author: v.author!,
      imageUrl: (v.imageUrl ?? '').trim() || null,
      price: Number(v.price),
      genre: v.genre!,
      totalCopies: Number(v.totalCopies),
      availableCopies: Math.min(Number(v.availableCopies), Number(v.totalCopies)),
      publishedYear: String(v.publishedYear),
    };
    this.booksService.update(bookId, payload).subscribe({
      next: () => {
        alert('Updated.');
        this.books = this.books.map((b) => (b.id === bookId ? { ...b, ...payload } : b));
        this.cancelEdit();
      },
      error: (err) => alert(err?.error?.message ?? 'Update failed'),
    });
  }

  /** Delete a book (DELETE) — optimistic */
  delete(book: Books): void {
    if (!confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    this.booksService.delete(book.id).subscribe({
      next: () => {
        alert('Deleted.');
        this.books = this.books.filter((b) => b.id !== book.id);
      },
      error: (err) => alert(err?.error?.message ?? 'Delete failed'),
    });
  }

  /** Image fallback */
  onImgError(evt: Event) {
    const img = evt.target as HTMLImageElement;
    img.onerror = null;
    img.src = 'https://via.placeholder.com/220x330?text=No+Image';
  }

  // ==============================================
  // NEW: Click card -> open issue modal
  // ==============================================

  openIssueModal(book: Books): void {
    this.selectedBook = book;
    this.issueModalOpen = true;
    this.issueError = null;
    this.users = [];
    this.selectedUserId = null;
    this.userSearchTerm = '';
  }

  closeIssueModal(): void {
    this.issueModalOpen = false;
    this.selectedBook = null;
    this.selectedUserId = null;
    this.users = [];
    this.userSearchTerm = '';
    this.issueError = null;
  }

  // Esc key closes modal
  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.issueModalOpen) this.closeIssueModal();
  }

  // Search users using AccountsService (role filter + search term)
  onUserSearchInput(term: string): void {
    this.userSearchTerm = term;
    this.issueError = null;

    const q = term.trim();
    if (q.length < 2) {
      this.users = [];
      return;
    }

    this.accountsService.getAll({ role: AccountRole.User, search: q }).subscribe({
      next: (res) => (this.users = res),
      error: () => (this.users = []),
    });
  }

  selectUser(acc: Account): void {
    this.selectedUserId = acc.id;
    this.issueError = null;
  }

  // Issue the selected book to the selected user (Admin flow) using FinesService
  issueSelectedBook(): void {
    if (!this.selectedBook || !this.selectedUserId || !this.currentAdminId) {
      this.issueError = 'Invalid issue request';
      return;
    }

    this.issuing = true;

    const dto: AdminIssueDto = {
      adminId: this.currentAdminId, // 👈 THIS is what proves admin identity

      userId: this.selectedUserId!,

      bookId: this.selectedBook!.id,

      issueDate: new Date().toISOString(),

      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    this.finesService.adminIssue(dto).subscribe({
      next: (res) => {
        const id = this.selectedBook!.id;

        this.books = this.books.map((b) =>
          b.id === id ? { ...b, availableCopies: res.availableCopies } : b
        );

        this.selectedBook!.availableCopies = res.availableCopies;

        alert('Book issued successfully');

        this.closeIssueModal();
      },

      error: (err) => {
        this.issueError = err?.error?.message ?? 'Issue failed';
      },
    });
  }

  // Optional: still available if you want to navigate elsewhere
  openDetail(book: Books): void {
    this.router.navigate(['/books', book.id]);
  }

  trackById(_index: number, item: Books): number {
    return item.id;
  }

  private showToast(msg: string, ms = 2500) {
    this.toastMessage = msg;
    setTimeout(() => (this.toastMessage = null), ms);
  }
}
