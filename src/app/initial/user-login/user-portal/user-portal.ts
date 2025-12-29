import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-portal',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-portal.html',
  styleUrl: './user-portal.css',
  standalone: true
})
export class UserPortal {
  // Simple variables for a fresher
  selectedMenu = 'dashboard';
  selectedSubMenu = 'books-search';
  sidebarOpen = true;
  searchText = '';
  
  // Dropdown states
  booksDropdownOpen = false;
  accountDropdownOpen = false;
  
  // User info
  userName = 'John Doe';
  userEmail = 'user@symple';
  userPhone = '+91 ********';
  
  // Simple menu list with dropdowns
  menus = [
    { 
      name: 'browse-books', 
      title: 'Browse Books',
      hasDropdown: true,
      subMenus: [
        { name: 'books-search', title: 'Search Books' },
        { name: 'books-categories', title: 'Categories' },
        { name: 'books-new', title: 'New Arrivals' },
        { name: 'books-popular', title: 'Popular Books' }
      ]
    },
    { 
      name: 'my-account', 
      title: 'My Account',
      hasDropdown: true,
      subMenus: [
        { name: 'account-profile', title: 'My Profile' },
        { name: 'account-borrowed', title: 'Borrowed Books' },
        { name: 'account-history', title: 'Reading History' },
        { name: 'account-settings', title: 'Settings' }
      ]
    },
    { name: 'history', title: 'History', hasDropdown: false },
    { name: 'wishlist', title: 'Wishlist', hasDropdown: false },
    { name: 'notifications', title: 'Notifications', hasDropdown: false }
  ];

  constructor(private router: Router) {}

  // Simple function to change menu
  changeMenu(menuName: string) {
    this.selectedMenu = menuName;
    
    // Close all dropdowns when selecting a different menu
    if (menuName !== 'browse-books') {
      this.booksDropdownOpen = false;
    }
    if (menuName !== 'my-account') {
      this.accountDropdownOpen = false;
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
    this.router.navigate(['/user-login']);
  }

  // Simple function to get current page title
  getCurrentTitle() {
    // Check if we have a submenu selected
    if (this.selectedMenu === 'browse-books' || this.selectedMenu === 'my-account') {
      for (let menu of this.menus) {
        if (menu.name === this.selectedMenu && menu.subMenus) {
          for (let subMenu of menu.subMenus) {
            if (subMenu.name === this.selectedSubMenu) {
              return subMenu.title;
            }
          }
        }
      }
    }
    
    // Default menu title
    if (this.selectedMenu === 'dashboard') {
      return 'Dashboard';
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