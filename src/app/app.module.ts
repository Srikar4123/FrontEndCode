import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ManageBooksComponent } from './initial/admin-login/admin-portal/manage-books/manage-books';
import { NgModule } from '@angular/core';
// ...

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule, // for BooksService
    FormsModule, // for [(ngModel)] genre filter
    ReactiveFormsModule,
    ManageBooksComponent, // for create/edit forms
    // AppRoutingModule…
  ],
  //   bootstrap: [
  //     /* AppComponent */
  //   ],
})
export class AppModule {}
