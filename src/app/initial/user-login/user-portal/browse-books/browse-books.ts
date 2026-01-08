import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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
  selectedGenre = 'All';

  yearRanges = [
    { label: 'All', value: 'all' },
    { label: 'Before 2000', value: 'before-2000' },
    { label: '2000 – 2009', value: '2000-2009' },
    { label: '2010 – 2019', value: '2010-2019' },
    { label: '2020 – Present', value: '2020-present' },
  ];

  selectedYearRange: string = 'all';

  genres: string[] = ['All'];
  search = '';
  userId!: number;
  loading = false;

  @ViewChild('yearFilter') yearFilter?: ElementRef<HTMLDetailsElement>;
  @ViewChild('genreFilter') genreFilter?: ElementRef<HTMLDetailsElement>;

  constructor(
    private booksService: BooksService,

    private finesService: FinesService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private buildGenres(): void {
    const set = new Set<string>();

    this.books.forEach((b) => {
      if (b.genre && b.genre.trim()) {
        set.add(b.genre.trim());
      }
    });

    this.genres = ['All', ...Array.from(set).sort()];
  }

  matchesYear(year: number | string | null): boolean {
    if (!year || this.selectedYearRange === 'all') return true;

    const y = Number(year);

    switch (this.selectedYearRange) {
      case 'before-2000':
        return y < 2000;
      case '2000-2009':
        return y >= 2000 && y <= 2009;
      case '2010-2019':
        return y >= 2010 && y <= 2019;
      case '2020-present':
        return y >= 2020;
      default:
        return true;
    }
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; 
    }
    const raw = localStorage.getItem('account');
    if (raw) {
      this.userId = JSON.parse(raw).id;
      this.loadLoans();
    }
    this.loadBooks();
  }


  loadBooks() {
    this.loading = true; 
    this.booksService.getAll(undefined).subscribe({
      next: (res) => {
        this.books = res ?? [];
        this.buildGenres();
        this.applyFilters(); 
        this.loading = false; 
      },
      error: (err) => {
        console.error(err);
        this.books = [];
        this.filteredBooks = [];
        this.loading = false;
      },
    });
  }

  applyFilters() {
    const q = this.search.trim().toLowerCase();

    this.filteredBooks = this.books.filter((b) => {
      const matchesSearch =
        !q || b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q);

      const matchesGenre = this.genre === 'All' || b.genre === this.genre;

      const matchesYear = this.matchesYear(b.publishedYear);

      return matchesSearch && matchesGenre && matchesYear;
    });
  }

  closeGenreFilter(): void {
    if (this.genreFilter?.nativeElement?.open) {
      this.genreFilter.nativeElement.open = false;
    }
  }

  onYearChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedYearRange = select.value;
  }

  applyYearFilter() {
    this.applyFilters();
  }

  clearYearFilter() {
    this.selectedYearRange = 'all';
    this.applyFilters();
  }

  closeYearFilter(): void {
    if (this.yearFilter?.nativeElement?.open) {
      this.yearFilter.nativeElement.open = false;
    }
  }

  loadLoans() {
    this.finesService.getLoans({ userId: this.userId, onlyActive: true }).subscribe({
      next: (res) => {
        this.loans = res ?? [];
      },
      error: (err) => alert(err.message),
    });
  }


  applySearch() {
    this.applyFilters();
  }

  // number of active loans for this user
  get activeLoanCount(): number {
    return this.loans.filter((l) => l.userId === this.userId && !l.returnDate).length;
  }

  // can the user borrow more
  canBorrowMore(): boolean {
    return this.activeLoanCount < 2;
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
      next: (res) => {
        alert('Book borrowed successfully.');

        // updating book availability
        const book = this.books.find((b) => b.id === dto.bookId);
        if (book) {
          book.availableCopies -= 1;
        }

        // adding the loan 
        this.loans = [
          ...this.loans,
          {
            id: res.loanId,
            userId: this.userId,
            bookId: dto.bookId,
            issueDate: dto.issueDate,
            dueDate: dto.dueDate,
            returnDate: null,
            fineAmount: 0,
            paymentStatus: false,
          },
        ];

        this.filteredBooks = [...this.books];

        this.cdr.detectChanges();
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
        this.loans = this.loans.map((l) =>
          l.id === loan.id ? { ...l, returnDate: new Date().toISOString() } : l
        );

        const book = this.books.find((b) => b.id === loan.bookId);
        if (book) {
          book.availableCopies += 1;
        }

        this.filteredBooks = [...this.books];

        this.cdr.detectChanges();
      },

      error: (e) => alert(e.message),
    });
  }

  onGenreChange(event: Event) {
    this.selectedGenre = (event.target as HTMLSelectElement).value;
  }

  applyFilter() {
    this.genre = this.selectedGenre;
    this.applyFilters();
  }

  clearFilter() {
    this.selectedGenre = 'All';
    this.genre = 'All';
    this.search = '';
    this.applyFilters();
  }

  trackById(_index: number, item: Books): number {
    return item.id;
  }

}
