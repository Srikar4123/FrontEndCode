import { Routes } from '@angular/router';
import { Initial } from './initial/initial';
import { AdminLogin } from './initial/admin-login/admin-login';
import { UserLoginComponent } from './initial/user-login/user-login';
import { UserPortal } from './initial/user-login/user-portal/user-portal';
import { AdminPortal } from './initial/admin-login/admin-portal/admin-portal';
import { ManageBooksComponent } from './initial/admin-login/admin-portal/manage-books/manage-books';
import { ManageUsersComponent } from './initial/admin-login/admin-portal/manage-users/manage-users';
import { UserLoansComponent } from './initial/admin-login/admin-portal/user-loans/user-loans';

export const routes: Routes = [
  { path: '', component: Initial },
  { path: 'manage-books', component: ManageBooksComponent },
  { path: 'manage-users', component: ManageUsersComponent },
  { path: 'admin/users/:id/loans', component: UserLoansComponent }, // target route
  { path: '', redirectTo: 'admin/manage-users', pathMatch: 'full' },

  { path: 'admin-login', component: AdminLogin },
  { path: 'user-login', component: UserLoginComponent },
  { path: 'user-portal', component: UserPortal },
  { path: 'admin-portal', component: AdminPortal },
  { path: '**', redirectTo: '' },
];
