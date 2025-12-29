// src/app/app.module.ts (module bootstrapping standalone components)
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ManageBooksComponent } from './initial/admin-login/admin-portal/manage-books/manage-books'; // standalone
import { ManageUsersComponent } from './initial/admin-login/admin-portal/manage-users/manage-users'; // standalone
import { UserLoansComponent } from './initial/admin-login/admin-portal/user-loans/user-loans'; // standalone
import { routes } from './app.routes';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    // Standalone components are imported, not declared
    ManageBooksComponent,
    ManageUsersComponent,
    UserLoansComponent,
  ],
})
export class AppModule {}
