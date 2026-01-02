import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Make sure this path matches your project structure
import { API_BASE_URL } from '../api.config';
import { Books, BookDto } from '../Models/Books';

export interface AvailabilityAdjustDto {
  bookId: number;
  /**
   * Use -1 to decrement (issue/borrow), +1 to increment (return)
   */
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
  /**
   * Backend route: [Route("api/[controller]")] on BooksController -> /api/books
   *
   * If your API_BASE_URL ALREADY includes '/api' (e.g., https://localhost:5001/api),
   * keep this as '/books'. If not, change to `${API_BASE_URL}/api/books`.
   */
  private readonly baseUrl = `${API_BASE_URL}/books`;

  constructor(private http: HttpClient) {}

  /**
   * GET /api/books?genre=Fantasy (optional filter)
   * Returns list of books ordered by title.
   */
  getAll(genre?: string): Observable<Books[]> {
    let params = new HttpParams();
    if (genre && genre.trim().length > 0 && genre.trim().toLowerCase() != 'all') {
      params = params.set('genre', genre.trim());
    }
    return this.http.get<Books[]>(this.baseUrl, { params });
  }

  /**
   * GET /api/books/{id}
   */
  getById(id: number): Observable<Books> {
    return this.http.get<Books>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/books
   * Creates a new book; backend returns Created (201) with the created entity.
   */
  create(payload: BookDto): Observable<Books> {
    return this.http.post<Books>(this.baseUrl, payload);
  }

  /**
   * PUT /api/books/{id}
   * Updates the book; backend returns NoContent (204).
   * Your backend expects the full BookDto in the body (not partial).
   */
  update(id: number, payload: BookDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  /**
   * DELETE /api/books/{id}
   * Backend blocks deletion when there are active loans; returns 409 Conflict.
   * On success returns NoContent (204).
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/books/availability/adjust
   * Body: { bookId, delta }
   * Returns: { message, bookId, availableCopies }
   */
  adjustAvailability(dto: AvailabilityAdjustDto): Observable<AvailabilityResponse> {
    return this.http.post<AvailabilityResponse>(`${this.baseUrl}/availability/adjust`, dto);
  }

  /**
   * POST /api/books/availability/decrement/{bookId}
   * Returns: { message, availableCopies }
   */
  decrementAvailability(bookId: number): Observable<AvailabilityResponse> {
    return this.http.post<AvailabilityResponse>(
      `${this.baseUrl}/availability/decrement/${bookId}`,
      {}
    );
  }

  /**
   * POST /api/books/availability/increment/{bookId}
   * Returns: { message, availableCopies }
   */
  incrementAvailability(bookId: number): Observable<AvailabilityResponse> {
    return this.http.post<AvailabilityResponse>(
      `${this.baseUrl}/availability/increment/${bookId}`,
      {}
    );
  }
}
