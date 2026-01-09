export enum AccountRole {
  User = 0,
  Admin = 1,
}

export interface Account {
  id: number;
  userName: string;
  email: string;
  password: string; 
  phoneNumber: string;
  role: AccountRole; 
  isActive: boolean; 
  createdAt: string; 
}

//DTOs
export interface AccountCreateDto {
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: AccountRole;
  isActive?: boolean; 
}

export interface AccountUpdateDto {
  userName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: AccountRole;
  isActive: boolean; 
}
