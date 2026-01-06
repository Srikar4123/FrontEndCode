import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-initial',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './initial.html',
  styleUrls: ['./initial.css'],
})
export class Initial {
  showAuthModal = false;

  constructor(private router: Router) {}

  // Navbar methods

  goAbout() {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  }

  goContact() {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  }

  // Login popup methods
  openLogin() {
    this.showAuthModal = true;
  }

  closeAuthModal() {
    this.showAuthModal = false;
  }

  // Navigation from popup
  goToUserLogin() {
    this.router.navigate(['/user-login']);
    this.closeAuthModal();
  }

  goToAdminLogin() {
    this.router.navigate(['/admin-login']);
    this.closeAuthModal();
  }
}
