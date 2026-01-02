import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { BooksService } from '../../../../Services/Book.Services';

import { FinesService } from '../../../../Services/Fines.Services';

import { Books } from '../../../../Models/Books';

import { BorrowDto, ReturnDto, LoanDto } from '../../../../Models/Fines';

@Component({
  selector: 'app-browse-books',

  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './browse-books.html',

  styleUrls: ['./browse-books.css'],
})
export class BrowseBooksComponent implements OnInit {
  books: Books[] = [];

  filteredBooks: Books[] = [];

  loans: LoanDto[] = [];
  allActiveLoans: LoanDto[] = [];

  genre = 'All';

  genresPreset: string[] = [
    'All',
    'Fiction',
    'Non-Fiction',
    'Mystery',
    'Fantasy',
    'Sci-Fi',
    'Biography',
    'Technology',
    'Computer Science',
  ];

  search = '';

  userId!: number;

  constructor(
    private booksService: BooksService,

    private finesService: FinesService
  ) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('account');
    if (!raw) return;
    this.userId = JSON.parse(raw).accountId;
    this.loadBooks();
    this.loadLoans();
  }

  loadBooks() {
    const g = this.genre !== 'All' ? this.genre : undefined;

    this.booksService.getAll(g).subscribe((res) => {
      this.books = res;
      this.applySearch(); // search is applied AFTER genre filter
    });
  }

  loadLoans() {
    this.finesService.getLoans({ userId: this.userId }).subscribe((res) => {
      this.loans = res ?? [];
    });
  }

  applySearch() {
    const q = this.search.trim().toLowerCase();

    this.filteredBooks = this.books.filter(
      (b) => b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q)
    );
  }

  getMyActiveLoan(bookId: number): LoanDto | undefined {
    return this.loans.find((l) => l.bookId === bookId && l.userId === this.userId && !l.returnDate);
  }

  // Loan borrowed
  isBorrowed(bookId: number): LoanDto | undefined {
    return this.loans.find(
      (l) =>
        l.bookId === bookId &&
        l.userId === this.userId && // ✅ IMPORTANT
        !l.returnDate
    );
  }

  borrow(book: Books) {
    const now = new Date();
    const due = new Date();
    due.setDate(now.getDate() + 7); // 👈 7 days borrowing period

    const dto: BorrowDto = {
      userId: this.userId,
      bookId: book.id,
      issueDate: now.toISOString(),
      dueDate: due.toISOString(),
    };

    this.finesService.borrow(dto).subscribe({
      next: () => {
        alert('Borrow request sent. Waiting for admin approval.');
        this.loadLoans();
      },
      error: (e) => alert(e.message),
    });
  }

  returnBook(loan: LoanDto) {
    const dto: ReturnDto = {
      loanId: loan.id,

      userId: this.userId,
    };

    this.finesService.returnLoan(dto).subscribe({
      next: () => {
        alert('Book returned successfully.');

        this.loadLoans();
      },

      error: (e) => alert(e.message),
    });
  }

  onGenreChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.genre = value;
  }

  applyFilter() {
    this.loadBooks();
  }

  clearFilter() {
    this.genre = 'All';
    this.loadBooks();
  }

  trackById(_index: number, item: Books): number {
    return item.id;
  }
}
