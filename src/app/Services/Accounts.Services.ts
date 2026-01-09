import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { Account, AccountCreateDto, AccountUpdateDto, AccountRole } from '../Models/Accounts';



@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private readonly baseUrl = `${API_BASE_URL}/Accounts`;

  constructor(private http: HttpClient) {}


  getAll(params?: {
    role?: AccountRole | string;
    search?: string;
    sort?: { by: 'role' | 'id' | string; dir: 'asc' | 'desc' }[];
  }): Observable<Account[]> {
    let httpParams = new HttpParams();

    // 'Admin' or 'User'
    if (params?.role !== undefined && params.role !== null) {
      const roleString = typeof params.role === 'string' ? params.role : AccountRole[params.role]; 
      if (roleString && roleString.trim().length > 0) {
        httpParams = httpParams.set('role', roleString.trim());
      }
    }

    // Existing: search
    if (params?.search && params.search.trim().length > 0) {
      httpParams = httpParams.set('search', params.search.trim());
    }

  
    if (params?.sort && params.sort.length > 0) {
      const sortParam = params.sort.map((s) => `${s.by}.${s.dir}`).join(',');
      httpParams = httpParams.set('sort', sortParam);
    } else {
  
      const hasRoleFilter = params?.role !== undefined && params?.role !== null;
      const defaultSort = hasRoleFilter ? 'id.asc' : 'role.asc,id.asc';
      httpParams = httpParams.set('sort', defaultSort);
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
   */
  create(payload: AccountCreateDto): Observable<Account> {
    return this.http.post<Account>(this.baseUrl, payload);
  }

  /**
   * PUT /api/accounts/{id}
   */
  update(id: number, payload: AccountUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  /**
   * DELETE /api/accounts/{id}
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/accounts/{id}/deactivate
   */
  deactivate(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  activate(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${id}/activate`, {});
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/login`, {
      email,
      password,
    });
  }
}
