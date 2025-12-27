export enum AccountRole {
  User = 0,
  Admin = 1,
}

export interface Account {
  id: number;
  userName: string;
  email: string;
  password: string; // NOTE: in production, don't send/store plaintext; use auth tokens/JWT
  phoneNumber: string;
  role: AccountRole; // 0=User, 1=Admin
  isActive: boolean; // backend default: true
  createdAt: string; // ISO string from backend (DateTime.UtcNow)
}

/**
 * DTOs for create/update.
 * - On create: backend will set createdAt automatically; you don't need to send it.
 * - isActive: we default to true on create unless toggled in UI.
 */
export interface AccountCreateDto {
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: AccountRole;
  isActive?: boolean; // optional; backend defaults true if omitted
}

export interface AccountUpdateDto {
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: AccountRole;
  isActive: boolean; // required for update (since you can toggle active/inactive)
}
