import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowseBooksComponent } from './browse-books/browse-books';
// import { HistoryComponent } from './history/history';

@Component({
  selector: 'app-user-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, BrowseBooksComponent, RouterOutlet],
  templateUrl: './user-portal.html',
  styleUrls: ['./user-portal.css'],
})
export class UserPortal implements OnInit {
  // Simple variables for a fresher
  selectedMenu = 'dashboard';
  selectedSubMenu = 'books-search';
  sidebarOpen = true;
  searchText = '';

  // Dropdown states
  booksDropdownOpen = false;
  accountDropdownOpen = false;

  // User info
  userName = '';
  userEmail = '';
  userPhone = '';
  userRole = '';

  // Simple menu list with dropdowns
  menus = [
    {
      name: 'browse-books',
      title: 'Browse Books',
    },
    { name: 'history', title: 'History', hasDropdown: false },
  ];

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const storedAccount = localStorage.getItem('account');

      if (!storedAccount) {
        this.router.navigate(['/user-login']);

        return;
      }

      const account = JSON.parse(storedAccount);

      this.userName = account.userName;

      this.userEmail = account.email;

      this.userPhone = account.phoneNumber ?? '';
      // this.userRole = account.role;
      this.userRole = account.role === 1 ? 'Admin' : 'User';
    }
  }

  // Simple function to change menu
  changeMenu(menuName: string) {
    this.selectedMenu = menuName;
    if (menuName === 'history') {
      this.router.navigate(['/history']);
    }
  }

  // Simple function to toggle dropdowns
  toggleBooksDropdown() {
    this.booksDropdownOpen = !this.booksDropdownOpen;
    this.accountDropdownOpen = false; // Close other dropdown
    this.selectedMenu = 'browse-books';
  }

  toggleAccountDropdown() {
    this.accountDropdownOpen = !this.accountDropdownOpen;
    this.booksDropdownOpen = false; // Close other dropdown
    this.selectedMenu = 'my-account';
  }

  // Simple function to select sub menu
  selectSubMenu(subMenuName: string) {
    this.selectedSubMenu = subMenuName;
  }

  // Simple function to toggle sidebar
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    // Close dropdowns when sidebar closes
    if (!this.sidebarOpen) {
      this.booksDropdownOpen = false;
      this.accountDropdownOpen = false;
    }
  }

  // Simple function to go home
  goHome() {
    this.router.navigate(['/']);
  }

  // Simple function to logout
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('account');
    }

    this.router.navigate(['/user-login']);
  }

  // Simple function to get current page title
  getCurrentTitle(): string {
    if (this.selectedMenu === 'dashboard') {
      return 'Dashboard';
    }

    if (this.selectedMenu === 'browse-books') {
      return 'Browse Books';
    }

    if (this.selectedMenu === 'history') {
      return 'History';
    }

    for (let menu of this.menus) {
      if (menu.name === this.selectedMenu) {
        return menu.title;
      }
    }
    return 'Dashboard';
  }

  // Simple search function
  doSearch() {
    if (this.searchText.trim()) {
      console.log('User searching for:', this.searchText);
      // TODO: Add real search logic here
    }
  }

  // Simple function to clear search
  clearSearch() {
    this.searchText = '';
  }

  // Toggle search functionality
  toggleSearch() {
    console.log('Search clicked');
    // TODO: Add search modal or functionality
  }
}
