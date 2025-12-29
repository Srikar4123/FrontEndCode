export interface FineLoan {
  id: number; // Fines.Id
  userId: number; // Fines.UserId (FK to Account)
  bookId: number; // Fines.BookId (FK to Books)
  issueDate: string; // ISO string (DateTime)
  dueDate: string; // ISO string (DateTime)
  returnDate?: string | null; // ISO string or null
  fineAmount: number; // decimal
  paymentStatus: boolean; // true if paid

  // Optional enrichments your API may include from joins:
  title?: string; // Book.title (from navigation)
  userName?: string; // Account.userName (from navigation)
}

// User borrow (self-service issue) payload
export interface BorrowDto {
  userId: number; // Account.Id with role User
  bookId: number; // Books.Id
  issueDate: string; // new Date().toISOString()
  dueDate: string; // new Date().toISOString()
}

// Admin issuing to a user payload (same as borrow + adminId)
export interface AdminIssueDto extends BorrowDto {
  adminId: number; // Account.Id with role Admin
}

// Return a book (finalize loan and compute fine)
export interface ReturnDto {
  loanId: number; // Fines.Id
}

// Pay fine for a loan
export interface PayFineDto {
  loanId: number; // Fines.Id
  amount: number; // amount to pay (>= fineAmount)
}
