import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { BooksService } from '../../../../Services/Book.Services';

// 👉 Adjust this import path to your actual model file location.
import { Books, BookDto } from '../../../../Models/Books';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-books',
  templateUrl: './manage-books.html',
  styleUrls: ['./manage-books.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class ManageBooksComponent implements OnInit {
  // Data
  books: Books[] = [];
  loading = false;
  // Genre filter (free text + optional preset usage in HTML)
  genre = '';
  genresPreset: string[] = ['Fiction', 'Non-Fiction', 'Mystery', 'Fantasy', 'Sci-Fi', 'Biography'];

  // Create form state
  showCreate = false;
  createForm: FormGroup;

  // Inline edit state
  editingId: number | null = null;
  editingForm: FormGroup | null = null;
  title: any;

  constructor(private fb: FormBuilder, private booksService: BooksService) {
    // Create form (uses BookDto shape)
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
      },
      { validators: this.availableNotExceedTotal }
    );
  }

  ngOnInit(): void {
    this.load(); // initial fetch
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
    const filter = this.genre?.trim() || undefined;
    this.booksService.getAll(filter).subscribe({
      next: (res) => {
        this.books = res;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        alert(err?.error?.message ?? 'Failed to load books');
      },
    });
  }

  /** Clear the genre filter and reload */
  clearFilter(): void {
    this.genre = '';
    this.load();
  }

  /** Toggle "Add Book" form */
  toggleCreate(): void {
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
      });
    }
  }

  /** Create book (POST) */
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
      // clamp to enforce rule: availableCopies <= totalCopies
      availableCopies: Math.min(Number(v.availableCopies), Number(v.totalCopies)),
    };

    this.booksService.create(payload).subscribe({
      next: (created) => {
        alert(`Created book #${created.id}`);
        this.showCreate = false;
        this.load(); // refresh list
      },
      error: (err) => alert(err?.error?.message ?? 'Create failed'),
    });
  }

  /** Start inline edit for a given row */
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
      },
      { validators: this.availableNotExceedTotal }
    );
  }

  /** Cancel inline edit */
  cancelEdit(): void {
    this.editingId = null;
    this.editingForm = null;
  }

  /** Save inline edit (PUT) */
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
      availableCopies: Math.min(Number(v.availableCopies), Number(v.totalCopies)), // clamp
    };

    this.booksService.update(bookId, payload).subscribe({
      next: () => {
        alert('Updated.');
        this.cancelEdit();
        this.load(); // preserve current filter
      },
      error: (err) => alert(err?.error?.message ?? 'Update failed'),
    });
  }

  /** Delete a book (DELETE) */
  delete(book: Books): void {
    if (!confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    this.booksService.delete(book.id).subscribe({
      next: () => {
        alert('Deleted.');
        this.load();
      },
      error: (err) => alert(err?.error?.message ?? 'Delete failed'),
    });
  }

  /** Optional trackBy for *ngFor performance */
  trackById(_index: number, item: Books): number {
    return item.id;
  }
}
