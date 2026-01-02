import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs'; // ✅ CHANGED: add throwError
import { catchError } from 'rxjs/operators'; // ✅ CHANGED: add catchError
import { API_BASE_URL } from '../api.config';
import {
  FineLoan,
  AdminIssueDto,
  BorrowDto,
  ReturnDto,
  PayFineDto,
  LoanDto,
} from '../Models/Fines';

@Injectable({
  providedIn: 'root',
})
export class FinesService {
  /**
   * If API_BASE_URL already includes '/api' (e.g., https://localhost:5001/api),
   * keep this as '/fines'. Otherwise change to `${API_BASE_URL}/api/fines`.
   */
  private readonly baseUrl = `${API_BASE_URL}/fines`; // ✅ keep or switch per your API_BASE_URL

  constructor(private readonly http: HttpClient) {}

  /* =====================================================
     ADMIN: Issue Book
     POST /api/fines/admin/issue
  ====================================================== */
  adminIssue(dto: AdminIssueDto): Observable<{
    message: string;
    loanId: number;
    availableCopies: number;
  }> {
    return this.http
      .post<{
        message: string;
        loanId: number;
        availableCopies: number;
      }>(`${this.baseUrl}/admin/issue`, dto)
      .pipe(
        // ✅ CHANGED: add .pipe(catchError(...))
        catchError((err) => {
          const msg = err?.error?.message ?? 'Issue failed'; // ✅ CHANGED: surface backend message
          return throwError(() => new Error(msg));
        })
      );
  }

  /* =====================================================
     USER: Borrow Book
     POST /api/fines/borrow
  ====================================================== */
  borrow(dto: BorrowDto): Observable<{
    message: string;
    loanId: number;
    availableCopies: number;
  }> {
    return this.http
      .post<{
        message: string;
        loanId: number;
        availableCopies: number;
      }>(`${this.baseUrl}/borrow`, dto)
      .pipe(
        // ✅ CHANGED: add .pipe(catchError(...))
        catchError((err) => {
          const msg = err?.error?.message ?? 'Borrow failed'; // ✅ CHANGED: surface backend message
          return throwError(() => new Error(msg));
        })
      );
  }

  /* =====================================================
     USER: Return Book
     POST /api/fines/return
  ====================================================== */
  returnLoan(dto: ReturnDto): Observable<{
    message: string;
    fineAmount: number;
    availableCopies: number;
  }> {
    return this.http
      .post<{
        message: string;
        fineAmount: number;
        availableCopies: number;
      }>(`${this.baseUrl}/return`, dto)
      .pipe(
        // ✅ CHANGED: add .pipe(catchError(...))
        catchError((err) => {
          const msg = err?.error?.message ?? 'Return failed'; // ✅ CHANGED: surface backend message
          return throwError(() => new Error(msg));
        })
      );
  }

  /* =====================================================
     USER: Pay Fine
     POST /api/fines/pay
  ====================================================== */
  payFine(dto: PayFineDto): Observable<{
    message: string;
    loanId: number;
    paidAmount: number;
    paymentStatus: boolean;
  }> {
    return this.http
      .post<{
        message: string;
        loanId: number;
        paidAmount: number;
        paymentStatus: boolean;
      }>(`${this.baseUrl}/pay`, dto)
      .pipe(
        // ✅ CHANGED: add .pipe(catchError(...))
        catchError((err) => {
          const msg = err?.error?.message ?? 'Payment failed'; // ✅ CHANGED: surface backend message
          return throwError(() => new Error(msg));
        })
      );
  }

  /* =====================================================
     VIEW LOANS / FINES (Admin + User)
     GET /api/fines/loans
     Supports filters:
     userId, bookId, onlyActive, onlyUnpaid, onlyOverdue
  ====================================================== */
  getLoans(params: {
    userId?: number;
    onlyActive?: boolean;
    onlyUnpaid?: boolean;
    onlyOverdue?: boolean;
  }): Observable<LoanDto[]> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) httpParams = httpParams.set(k, String(v));
    });
    return this.http.get<LoanDto[]>(`${this.baseUrl}/loans`, { params: httpParams }).pipe(
      // ✅ CHANGED
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to load loans'; // ✅ CHANGED
        return throwError(() => new Error(msg));
      })
    );
  }

  /* =====================================================
     USER: Active Loan Count
     GET /api/fines/user/{userId}/activeCount
  ====================================================== */
  getActiveCount(userId: number): Observable<{
    userId: number;
    activeLoans: number;
    canBorrow: boolean;
  }> {
    return this.http
      .get<{
        userId: number;
        activeLoans: number;
        canBorrow: boolean;
      }>(`${this.baseUrl}/user/${userId}/activeCount`)
      .pipe(
        // ✅ CHANGED
        catchError((err) => {
          const msg = err?.error?.message ?? 'Failed to get active count'; // ✅ CHANGED
          return throwError(() => new Error(msg));
        })
      );
  }

  /* =====================================================
     USER: Total Outstanding Fine
     GET /api/fines/user/{userId}/outstanding
  ====================================================== */
  getOutstanding(userId: number): Observable<{
    userId: number;
    totalOutstanding: number;
  }> {
    return this.http
      .get<{
        userId: number;
        totalOutstanding: number;
      }>(`${this.baseUrl}/user/${userId}/outstanding`)
      .pipe(
        // ✅ CHANGED
        catchError((err) => {
          const msg = err?.error?.message ?? 'Failed to get outstanding total'; // ✅ CHANGED
          return throwError(() => new Error(msg));
        })
      );
  }
}
