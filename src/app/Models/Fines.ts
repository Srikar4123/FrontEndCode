export interface FineLoan {
  id: number;
  userId: number;
  userName: string;
  bookId: number;
  title: string | null;
  issueDate: string; 
  dueDate: string; 
  returnDate: string | null; 
  fineAmount: number;
  paymentStatus: boolean;
}

/* ---------- DTOs ---------- */

export interface AdminIssueDto {
  adminId: number;
  userId: number;
  bookId: number;
  issueDate: string;
  dueDate: string;
}

export interface BorrowDto {
  userId: number;
  bookId: number;
  issueDate: string;
  dueDate: string;
}

export interface ReturnDto {
  loanId: number;
  userId: number;
}

export interface PayFineDto {
  loanId: number;
  amount: number;
}

export interface LoanDto {
  id: number;
  userId: number;
  userName?: string;
  bookId: number; 
  title?: string; 
  issueDate: string; 
  dueDate: string;
  returnDate?: string | null;
  fineAmount: number;
  paymentStatus: boolean; 
}
