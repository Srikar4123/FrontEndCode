import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { Account, AccountCreateDto, AccountUpdateDto, AccountRole } from '../Models/Accounts';

/**
 * Set this to your ASP.NET Core API base URL.
 * Example: 'https://localhost:5001' or 'http://localhost:5000'
 */
// const API_BASE = 'https://localhost:5001'; // TODO: change to your backend base URL

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private readonly baseUrl = `${API_BASE_URL}/api/accounts`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/accounts?role=Admin&search=kapya (both optional)
   * role must be one of: 'User' | 'Admin' (case-insensitive)
   */
  getAll(params?: { role?: AccountRole | string; search?: string }): Observable<Account[]> {
    let httpParams = new HttpParams();

    if (params?.role !== undefined && params.role !== null) {
      // Controller expects role as string for Enum.TryParse (e.g., 'Admin' or 'User')
      const roleString = typeof params.role === 'string' ? params.role : AccountRole[params.role]; // convert enum number -> name
      if (roleString && roleString.trim().length > 0) {
        httpParams = httpParams.set('role', roleString.trim());
      }
    }

    if (params?.search && params.search.trim().length > 0) {
      httpParams = httpParams.set('search', params.search.trim());
    }

    return this.http.get<Account[]>(this.baseUrl, { params: httpParams });
  }

  /**
   * GET /api/accounts/{id}
   */
  getById(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/accounts
   * Backend pre-checks email/phone duplicates.
   * Returns 201 Created with created entity.
   */
  create(payload: AccountCreateDto): Observable<Account> {
    return this.http.post<Account>(this.baseUrl, payload);
  }

  /**
   * PUT /api/accounts/{id}
   * Duplicate check excludes current account; returns 409 Conflict if duplicate.
   * Returns 204 NoContent on success.
   */
  update(id: number, payload: AccountUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  /**
   * DELETE /api/accounts/{id}
   * Returns 204 NoContent.
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/accounts/{id}/deactivate
   * Returns: { message: "Account deactivated." }
   */
  deactivate(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
