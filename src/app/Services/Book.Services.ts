import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { Books, BookDto } from '../Models/Books';

export interface AvailabilityAdjustDto {
  bookId: number;
  
  delta: number;
}

export interface AvailabilityResponse {
  message: string;
  bookId?: number;
  availableCopies: number;
}

@Injectable({
  providedIn: 'root',
})
export class BooksService {
  private readonly baseUrl = `${API_BASE_URL}/books`;

  constructor(private http: HttpClient) {}

  /*GET /api/books?genre=Fantasy */
  getAll(genre?: string): Observable<Books[]> {
    let params = new HttpParams();
    if (genre && genre.trim().length > 0 && genre.trim().toLowerCase() != 'all') {
      params = params.set('genre', genre.trim());
    }
    return this.http.get<Books[]>(this.baseUrl, { params });
  }

  /*
   * GET /api/books/{id}
   */
  getById(id: number): Observable<Books> {
    return this.http.get<Books>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/books
   */
  create(payload: BookDto): Observable<Books> {
    return this.http.post<Books>(this.baseUrl, payload);
  }

  /*
   * PUT /api/books/{id}
   */
  update(id: number, payload: BookDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  /*
   * DELETE /api/books/{id}
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /*
   * POST /api/books/availability/adjust
   */
  adjustAvailability(dto: AvailabilityAdjustDto): Observable<AvailabilityResponse> {
    return this.http.post<AvailabilityResponse>(`${this.baseUrl}/availability/adjust`, dto);
  }

  /*
   * POST /api/books/availability/decrement/{bookId}
   */
  decrementAvailability(bookId: number): Observable<AvailabilityResponse> {
    return this.http.post<AvailabilityResponse>(
      `${this.baseUrl}/availability/decrement/${bookId}`,
      {}
    );
  }

  /*
   * POST /api/books/availability/increment/{bookId}
   */
  incrementAvailability(bookId: number): Observable<AvailabilityResponse> {
    return this.http.post<AvailabilityResponse>(
      `${this.baseUrl}/availability/increment/${bookId}`,
      {}
    );
  }
}
