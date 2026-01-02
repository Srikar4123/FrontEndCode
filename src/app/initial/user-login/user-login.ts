import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AccountsService } from '../../Services/Accounts.Services';
import { AccountRole } from '../../Models/Accounts';

@Component({
  selector: 'app-user-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './user-login.html',
  styleUrls: ['./user-login.css'],
  standalone: true,
})
export class UserLoginComponent implements OnInit, OnDestroy {
  // Simple toggle between login and register
  isExistingUser = true;

  // Login form fields
  email = '';
  password = '';

  // Registration form fields
  newName = '';
  newEmail = '';
  newPassword = '';
  confirmPassword = '';
  contactNumber = '';

  // Messages
  errorMessage = '';
  successMessage = '';

  // Show/hide password - simple feature
  showPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Image slideshow properties
  currentImageIndex = 0;
  slideInterval: any;

  // Library images for slideshow
  images = [
    {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
      alt: 'Modern Library Interior',
      title: 'Welcome to Our Library',
      description: 'Discover thousands of books and resources',
    },
    {
      url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
      alt: 'Library Books',
      title: 'Vast Collection',
      description: 'From classics to modern literature',
    },
    {
      url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=600&fit=crop',
      alt: 'Reading Space',
      title: 'Peaceful Reading',
      description: 'Quiet spaces for focused study',
    },
    {
      url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=600&fit=crop',
      alt: 'Digital Library',
      title: 'Digital Resources',
      description: 'Access books anytime, anywhere',
    },
  ];

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private accountsService: AccountsService
  ) {}
  // constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Start the slideshow with 2-second intervals
    this.startSlideshow();
  }

  ngOnDestroy() {
    // Clean up the interval when component is destroyed
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  startSlideshow() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 2000); // 2 seconds as requested
  }

  nextSlide() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

  goToSlide(index: number) {
    this.currentImageIndex = index;
    // Restart the slideshow timer when user manually clicks
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.startSlideshow();
    }
  }

  toggleMode() {
    this.isExistingUser = !this.isExistingUser;
    this.clearMessages();
    this.clearFields();
  }

  // Simple function to format phone number with +91
  formatPhoneNumber() {
    // Remove any non-digit characters
    let digits = this.contactNumber.replace(/\D/g, '');

    // If it starts with 91, remove it (we'll add +91 prefix)
    if (digits.startsWith('91') && digits.length > 10) {
      digits = digits.substring(2);
    }

    // Keep only first 10 digits
    if (digits.length > 10) {
      digits = digits.substring(0, 10);
    }

    // Update the contact number
    this.contactNumber = digits;
  }

  // Simple password validation function
  validatePassword(password: string): string {
    // Check length
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }

    // Check for capital letter
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least 1 capital letter';
    }

    // Check for special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least 1 special character';
    }

    return ''; // No error
  }

  // Simple function to toggle password visibility
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  login() {
    this.clearMessages();

    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password required';

      return;
    }

    this.accountsService.login(this.email.trim(), this.password).subscribe({
      next: (res) => {
        this.successMessage = 'Login successful! Redirecting...';

        localStorage.setItem('account', JSON.stringify(res));

        setTimeout(() => {
          if (res.role === 1) {
            // Admin
            this.router.navigate(['/admin-portal']);
          } else {
            // User
            this.router.navigate(['/user-portal']);
          }
        }, 500);
      },

      error: (err) => {
        console.log('FULL ERROR:', err);
        this.errorMessage = err.error?.message || JSON.stringify(err.error) || 'Server error';
      },
    });
  }

  register() {
    this.clearMessages();

    if (
      !this.newName ||
      !this.newEmail ||
      !this.newPassword ||
      !this.confirmPassword ||
      !this.contactNumber
    ) {
      this.errorMessage = 'All fields required';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    const dto = {
      userName: this.newName.trim(),
      email: this.newEmail.trim(),
      password: this.newPassword,
      phoneNumber: '+91' + this.contactNumber,
      role: AccountRole.User,
      isActive: true,
    };

    this.accountsService.create(dto).subscribe({
      next: () => {
        this.successMessage = 'Account created successfully!';

        setTimeout(() => {
          this.isExistingUser = true;
          this.clearFields();
          this.cdr.detectChanges();
        }, 1500);
      },

      error: (err) => {
        if (err.status === 409) {
          this.errorMessage = 'Email or phone already exists';
        } else {
          this.errorMessage = 'Registration failed. Try again.';
        }
      },
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  clearFields() {
    this.email = '';
    this.password = '';
    this.newName = '';
    this.newEmail = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.contactNumber = '';
    // Reset password visibility
    this.showPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }
}
