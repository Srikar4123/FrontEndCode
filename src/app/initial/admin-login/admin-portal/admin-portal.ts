import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManageBooksComponent } from './manage-books/manage-books';

@Component({
  selector: 'app-admin-portal',
  imports: [CommonModule, FormsModule, ManageBooksComponent],
  templateUrl: './admin-portal.html',
  styleUrl: './admin-portal.css',
  standalone: true,
})
export class AdminPortal {
  // Simple variables for a fresher
  selectedMenu = 'dashboard';
  selectedSubMenu = 'books-add';
  sidebarOpen = true;
  searchText = '';

  // Dropdown states
  booksDropdownOpen = false;
  usersDropdownOpen = false;

  // Admin user info
  adminName = 'Admin User';
  adminEmail = 'admin@Symplr';
  adminPhone = '+91 ********';

  // Simple menu list with dropdowns
  menus = [
    {
      name: 'manage-books',
      title: 'Manage Books',
      // hasDropdown: true,
      // subMenus: [
      //   { name: 'books-add', title: 'Add Books' },
      //   { name: 'books-update', title: 'Update Books' },
      //   { name: 'books-delete', title: 'Delete Books' },
      //   { name: 'books-read', title: 'View Books' },
      // ],
    },
    {
      name: 'manage-users',
      title: 'Manage Users',
      hasDropdown: true,
      subMenus: [
        { name: 'users-add', title: 'Add Users' },
        { name: 'users-update', title: 'Update Users' },
        { name: 'users-delete', title: 'Delete Users' },
        { name: 'users-read', title: 'View Users' },
      ],
    },
    { name: 'history', title: 'History', hasDropdown: false },
    { name: 'reports', title: 'Reports', hasDropdown: false },
    { name: 'settings', title: 'Settings', hasDropdown: false },
  ];

  constructor(private router: Router) {}

  // Simple function to change menu
  changeMenu(menuName: string) {
    this.selectedMenu = menuName;

    // Close all dropdowns when selecting a different menu
    if (menuName !== 'manage-books') {
      this.booksDropdownOpen = false;
    }
    if (menuName !== 'manage-users') {
      this.usersDropdownOpen = false;
    }
  }

  // Simple function to toggle dropdowns
  toggleBooksDropdown() {
    // this.booksDropdownOpen = !this.booksDropdownOpen;
    // this.usersDropdownOpen = false; // Close other dropdown
    this.selectedMenu = 'manage-books';
  }

  toggleUsersDropdown() {
    this.usersDropdownOpen = !this.usersDropdownOpen;
    this.booksDropdownOpen = false; // Close other dropdown
    this.selectedMenu = 'manage-users';
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
      this.usersDropdownOpen = false;
    }
  }

  // Simple function to go home
  goHome() {
    this.router.navigate(['/']);
  }

  // Simple function to logout
  logout() {
    this.router.navigate(['/admin-login']);
  }

  // Simple function to get current page title
  getCurrentTitle() {
    // Check if we have a submenu selected
    if (this.selectedMenu === 'manage-books' || this.selectedMenu === 'manage-users') {
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
      console.log('Admin searching for:', this.searchText);
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
