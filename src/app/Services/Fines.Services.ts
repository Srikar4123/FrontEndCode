import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { FineLoan, BorrowDto, AdminIssueDto, ReturnDto, PayFineDto } from '../Models/Fines';

/**
 * Set this to your ASP.NET Core API base URL.
 * Example: 'https://localhost:5001' or 'http://localhost:5000'
 */
// const API_BASE = '${API_BASE_URL}/fines'; // TODO: change to your backend base URL

@Injectable({
  providedIn: 'root',
})
export class FinesService {
  private readonly baseUrl = `${API_BASE_URL}/api/fines`;

  constructor(private http: HttpClient) {}

  /**
   * POST /api/fines/admin/issue
   * Admin issues a book to a user.
   * Body: AdminIssueDto { adminId, userId, bookId, issueDate, dueDate }
   * Returns: { message, loanId, availableCopies }
   */
  adminIssue(dto: AdminIssueDto): Observable<{
    message: string;
    loanId: number;
    availableCopies: number;
  }> {
    return this.http.post<{ message: string; loanId: number; availableCopies: number }>(
      `${this.baseUrl}/admin/issue`,
      dto
    );
  }

  /**
   * POST /api/fines/borrow
   * User borrows a book.
   * Body: BorrowDto { userId, bookId, issueDate, dueDate }
   * Returns: { message, loanId, availableCopies }
   */
  borrow(dto: BorrowDto): Observable<{
    message: string;
    loanId: number;
    availableCopies: number;
  }> {
    return this.http.post<{ message: string; loanId: number; availableCopies: number }>(
      `${this.baseUrl}/borrow`,
      dto
    );
  }

  /**
   * POST /api/fines/return
   * User returns a book. Backend sets ReturnDate, computes fine.
   * Body: ReturnDto { loanId }
   * Returns: { message, fineAmount, availableCopies }
   */
  returnLoan(dto: ReturnDto): Observable<{
    message: string;
    fineAmount: number;
    availableCopies: number;
  }> {
    return this.http.post<{ message: string; fineAmount: number; availableCopies: number }>(
      `${this.baseUrl}/return`,
      dto
    );
  }

  /**
   * POST /api/fines/pay
   * Pay outstanding fine for a loan.
   * Body: PayFineDto { loanId, amount }
   * Returns: { message, loanId, paidAmount, paymentStatus }
   */
  payFine(dto: PayFineDto): Observable<{
    message: string;
    loanId: number;
    paidAmount: number;
    paymentStatus: boolean;
  }> {
    return this.http.post<{
      message: string;
      loanId: number;
      paidAmount: number;
      paymentStatus: boolean;
    }>(`${this.baseUrl}/pay`, dto);
  }

  /**
   * GET /api/fines/loans?userId=&onlyActive=&onlyUnpaid=&onlyOverdue=
   * Returns: FineLoan[] with optional enrichments (title, userName).
   */
  getLoans(params?: {
    userId?: number;
    onlyActive?: boolean;
    onlyUnpaid?: boolean;
    onlyOverdue?: boolean;
  }): Observable<FineLoan[]> {
    let httpParams = new HttpParams();

    if (typeof params?.userId === 'number') {
      httpParams = httpParams.set('userId', String(params.userId));
    }
    if (typeof params?.onlyActive === 'boolean') {
      httpParams = httpParams.set('onlyActive', String(params.onlyActive));
    }
    if (typeof params?.onlyUnpaid === 'boolean') {
      httpParams = httpParams.set('onlyUnpaid', String(params.onlyUnpaid));
    }
    if (typeof params?.onlyOverdue === 'boolean') {
      httpParams = httpParams.set('onlyOverdue', String(params.onlyOverdue));
    }

    return this.http.get<FineLoan[]>(`${this.baseUrl}/loans`, { params: httpParams });
  }

  /**
   * GET /api/fines/user/{userId}/activeCount
   * Returns: { userId, activeLoans, canBorrow }
   */
  getActiveCount(userId: number): Observable<{
    userId: number;
    activeLoans: number;
    canBorrow: boolean;
  }> {
    return this.http.get<{ userId: number; activeLoans: number; canBorrow: boolean }>(
      `${this.baseUrl}/user/${userId}/activeCount`
    );
  }

  /**
   * GET /api/fines/user/{userId}/outstanding
   * Returns: { userId, totalOutstanding }
   */
  getOutstanding(userId: number): Observable<{
    userId: number;
    totalOutstanding: number;
  }> {
    return this.http.get<{ userId: number; totalOutstanding: number }>(
      `${this.baseUrl}/user/${userId}/outstanding`
    );
  }
}
