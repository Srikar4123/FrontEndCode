import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs'; 
import { catchError } from 'rxjs/operators'; 
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
  private readonly baseUrl = `${API_BASE_URL}/fines`; 

  constructor(private readonly http: HttpClient) {}

  /*
     POST /api/fines/admin/issue
   */
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
        catchError((err) => {
          const msg = err?.error?.message ?? 'Issue failed'; 
          return throwError(() => new Error(msg));
        })
      );
  }

  /* 
     POST /api/fines/borrow
  */
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
        catchError((err) => {
          const msg = err?.error?.message ?? 'Borrow failed'; 
          return throwError(() => new Error(msg));
        })
      );
  }

  /* 
     POST /api/fines/return
   */
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
        catchError((err) => {
          const msg = err?.error?.message ?? 'Return failed'; 
          return throwError(() => new Error(msg));
        })
      );
  }

  /*
     POST /api/fines/pay
   */
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
        catchError((err) => {
          const msg = err?.error?.message ?? 'Payment failed'; 
          return throwError(() => new Error(msg));
        })
      );
  }

  /* 
     GET /api/fines/loans
  */
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
      catchError((err) => {
        const msg = err?.error?.message ?? 'Failed to load loans'; 
        return throwError(() => new Error(msg));
      })
    );
  }

  /* 
     GET /api/fines/user/{userId}/activeCount
   */
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
        catchError((err) => {
          const msg = err?.error?.message ?? 'Failed to get active count'; 
          return throwError(() => new Error(msg));
        })
      );
  }

  /* 
     GET /api/fines/user/{userId}/outstanding
   */
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
        catchError((err) => {
          const msg = err?.error?.message ?? 'Failed to get outstanding total'; 
          return throwError(() => new Error(msg));
        })
      );
  }
}
